import { Point } from './shapes'

export interface User {
  id: string
  name: string
  avatar?: string
}

export interface CollaboratorState {
  user: User
  cursor: Point | null
  color: string
  activeEl: string | null
}

export type ConnectionState =
  | 'connecting'
  | 'connected'
  | 'disconnected'
  | 'reconnecting'
  | 'failed'
