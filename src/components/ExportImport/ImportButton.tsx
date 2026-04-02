import { useRef, useState } from 'react'
import { useCanvasStore } from '../../store/canvasStore'
import { ImportService } from '../../services/ImportService'
import './ImportButton.css'

export function ImportButton() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isImporting, setIsImporting] = useState(false)
  const addElement = useCanvasStore((s) => s.addElement)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsImporting(true)
    try {
      const result = await ImportService.handleFileImport(file)

      if (result.success && result.elements) {
        result.elements.forEach((element) => {
          addElement(element)
        })
        alert(`Successfully imported ${result.elements.length} element(s)!`)
      } else {
        alert(`Import failed: ${result.error}`)
      }
    } catch (error) {
      console.error('Import error:', error)
      alert('Import failed. Please try again.')
    } finally {
      setIsImporting(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <>
      <button
        className="import-button"
        onClick={() => fileInputRef.current?.click()}
        disabled={isImporting}
        title="Import file (JSON, PNG, SVG)"
      >
        {isImporting ? '⏳' : '📤'} Import
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json,.png,.jpg,.jpeg,.svg,.gif,.webp"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />
    </>
  )
}
