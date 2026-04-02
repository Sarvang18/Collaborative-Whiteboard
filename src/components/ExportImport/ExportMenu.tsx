import { useState } from 'react'
import { useCanvasStore } from '../../store/canvasStore'
import { ExportService } from '../../services/ExportService'
import './ExportMenu.css'

export function ExportMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const elements = useCanvasStore((s) => s.elements)
  const boardId = useCanvasStore((s) => s.boardId)

  const handleExport = async (format: 'png' | 'svg' | 'pdf' | 'json') => {
    if (elements.size === 0) {
      alert('Nothing to export! Add some elements first.')
      return
    }

    setIsExporting(true)
    try {
      const filename = `${boardId}-${Date.now()}`

      switch (format) {
        case 'png':
          await ExportService.exportToHighResPNG(elements, `${filename}.png`, 2)
          break
        case 'svg':
          ExportService.exportToSVG(elements, `${filename}.svg`)
          break
        case 'pdf':
          await ExportService.exportToPDF(elements, `${filename}.pdf`)
          break
        case 'json':
          ExportService.exportToJSON(elements, boardId, `${filename}.json`)
          break
      }

      setIsOpen(false)
    } catch (error) {
      console.error('Export failed:', error)
      alert('Export failed. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="export-menu">
      <button className="export-button" onClick={() => setIsOpen(!isOpen)} title="Export" disabled={isExporting}>
        {isExporting ? '⏳' : '📥'} Export
      </button>

      {isOpen && (
        <div className="export-dropdown">
          <button className="export-option" onClick={() => handleExport('png')} disabled={isExporting}>
            <span className="export-icon">🖼️</span>
            <div className="export-info">
              <div className="export-label">PNG Image</div>
              <div className="export-desc">High quality raster</div>
            </div>
          </button>

          <button className="export-option" onClick={() => handleExport('svg')} disabled={isExporting}>
            <span className="export-icon">📐</span>
            <div className="export-info">
              <div className="export-label">SVG Vector</div>
              <div className="export-desc">Scalable graphics</div>
            </div>
          </button>

          <button className="export-option" onClick={() => handleExport('pdf')} disabled={isExporting}>
            <span className="export-icon">📄</span>
            <div className="export-info">
              <div className="export-label">PDF Document</div>
              <div className="export-desc">Print ready</div>
            </div>
          </button>

          <button className="export-option" onClick={() => handleExport('json')} disabled={isExporting}>
            <span className="export-icon">💾</span>
            <div className="export-info">
              <div className="export-label">JSON Data</div>
              <div className="export-desc">Editable format</div>
            </div>
          </button>
        </div>
      )}
    </div>
  )
}
