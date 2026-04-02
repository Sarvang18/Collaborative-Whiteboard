import { useState } from 'react'
import { useUIStore } from '../../store/uiStore'
import { ShapeLibraryService, ShapeLibraryItem } from '../../services/ShapeLibraryService'
import './ShapeLibraryPanel.css'

export function ShapeLibraryPanel() {
  const [isOpen, setIsOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState<ShapeLibraryItem['category']>('basic')
  const setPendingShape = useUIStore((s) => s.setPendingShape)

  const categories: { id: ShapeLibraryItem['category']; label: string; icon: string }[] = [
    { id: 'basic', label: 'Basic', icon: '⬜' },
    { id: 'arrows', label: 'Arrows', icon: '➡️' },
    { id: 'connectors', label: 'Lines', icon: '📏' },
  ]

  const handleAddShape = (shapeId: string) => {
    // Set pending shape - will be placed on next canvas click
    setPendingShape(shapeId)
    setIsOpen(false)
  }

  const shapes = ShapeLibraryService.getByCategory(activeCategory)

  return (
    <>
      <button className="shape-library-trigger" onClick={() => setIsOpen(!isOpen)} title="Shape Library">
        🔷 Shapes
      </button>

      {isOpen && (
        <div className="shape-library-panel">
          <div className="shape-library-header">
            <h3>Shape Library</h3>
            <button className="shape-library-close" onClick={() => setIsOpen(false)}>
              ✕
            </button>
          </div>

          <div className="shape-library-categories">
            {categories.map((cat) => (
              <button
                key={cat.id}
                className={`shape-category-btn ${activeCategory === cat.id ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat.id)}
              >
                <span className="shape-category-icon">{cat.icon}</span>
                <span className="shape-category-label">{cat.label}</span>
              </button>
            ))}
          </div>

          <div className="shape-library-content">
            <div className="shapes-grid">
              {shapes.map((shape) => (
                <div
                  key={shape.id}
                  className="shape-item"
                  onClick={() => handleAddShape(shape.id)}
                  title={`Click to place ${shape.name}`}
                >
                  <div className="shape-preview">
                    {shape.category === 'basic' && getBasicShapeIcon(shape.id)}
                    {shape.category === 'arrows' && getArrowIcon(shape.id)}
                    {shape.category === 'connectors' && getConnectorIcon(shape.id)}
                  </div>
                  <span className="shape-name">{shape.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function getBasicShapeIcon(id: string): string {
  const icons: Record<string, string> = {
    'rect-basic': '▭',
    'rect-rounded': '▢',
    'circle': '●',
    'ellipse': '⬭',
    'triangle': '▲',
    'star': '★',
  }
  return icons[id] || '⬜'
}

function getArrowIcon(id: string): string {
  const icons: Record<string, string> = {
    'arrow-right': '→',
    'arrow-down': '↓',
    'arrow-up': '↑',
    'arrow-left': '←',
  }
  return icons[id] || '→'
}

function getConnectorIcon(id: string): string {
  const icons: Record<string, string> = {
    'line-horizontal': '─',
    'line-vertical': '│',
    'line-diagonal': '╱',
  }
  return icons[id] || '─'
}
