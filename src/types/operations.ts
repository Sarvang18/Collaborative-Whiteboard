import { CanvasElement } from './shapes'

export type OpType =
  | 'ELEMENT_ADD'
  | 'ELEMENT_UPDATE'
  | 'ELEMENT_DELETE'
  | 'ELEMENT_LOCK'
  | 'CURSOR_MOVE'
  | 'SELECTION_CHANGE'
  | 'BOARD_RESET'

export interface Operation {
  id: string
  boardId: string
  userId: string
  socketId: string
  type: OpType
  payload: unknown
  timestamp: number
  version: number
}

export interface ElementAddPayload {
  element: CanvasElement
}

export interface ElementUpdatePayload {
  id: string
  changes: Partial<CanvasElement>
}

export interface ElementDeletePayload {
  ids: string[]
}

export interface CursorMovePayload {
  x: number
  y: number
}

export interface SelectionChangePayload {
  selectedIds: string[]
}
