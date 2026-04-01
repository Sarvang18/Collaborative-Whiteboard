import { io, Socket } from 'socket.io-client'
import { ConnectionState } from '../../types/session'

export class SocketClient {
  private socket: Socket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private onStateChange: (state: ConnectionState) => void

  constructor(onStateChange: (state: ConnectionState) => void) {
    this.onStateChange = onStateChange
  }

  connect(url: string, boardId: string, userId: string) {
    this.onStateChange('connecting')

    this.socket = io(url, {
      query: { boardId, userId },
      transports: ['websocket'],
    })

    this.socket.on('connect', () => {
      this.reconnectAttempts = 0
      this.onStateChange('connected')
    })

    this.socket.on('disconnect', () => {
      this.onStateChange('disconnected')
    })

    this.socket.on('connect_error', () => {
      this.reconnectAttempts++
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        this.onStateChange('failed')
      } else {
        this.onStateChange('reconnecting')
      }
    })

    return this.socket
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }

  getSocket() {
    return this.socket
  }
}
