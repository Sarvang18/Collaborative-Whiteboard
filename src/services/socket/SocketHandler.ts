import { Socket } from 'socket.io-client'
import { Operation } from '../../types/operations'
import { useCanvasStore } from '../../store/canvasStore'
import { useSessionStore } from '../../store/sessionStore'

export class SocketHandler {
  constructor(private socket: Socket) {
    this.setupListeners()
  }

  private setupListeners() {
    this.socket.on('operation', (op: Operation) => {
      this.handleOperation(op)
    })

    this.socket.on('operations_batch', (ops: Operation[]) => {
      ops.forEach((op) => this.handleOperation(op))
    })

    this.socket.on('cursor_move', ({ userId, x, y }: any) => {
      useSessionStore.getState().updateCollaborator(userId, {
        cursor: { x, y },
      })
    })

    this.socket.on('user_joined', ({ user, color }: any) => {
      useSessionStore.getState().updateCollaborator(user.id, {
        user,
        color,
        cursor: null,
        activeEl: null,
      })
    })

    this.socket.on('user_left', ({ userId }: any) => {
      useSessionStore.getState().removeCollaborator(userId)
    })

    this.socket.on('board_state', ({ elements }: any) => {
      const store = useCanvasStore.getState()
      store.clearBoard()
      elements.forEach((el: any) => store.addElement(el))
    })
  }

  private handleOperation(op: Operation) {
    const store = useCanvasStore.getState()

    switch (op.type) {
      case 'ELEMENT_ADD':
        store.addElement((op.payload as any).element)
        break
      case 'ELEMENT_UPDATE':
        const { id, changes } = op.payload as any
        store.updateElement(id, changes)
        break
      case 'ELEMENT_DELETE':
        store.deleteElements((op.payload as any).ids)
        break
    }
  }

  destroy() {
    this.socket.removeAllListeners()
  }
}
