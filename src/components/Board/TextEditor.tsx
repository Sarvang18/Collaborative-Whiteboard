import { useEffect, useRef, useState } from 'react'
import { useCanvasStore } from '../../store/canvasStore'
import './TextEditor.css'

interface TextEditorProps {
  elementId: string
  x: number
  y: number
  width: number
  height: number
  text: string
  fontSize: number
  onClose: () => void
}

export function TextEditor({ elementId, x, y, width, height, text, fontSize, onClose }: TextEditorProps) {
  const [value, setValue] = useState(text)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus()
      textareaRef.current.select()
    }
  }, [])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (textareaRef.current && !textareaRef.current.contains(e.target as Node)) {
        handleSave()
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleSave()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [value])

  const handleSave = () => {
    if (value.trim()) {
      useCanvasStore.getState().updateElement(elementId, { text: value })
    } else {
      useCanvasStore.getState().deleteElements([elementId])
    }
    onClose()
  }

  return (
    <div
      className="text-editor-container"
      style={{
        left: `${x}px`,
        top: `${y}px`,
        width: `${width}px`,
        minHeight: `${height}px`,
      }}
    >
      <textarea
        ref={textareaRef}
        className="text-editor-input"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        style={{
          fontSize: `${fontSize}px`,
          width: '100%',
          minHeight: `${height}px`,
        }}
      />
    </div>
  )
}
