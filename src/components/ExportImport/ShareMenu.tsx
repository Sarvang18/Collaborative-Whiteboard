import { useState } from 'react'
import { useCanvasStore } from '../../store/canvasStore'
import { useConnectorStore } from '../../store/connectorStore'
import { ShareService, SharePermission } from '../../services/ShareService'
import './ShareMenu.css'

export function ShareMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const [shareLink, setShareLink] = useState('')
  const [permission, setPermission] = useState<SharePermission>('view')
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)

  const boardId = useCanvasStore((s) => s.boardId)
  const elements = useCanvasStore((s) => s.elements)
  const boards = useCanvasStore((s) => s.boards)
  const connectors = useConnectorStore((s) => s.connectors)

  const currentBoard = boards.get(boardId)
  const boardName = currentBoard?.name || 'Untitled Board'

  const handleGenerateLink = async () => {
    if (elements.size === 0) {
      alert('Nothing to share! Add some elements first.')
      return
    }

    console.log('=== GENERATING SHARE LINK ===')
    console.log('Selected permission:', permission)
    
    // Reset previous link
    setShareLink('')
    setCopied(false)
    
    setLoading(true)
    try {
      const link = await ShareService.generateShareLink(boardId, boardName, elements, connectors, permission)
      console.log('Generated link:', link)
      setShareLink(link)
    } catch (error) {
      alert('Failed to generate share link. Make sure the server is running.')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleCopyLink = async () => {
    const success = await ShareService.copyShareLink(shareLink)
    if (success) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } else {
      alert('Failed to copy link')
    }
  }

  return (
    <div className="share-menu">
      <button className="share-button" onClick={() => setIsOpen(!isOpen)} title="Share">
        🔗 Share
      </button>

      {isOpen && (
        <div className="share-dropdown">
          <div className="share-header">
            <h3>Share Board</h3>
            <button className="share-close" onClick={() => setIsOpen(false)}>
              ✕
            </button>
          </div>

          <div className="share-content">
            <div className="share-section">
              <label className="share-label">Permission</label>
              <div className="share-permissions">
                <button
                  className={`permission-btn ${permission === 'view' ? 'active' : ''}`}
                  onClick={() => {
                    setPermission('view')
                    setShareLink('') // Reset link when permission changes
                  }}
                >
                  👁️ View Only
                </button>
                <button
                  className={`permission-btn ${permission === 'edit' ? 'active' : ''}`}
                  onClick={() => {
                    setPermission('edit')
                    setShareLink('') // Reset link when permission changes
                  }}
                >
                  ✏️ Can Edit
                </button>
              </div>
              <p style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
                Current: {permission === 'view' ? '👁️ View Only' : '✏️ Can Edit'}
              </p>
            </div>

            {!shareLink ? (
              <button className="generate-btn" onClick={handleGenerateLink} disabled={loading}>
                {loading ? 'Generating...' : `Generate ${permission === 'view' ? 'View-Only' : 'Editable'} Link`}
              </button>
            ) : (
              <div className="share-link-section">
                <div className="share-link-box">
                  <input type="text" value={shareLink} readOnly className="share-link-input" />
                  <button className="copy-btn" onClick={handleCopyLink}>
                    {copied ? '✓ Copied!' : '📋 Copy'}
                  </button>
                </div>
                <p className="share-hint">
                  {permission === 'view' 
                    ? '👁️ This is a VIEW-ONLY link. Recipients can only view the board.' 
                    : '✏️ This is an EDITABLE link. Recipients can edit the board.'}
                </p>
                <button 
                  onClick={() => setShareLink('')} 
                  style={{
                    marginTop: '8px',
                    padding: '6px 12px',
                    background: '#f3f4f6',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  Generate New Link
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
