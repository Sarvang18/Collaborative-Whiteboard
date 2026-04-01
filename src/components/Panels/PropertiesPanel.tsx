import { useCanvasStore } from '../../store/canvasStore'
import './PropertiesPanel.css'

export function PropertiesPanel() {
  const elements = useCanvasStore((s) => s.elements)
  const selectedIds = useCanvasStore((s) => s.selectedIds)
  const updateElement = useCanvasStore((s) => s.updateElement)

  if (selectedIds.size === 0) {
    return (
      <div className="properties-panel">
        <div className="panel-header">Properties</div>
        <div className="no-selection">No element selected</div>
      </div>
    )
  }

  const selectedId = Array.from(selectedIds)[0]
  const element = elements.get(selectedId)

  if (!element) return null

  return (
    <div className="properties-panel">
      <div className="panel-header">Properties</div>
      <div className="properties-content">
        <div className="property-group">
          <label>Fill</label>
          <input
            type="color"
            value={element.fill || '#3b82f6'}
            onChange={(e) => updateElement(selectedId, { fill: e.target.value })}
          />
        </div>
        <div className="property-group">
          <label>Stroke</label>
          <input
            type="color"
            value={element.stroke || '#1e40af'}
            onChange={(e) => updateElement(selectedId, { stroke: e.target.value })}
          />
        </div>
        <div className="property-group">
          <label>Stroke Width</label>
          <input
            type="number"
            min="0"
            max="20"
            value={element.strokeWidth || 2}
            onChange={(e) => updateElement(selectedId, { strokeWidth: Number(e.target.value) })}
          />
        </div>
        <div className="property-group">
          <label>Opacity</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={element.opacity || 1}
            onChange={(e) => updateElement(selectedId, { opacity: Number(e.target.value) })}
          />
        </div>
      </div>
    </div>
  )
}
