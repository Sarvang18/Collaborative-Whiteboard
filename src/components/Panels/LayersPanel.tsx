import { useCanvasStore } from '../../store/canvasStore'
import './LayersPanel.css'

export function LayersPanel() {
  const elements = useCanvasStore((s) => s.elements)
  const layerOrder = useCanvasStore((s) => s.layerOrder)
  const selectedIds = useCanvasStore((s) => s.selectedIds)
  const setSelection = useCanvasStore((s) => s.setSelection)

  return (
    <div className="layers-panel">
      <div className="panel-header">Layers</div>
      <div className="layers-list">
        {[...layerOrder].reverse().map((id) => {
          const element = elements.get(id)
          if (!element) return null

          return (
            <div
              key={id}
              className={`layer-item ${selectedIds.has(id) ? 'selected' : ''}`}
              onClick={() => setSelection([id])}
            >
              <span className="layer-icon">
                {element.type === 'rect' && '⬜'}
                {element.type === 'ellipse' && '⭕'}
                {element.type === 'text' && '📝'}
                {element.type === 'path' && '✏️'}
              </span>
              <span className="layer-name">
                {element.type} {id.slice(0, 6)}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
