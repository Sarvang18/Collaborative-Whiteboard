import { Socket } from 'socket.io-client'
import { Operation } from '../../types/operations'

export class SocketEmitter {
  constructor(private socket: Socket) {}

  emitOperation(op: Operation) {
    this.socket.emit('operation', op)
  }

  emitOperationsBatch(ops: Operation[]) {
    this.socket.emit('operations_batch', ops)
  }

  emitCursorMove(x: number, y: number) {
    this.socket.emit('cursor_move', { x, y })
  }

  emitSelectionChange(selectedIds: string[]) {
    this.socket.emit('selection_change', { selectedIds })
  }
}
