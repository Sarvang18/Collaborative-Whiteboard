import { CanvasElement } from '../types/shapes'
import { nanoid } from 'nanoid'

export interface Template {
  id: string
  name: string
  category: 'flowchart' | 'wireframe' | 'diagram' | 'sticky-note'
  elements: CanvasElement[]
  thumbnail?: string
}

export class TemplateService {
  private static templates: Template[] = [
    // Flowchart Templates
    {
      id: 'flowchart-basic',
      name: 'Basic Flowchart',
      category: 'flowchart',
      elements: [
        {
          id: nanoid(),
          type: 'rect',
          x: 100,
          y: 100,
          width: 120,
          height: 60,
          fill: '#3b82f6',
          stroke: '#1e40af',
          strokeWidth: 2,
          opacity: 1,
          rotation: 0,
          cornerRadius: 8,
        },
        {
          id: nanoid(),
          type: 'arrow',
          x: 160,
          y: 160,
          width: 0,
          height: 80,
          stroke: '#1e40af',
          strokeWidth: 2,
          opacity: 1,
          rotation: 0,
        },
        {
          id: nanoid(),
          type: 'rect',
          x: 100,
          y: 240,
          width: 120,
          height: 60,
          fill: '#10b981',
          stroke: '#059669',
          strokeWidth: 2,
          opacity: 1,
          rotation: 0,
          cornerRadius: 8,
        },
      ],
    },
    {
      id: 'flowchart-decision',
      name: 'Decision Flow',
      category: 'flowchart',
      elements: [
        {
          id: nanoid(),
          type: 'rect',
          x: 150,
          y: 50,
          width: 100,
          height: 50,
          fill: '#3b82f6',
          stroke: '#1e40af',
          strokeWidth: 2,
          opacity: 1,
          rotation: 0,
          cornerRadius: 8,
        },
        {
          id: nanoid(),
          type: 'star',
          x: 150,
          y: 150,
          width: 100,
          height: 100,
          fill: '#f59e0b',
          stroke: '#d97706',
          strokeWidth: 2,
          opacity: 1,
          rotation: 0,
        },
        {
          id: nanoid(),
          type: 'rect',
          x: 50,
          y: 300,
          width: 80,
          height: 50,
          fill: '#10b981',
          stroke: '#059669',
          strokeWidth: 2,
          opacity: 1,
          rotation: 0,
          cornerRadius: 8,
        },
        {
          id: nanoid(),
          type: 'rect',
          x: 270,
          y: 300,
          width: 80,
          height: 50,
          fill: '#ef4444',
          stroke: '#dc2626',
          strokeWidth: 2,
          opacity: 1,
          rotation: 0,
          cornerRadius: 8,
        },
      ],
    },
    // Wireframe Templates
    {
      id: 'wireframe-mobile',
      name: 'Mobile App',
      category: 'wireframe',
      elements: [
        {
          id: nanoid(),
          type: 'rect',
          x: 100,
          y: 50,
          width: 200,
          height: 400,
          fill: '#ffffff',
          stroke: '#000000',
          strokeWidth: 3,
          opacity: 1,
          rotation: 0,
          cornerRadius: 20,
        },
        {
          id: nanoid(),
          type: 'rect',
          x: 120,
          y: 80,
          width: 160,
          height: 40,
          fill: '#e5e7eb',
          stroke: '#6b7280',
          strokeWidth: 1,
          opacity: 1,
          rotation: 0,
          cornerRadius: 4,
        },
        {
          id: nanoid(),
          type: 'rect',
          x: 120,
          y: 140,
          width: 160,
          height: 80,
          fill: '#f3f4f6',
          stroke: '#6b7280',
          strokeWidth: 1,
          opacity: 1,
          rotation: 0,
          cornerRadius: 4,
        },
        {
          id: nanoid(),
          type: 'rect',
          x: 120,
          y: 240,
          width: 160,
          height: 80,
          fill: '#f3f4f6',
          stroke: '#6b7280',
          strokeWidth: 1,
          opacity: 1,
          rotation: 0,
          cornerRadius: 4,
        },
      ],
    },
    {
      id: 'wireframe-web',
      name: 'Web Layout',
      category: 'wireframe',
      elements: [
        {
          id: nanoid(),
          type: 'rect',
          x: 50,
          y: 50,
          width: 500,
          height: 60,
          fill: '#1f2937',
          stroke: '#000000',
          strokeWidth: 2,
          opacity: 1,
          rotation: 0,
        },
        {
          id: nanoid(),
          type: 'rect',
          x: 50,
          y: 130,
          width: 150,
          height: 300,
          fill: '#f3f4f6',
          stroke: '#6b7280',
          strokeWidth: 1,
          opacity: 1,
          rotation: 0,
        },
        {
          id: nanoid(),
          type: 'rect',
          x: 220,
          y: 130,
          width: 330,
          height: 300,
          fill: '#ffffff',
          stroke: '#6b7280',
          strokeWidth: 1,
          opacity: 1,
          rotation: 0,
        },
      ],
    },
    // Diagram Templates
    {
      id: 'diagram-venn',
      name: 'Venn Diagram',
      category: 'diagram',
      elements: [
        {
          id: nanoid(),
          type: 'ellipse',
          x: 100,
          y: 100,
          width: 150,
          height: 150,
          fill: '#3b82f6',
          stroke: '#1e40af',
          strokeWidth: 2,
          opacity: 0.5,
          rotation: 0,
        },
        {
          id: nanoid(),
          type: 'ellipse',
          x: 180,
          y: 100,
          width: 150,
          height: 150,
          fill: '#ef4444',
          stroke: '#dc2626',
          strokeWidth: 2,
          opacity: 0.5,
          rotation: 0,
        },
      ],
    },
    {
      id: 'diagram-org',
      name: 'Org Chart',
      category: 'diagram',
      elements: [
        {
          id: nanoid(),
          type: 'rect',
          x: 150,
          y: 50,
          width: 100,
          height: 50,
          fill: '#3b82f6',
          stroke: '#1e40af',
          strokeWidth: 2,
          opacity: 1,
          rotation: 0,
          cornerRadius: 4,
        },
        {
          id: nanoid(),
          type: 'rect',
          x: 50,
          y: 150,
          width: 100,
          height: 50,
          fill: '#10b981',
          stroke: '#059669',
          strokeWidth: 2,
          opacity: 1,
          rotation: 0,
          cornerRadius: 4,
        },
        {
          id: nanoid(),
          type: 'rect',
          x: 250,
          y: 150,
          width: 100,
          height: 50,
          fill: '#10b981',
          stroke: '#059669',
          strokeWidth: 2,
          opacity: 1,
          rotation: 0,
          cornerRadius: 4,
        },
      ],
    },
  ]

  static getTemplates(): Template[] {
    return this.templates
  }

  static getTemplatesByCategory(category: Template['category']): Template[] {
    return this.templates.filter((t) => t.category === category)
  }

  static getTemplate(id: string): Template | undefined {
    return this.templates.find((t) => t.id === id)
  }

  static applyTemplate(templateId: string, offsetX: number = 0, offsetY: number = 0): CanvasElement[] {
    const template = this.getTemplate(templateId)
    if (!template) return []

    return template.elements.map((el) => ({
      ...el,
      id: nanoid(),
      x: el.x + offsetX,
      y: el.y + offsetY,
    }))
  }

  static createStickyNote(x: number, y: number, color: string = '#fef08a'): CanvasElement {
    return {
      id: nanoid(),
      type: 'rect',
      x,
      y,
      width: 150,
      height: 150,
      fill: color,
      stroke: '#ca8a04',
      strokeWidth: 1,
      opacity: 1,
      rotation: 0,
      cornerRadius: 2,
    }
  }
}
