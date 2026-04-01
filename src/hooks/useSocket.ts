import { useEffect, useRef } from 'react'
import { SocketClient } from '../services/socket/SocketClient'
import { SocketHandler } from '../services/socket/SocketHandler'
import { SocketEmitter } from '../services/socket/SocketEmitter'
import { useSessionStore } from '../store/sessionStore'

export function useSocket(boardId: string, userId: string) {
  const clientRef = useRef<SocketClient | null>(null)
  const handlerRef = useRef<SocketHandler | null>(null)
  const emitterRef = useRef<SocketEmitter | null>(null)
  const setConnectionState = useSessionStore((s) => s.setConnectionState)

  useEffect(() => {
    // Try to connect, but don't crash if server is not running
    try {
      const client = new SocketClient(setConnectionState)
      const socket = client.connect('http://localhost:3001', boardId, userId)

      const handler = new SocketHandler(socket)
      const emitter = new SocketEmitter(socket)

      clientRef.current = client
      handlerRef.current = handler
      emitterRef.current = emitter

      return () => {
        handler.destroy()
        client.disconnect()
      }
    } catch (error) {
      console.log('Socket connection failed - working in offline mode')
      setConnectionState('disconnected')
    }
  }, [boardId, userId, setConnectionState])

  return emitterRef.current
}
