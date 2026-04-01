import { useUIStore } from '../../store/uiStore'
import { ToolType } from '../../types/canvas'
import { ShapesMenu } from './ShapesMenu'
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

  return (
    <div className="toolbar">
      {tools.map((tool) => (
        <button
          key={tool.type}
          className={`tool-button ${activeTool === tool.type ? 'active' : ''}`}
          onClick={() => setActiveTool(tool.type)}
          title={tool.label}
        >
          <span className="tool-icon">{tool.icon}</span>
        </button>
      ))}
      <div className="toolbar-divider" />
      <ShapesMenu />
    </div>
  )
}
