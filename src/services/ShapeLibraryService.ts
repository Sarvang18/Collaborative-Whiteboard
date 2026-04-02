import { CanvasElement } from '../types/shapes'
import { nanoid } from 'nanoid'

export interface ShapeLibraryItem {
  id: string
  name: string
  category: 'basic' | 'arrows' | 'icons' | 'connectors'
  create: (x: number, y: number) => CanvasElement
}

export class ShapeLibraryService {
  private static library: ShapeLibraryItem[] = [
    // Basic Shapes
    {
      id: 'rect-basic',
      name: 'Rectangle',
      category: 'basic',
      create: (x, y) => ({
        id: nanoid(),
        type: 'rect',
        x,
        y,
        width: 120,
        height: 80,
        fill: '#3b82f6',
        stroke: '#1e40af',
        strokeWidth: 2,
        opacity: 1,
        rotation: 0,
        cornerRadius: 0,
      }),
    },
    {
      id: 'rect-rounded',
      name: 'Rounded Rectangle',
      category: 'basic',
      create: (x, y) => ({
        id: nanoid(),
        type: 'rect',
        x,
        y,
        width: 120,
        height: 80,
        fill: '#3b82f6',
        stroke: '#1e40af',
        strokeWidth: 2,
        opacity: 1,
        rotation: 0,
        cornerRadius: 12,
      }),
    },
    {
      id: 'circle',
      name: 'Circle',
      category: 'basic',
      create: (x, y) => ({
        id: nanoid(),
        type: 'ellipse',
        x,
        y,
        width: 100,
        height: 100,
        fill: '#10b981',
        stroke: '#059669',
        strokeWidth: 2,
        opacity: 1,
        rotation: 0,
      }),
    },
    {
      id: 'ellipse',
      name: 'Ellipse',
      category: 'basic',
      create: (x, y) => ({
        id: nanoid(),
        type: 'ellipse',
        x,
        y,
        width: 140,
        height: 80,
        fill: '#8b5cf6',
        stroke: '#6d28d9',
        strokeWidth: 2,
        opacity: 1,
        rotation: 0,
      }),
    },
    {
      id: 'triangle',
      name: 'Triangle',
      category: 'basic',
      create: (x, y) => ({
        id: nanoid(),
        type: 'triangle',
        x,
        y,
        width: 100,
        height: 100,
        fill: '#f59e0b',
        stroke: '#d97706',
        strokeWidth: 2,
        opacity: 1,
        rotation: 0,
      }),
    },
    {
      id: 'star',
      name: 'Star',
      category: 'basic',
      create: (x, y) => ({
        id: nanoid(),
        type: 'star',
        x,
        y,
        width: 100,
        height: 100,
        fill: '#fbbf24',
        stroke: '#f59e0b',
        strokeWidth: 2,
        opacity: 1,
        rotation: 0,
      }),
    },
    // Arrows
    {
      id: 'arrow-right',
      name: 'Arrow Right',
      category: 'arrows',
      create: (x, y) => ({
        id: nanoid(),
        type: 'arrow',
        x,
        y,
        width: 120,
        height: 60,
        fill: '#3b82f6',
        stroke: '#1e40af',
        strokeWidth: 2,
        opacity: 1,
        rotation: 0,
      }),
    },
    {
      id: 'arrow-down',
      name: 'Arrow Down',
      category: 'arrows',
      create: (x, y) => ({
        id: nanoid(),
        type: 'arrow',
        x,
        y,
        width: 60,
        height: 120,
        fill: '#3b82f6',
        stroke: '#1e40af',
        strokeWidth: 2,
        opacity: 1,
        rotation: 90,
      }),
    },
    {
      id: 'arrow-up',
      name: 'Arrow Up',
      category: 'arrows',
      create: (x, y) => ({
        id: nanoid(),
        type: 'arrow',
        x,
        y,
        width: 60,
        height: 120,
        fill: '#3b82f6',
        stroke: '#1e40af',
        strokeWidth: 2,
        opacity: 1,
        rotation: -90,
      }),
    },
    {
      id: 'arrow-left',
      name: 'Arrow Left',
      category: 'arrows',
      create: (x, y) => ({
        id: nanoid(),
        type: 'arrow',
        x,
        y,
        width: 120,
        height: 60,
        fill: '#3b82f6',
        stroke: '#1e40af',
        strokeWidth: 2,
        opacity: 1,
        rotation: 180,
      }),
    },
    // Connectors
    {
      id: 'line-horizontal',
      name: 'Horizontal Line',
      category: 'connectors',
      create: (x, y) => ({
        id: nanoid(),
        type: 'line',
        x,
        y,
        width: 150,
        height: 0,
        stroke: '#1e40af',
        strokeWidth: 2,
        opacity: 1,
        rotation: 0,
      }),
    },
    {
      id: 'line-vertical',
      name: 'Vertical Line',
      category: 'connectors',
      create: (x, y) => ({
        id: nanoid(),
        type: 'line',
        x,
        y,
        width: 0,
        height: 150,
        stroke: '#1e40af',
        strokeWidth: 2,
        opacity: 1,
        rotation: 0,
      }),
    },
    {
      id: 'line-diagonal',
      name: 'Diagonal Line',
      category: 'connectors',
      create: (x, y) => ({
        id: nanoid(),
        type: 'line',
        x,
        y,
        width: 100,
        height: 100,
        stroke: '#1e40af',
        strokeWidth: 2,
        opacity: 1,
        rotation: 0,
      }),
    },
  ]

  static getLibrary(): ShapeLibraryItem[] {
    return this.library
  }

  static getByCategory(category: ShapeLibraryItem['category']): ShapeLibraryItem[] {
    return this.library.filter((item) => item.category === category)
  }

  static getItem(id: string): ShapeLibraryItem | undefined {
    return this.library.find((item) => item.id === id)
  }

  static createShape(id: string, x: number, y: number): CanvasElement | null {
    const item = this.getItem(id)
    return item ? item.create(x, y) : null
  }
}
