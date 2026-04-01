import { useState, useRef, useEffect } from 'react'
import { useUIStore } from '../../store/uiStore'
import { ToolType } from '../../types/canvas'
import './ShapesMenu.css'

const shapes: { type: ToolType; icon: string; label: string }[] = [
  { type: 'rect', icon: '⬜', label: 'Rectangle' },
  { type: 'ellipse', icon: '⭕', label: 'Circle' },
  { type: 'triangle', icon: '🔺', label: 'Triangle' },
  { type: 'star', icon: '⭐', label: 'Star' },
  { type: 'arrow', icon: '➡️', label: 'Arrow' },
  { type: 'line', icon: '➖', label: 'Line' },
]

export function ShapesMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const activeTool = useUIStore((s) => s.activeTool)
  const setActiveTool = useUIStore((s) => s.setActiveTool)

  const activeShape = shapes.find(s => s.type === activeTool) || shapes[0]

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  const handleShapeSelect = (type: ToolType) => {
    setActiveTool(type)
    setIsOpen(false)
  }

  return (
    <div className="shapes-menu" ref={menuRef}>
      <button
        className={`tool-button ${shapes.some(s => s.type === activeTool) ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        title="Shapes"
      >
        <span className="tool-icon">{activeShape.icon}</span>
        <span className="dropdown-arrow">▼</span>
      </button>

      {isOpen && (
        <div className="shapes-dropdown">
          {shapes.map((shape) => (
            <button
              key={shape.type}
              className={`shape-option ${activeTool === shape.type ? 'active' : ''}`}
              onClick={() => handleShapeSelect(shape.type)}
            >
              <span className="shape-icon">{shape.icon}</span>
              <span className="shape-label">{shape.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
