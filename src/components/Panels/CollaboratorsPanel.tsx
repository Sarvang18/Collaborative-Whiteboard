import { useSessionStore } from '../../store/sessionStore'
import './CollaboratorsPanel.css'

export function CollaboratorsPanel() {
  const collaborators = useSessionStore((s) => s.collaborators)
  const connectionState = useSessionStore((s) => s.connectionState)

  return (
    <div className="collaborators-panel">
      <div className="connection-status" data-status={connectionState}>
        {connectionState === 'connected' && '🟢'}
        {connectionState === 'connecting' && '🟡'}
        {connectionState === 'disconnected' && '🔴'}
        {connectionState === 'reconnecting' && '🟠'}
        {connectionState === 'failed' && '❌'}
      </div>
      <div className="collaborators-list">
        {Array.from(collaborators.values()).map((collab) => (
          <div
            key={collab.user.id}
            className="collaborator-avatar"
            style={{ background: collab.color }}
            title={collab.user.name}
          >
            {collab.user.name.charAt(0).toUpperCase()}
          </div>
        ))}
      </div>
    </div>
  )
}
