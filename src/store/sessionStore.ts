import { create } from 'zustand'
import { User, CollaboratorState, ConnectionState } from '../types/session'

interface SessionState {
  currentUser: User | null
  collaborators: Map<string, CollaboratorState>
  connectionState: ConnectionState

  setCurrentUser: (user: User) => void
  updateCollaborator: (userId: string, state: Partial<CollaboratorState>) => void
  removeCollaborator: (userId: string) => void
  setConnectionState: (state: ConnectionState) => void
}

export const useSessionStore = create<SessionState>((set) => ({
  currentUser: null,
  collaborators: new Map(),
  connectionState: 'disconnected',

  setCurrentUser: (user) => set({ currentUser: user }),

  updateCollaborator: (userId, updates) =>
    set((state) => {
      const next = new Map(state.collaborators)
      const existing = next.get(userId)
      if (existing) {
        next.set(userId, { ...existing, ...updates })
      } else {
        next.set(userId, {
          user: { id: userId, name: 'Unknown' },
          cursor: null,
          color: '#000',
          activeEl: null,
          ...updates,
        } as CollaboratorState)
      }
      return { collaborators: next }
    }),

  removeCollaborator: (userId) =>
    set((state) => {
      const next = new Map(state.collaborators)
      next.delete(userId)
      return { collaborators: next }
    }),

  setConnectionState: (connectionState) => set({ connectionState }),
}))
