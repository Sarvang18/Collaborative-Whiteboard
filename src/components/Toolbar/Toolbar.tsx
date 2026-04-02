import { useUIStore } from '../../store/uiStore'
import { useConnectorStore } from '../../store/connectorStore'
import { ToolType } from '../../types/canvas'
import { useEffect } from 'react'
import './Toolbar.css'

const tools: { type: ToolType; icon: string; label: string }[] = [
  { type: 'select', icon: '⬆️', label: 'Select' },
  { type: 'path', icon: '✏️', label: 'Draw' },
  { type: 'text', icon: '📝', label: 'Text' },
  { type: 'pan', icon: '✋', label: 'Pan' },
]

export function Toolbar() {
  const activeTool = useUIStore((s) => s.activeTool)
  const setActiveTool = useUIStore((s) => s.setActiveTool)
  const isReadOnly = useUIStore((s) => s.isReadOnly)
  const isConnectorMode = useConnectorStore((s) => s.isConnectorMode)
  const setConnectorMode = useConnectorStore((s) => s.setConnectorMode)

  // ESC key to deselect tool
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveTool('select')
        setConnectorMode(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [setActiveTool, setConnectorMode])

  const handleConnectorToggle = () => {
    if (isReadOnly) {
      alert('⚠️ READ-ONLY MODE\n\nYou cannot edit this board. Request edit permissions from the owner.')
      return
    }
    
    // Toggle connector mode
    const newMode = !isConnectorMode
    setConnectorMode(newMode)
    
    if (newMode) {
      setActiveTool('select')
    }
  }

  const handleToolClick = (tool: ToolType) => {
    if (isReadOnly && tool !== 'select' && tool !== 'pan') {
      alert('⚠️ READ-ONLY MODE\n\nYou cannot edit this board. Request edit permissions from the owner.')
      return
    }
    
    // If clicking the same tool, deselect it and go back to select
    if (activeTool === tool && tool !== 'select') {
      setActiveTool('select')
    } else {
      setActiveTool(tool)
    }
    
    if (isConnectorMode) setConnectorMode(false)
  }

  return (
    <div className="toolbar">
      {tools.map((tool) => (
        <button
          key={tool.type}
          className={`tool-button ${activeTool === tool.type ? 'active' : ''} ${isReadOnly && tool.type !== 'select' && tool.type !== 'pan' ? 'disabled' : ''}`}
          onClick={() => handleToolClick(tool.type)}
          title={isReadOnly && tool.type !== 'select' && tool.type !== 'pan' ? 'Disabled in read-only mode' : tool.label}
          disabled={isReadOnly && tool.type !== 'select' && tool.type !== 'pan'}
        >
          <span className="tool-icon">{tool.icon}</span>
        </button>
      ))}
      <div className="toolbar-divider" />
      <button
        className={`tool-button ${isConnectorMode ? 'active' : ''} ${isReadOnly ? 'disabled' : ''}`}
        onClick={handleConnectorToggle}
        title={isReadOnly ? 'Disabled in read-only mode' : 'Connector Mode (Link shapes)'}
        disabled={isReadOnly}
      >
        <span className="tool-icon">🔗</span>
      </button>
    </div>
  )
}
