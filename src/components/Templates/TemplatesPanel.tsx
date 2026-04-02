import { useState } from 'react'
import { useCanvasStore } from '../../store/canvasStore'
import { TemplateService, Template } from '../../services/TemplateService'
import './TemplatesPanel.css'

export function TemplatesPanel() {
  const [isOpen, setIsOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState<Template['category']>('flowchart')
  const addElement = useCanvasStore((s) => s.addElement)

  const categories: { id: Template['category']; label: string; icon: string }[] = [
    { id: 'flowchart', label: 'Flowcharts', icon: '📊' },
    { id: 'wireframe', label: 'Wireframes', icon: '📱' },
    { id: 'diagram', label: 'Diagrams', icon: '🔷' },
    { id: 'sticky-note', label: 'Sticky Notes', icon: '📝' },
  ]

  const handleApplyTemplate = (templateId: string) => {
    const elements = TemplateService.applyTemplate(templateId, 50, 50)
    elements.forEach((el) => addElement(el))
    setIsOpen(false)
  }

  const handleAddStickyNote = (color: string) => {
    const stickyNote = TemplateService.createStickyNote(100, 100, color)
    addElement(stickyNote)
  }

  const templates = TemplateService.getTemplatesByCategory(activeCategory)

  return (
    <>
      <button className="templates-trigger" onClick={() => setIsOpen(!isOpen)} title="Templates">
        📋 Templates
      </button>

      {isOpen && (
        <div className="templates-panel">
          <div className="templates-header">
            <h3>Templates & Assets</h3>
            <button className="templates-close" onClick={() => setIsOpen(false)}>
              ✕
            </button>
          </div>

          <div className="templates-categories">
            {categories.map((cat) => (
              <button
                key={cat.id}
                className={`category-btn ${activeCategory === cat.id ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat.id)}
              >
                <span className="category-icon">{cat.icon}</span>
                <span className="category-label">{cat.label}</span>
              </button>
            ))}
          </div>

          <div className="templates-content">
            {activeCategory === 'sticky-note' ? (
              <div className="sticky-notes-grid">
                <div className="sticky-note-item" onClick={() => handleAddStickyNote('#fef08a')}>
                  <div className="sticky-preview" style={{ background: '#fef08a' }}>
                    📝
                  </div>
                  <span>Yellow</span>
                </div>
                <div className="sticky-note-item" onClick={() => handleAddStickyNote('#fecaca')}>
                  <div className="sticky-preview" style={{ background: '#fecaca' }}>
                    📝
                  </div>
                  <span>Red</span>
                </div>
                <div className="sticky-note-item" onClick={() => handleAddStickyNote('#bfdbfe')}>
                  <div className="sticky-preview" style={{ background: '#bfdbfe' }}>
                    📝
                  </div>
                  <span>Blue</span>
                </div>
                <div className="sticky-note-item" onClick={() => handleAddStickyNote('#bbf7d0')}>
                  <div className="sticky-preview" style={{ background: '#bbf7d0' }}>
                    📝
                  </div>
                  <span>Green</span>
                </div>
                <div className="sticky-note-item" onClick={() => handleAddStickyNote('#e9d5ff')}>
                  <div className="sticky-preview" style={{ background: '#e9d5ff' }}>
                    📝
                  </div>
                  <span>Purple</span>
                </div>
                <div className="sticky-note-item" onClick={() => handleAddStickyNote('#fed7aa')}>
                  <div className="sticky-preview" style={{ background: '#fed7aa' }}>
                    📝
                  </div>
                  <span>Orange</span>
                </div>
              </div>
            ) : (
              <div className="templates-grid">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className="template-item"
                    onClick={() => handleApplyTemplate(template.id)}
                  >
                    <div className="template-preview">
                      <span className="template-icon">
                        {activeCategory === 'flowchart' && '📊'}
                        {activeCategory === 'wireframe' && '📱'}
                        {activeCategory === 'diagram' && '🔷'}
                      </span>
                    </div>
                    <span className="template-name">{template.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
