import { useEffect } from 'react'
import { useCanvasStore } from '../store/canvasStore'
import { useHistoryStore } from '../store/historyStore'
import { useConnectorStore } from '../store/connectorStore'
import { useUIStore } from '../store/uiStore'
import { ClipboardService } from '../services/ClipboardService'

export function useKeyboard() {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      // Check read-only mode
      const isReadOnly = useUIStore.getState().isReadOnly

      const selectedIds = useCanvasStore.getState().selectedIds
      const deleteElements = useCanvasStore.getState().deleteElements
      const elements = useCanvasStore.getState().elements
      const addElement = useCanvasStore.getState().addElement

      // Delete
      if ((e.key === 'Delete' || e.key === 'Backspace')) {
        if (isReadOnly) {
          e.preventDefault()
          alert('⚠️ READ-ONLY MODE\n\nYou cannot delete elements in this board.')
          return
        }
        
        e.preventDefault()
        
        // Delete selected connector if any
        const selectedConnectorId = useConnectorStore.getState().selectedConnectorId
        if (selectedConnectorId) {
          useConnectorStore.getState().deleteConnector(selectedConnectorId)
          return
        }
        
        // Delete selected elements
        if (selectedIds.size > 0) {
          // Delete connectors attached to selected elements
          const connectors = useConnectorStore.getState().connectors
          const connectorsToDelete: string[] = []
          
          connectors.forEach((connector, id) => {
            if (selectedIds.has(connector.startElementId) || selectedIds.has(connector.endElementId)) {
              connectorsToDelete.push(id)
            }
          })
          
          connectorsToDelete.forEach(id => {
            useConnectorStore.getState().deleteConnector(id)
          })
          
          // Save to history
          const deletedElements = Array.from(selectedIds).map(id => ({
            type: 'delete' as const,
            elementId: id,
            before: elements.get(id),
          }))
          useHistoryStore.getState().push(deletedElements)
          
          deleteElements(Array.from(selectedIds))
        }
      }

      // Copy (allowed in read-only)
      if ((e.ctrlKey || e.metaKey) && e.key === 'c' && selectedIds.size > 0) {
        e.preventDefault()
        const selectedElements = Array.from(selectedIds)
          .map(id => elements.get(id))
          .filter(Boolean) as any[]
        ClipboardService.copy(selectedElements)
        ClipboardService.copyToSystemClipboard(selectedElements)
      }

      // Cut
      if ((e.ctrlKey || e.metaKey) && e.key === 'x' && selectedIds.size > 0) {
        if (isReadOnly) {
          e.preventDefault()
          alert('⚠️ READ-ONLY MODE\n\nYou cannot cut elements in this board.')
          return
        }
        
        e.preventDefault()
        const selectedElements = Array.from(selectedIds)
          .map(id => elements.get(id))
          .filter(Boolean) as any[]
        ClipboardService.cut(selectedElements)
        ClipboardService.copyToSystemClipboard(selectedElements)
        
        // Save to history
        const deletedElements = Array.from(selectedIds).map(id => ({
          type: 'delete' as const,
          elementId: id,
          before: elements.get(id),
        }))
        useHistoryStore.getState().push(deletedElements)
        
        deleteElements(Array.from(selectedIds))
      }

      // Paste
      if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        if (isReadOnly) {
          e.preventDefault()
          alert('⚠️ READ-ONLY MODE\n\nYou cannot paste elements in this board.')
          return
        }
        
        e.preventDefault()
        const pastedElements = ClipboardService.paste()
        pastedElements.forEach(el => addElement(el))
        
        // Select pasted elements
        useCanvasStore.getState().setSelection(pastedElements.map(el => el.id))
      }

      // Duplicate
      if ((e.ctrlKey || e.metaKey) && e.key === 'd' && selectedIds.size > 0) {
        if (isReadOnly) {
          e.preventDefault()
          alert('⚠️ READ-ONLY MODE\n\nYou cannot duplicate elements in this board.')
          return
        }
        
        e.preventDefault()
        const selectedElements = Array.from(selectedIds)
          .map(id => elements.get(id))
          .filter(Boolean) as any[]
        const duplicated = ClipboardService.duplicate(selectedElements)
        duplicated.forEach(el => addElement(el))
        
        // Select duplicated elements
        useCanvasStore.getState().setSelection(duplicated.map(el => el.id))
      }

      // Undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        if (isReadOnly) {
          e.preventDefault()
          return
        }
        
        e.preventDefault()
        const entries = useHistoryStore.getState().undo()
        if (entries) {
          applyHistoryEntries(entries, true)
        }
      }

      // Redo
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        if (isReadOnly) {
          e.preventDefault()
          return
        }
        
        e.preventDefault()
        const entries = useHistoryStore.getState().redo()
        if (entries) {
          applyHistoryEntries(entries, false)
        }
      }

      // Select All (allowed in read-only)
      if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        e.preventDefault()
        const allIds = Array.from(useCanvasStore.getState().elements.keys())
        useCanvasStore.getState().setSelection(allIds)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])
}

function applyHistoryEntries(entries: any[], isUndo: boolean) {
  const store = useCanvasStore.getState()
  const connectorStore = useConnectorStore.getState()
  
  entries.forEach(entry => {
    // Handle connector entries
    if (entry.isConnector) {
      if (entry.type === 'add') {
        if (isUndo) {
          // Undo add = delete connector
          const connectors = new Map(connectorStore.connectors)
          connectors.delete(entry.connectorId)
          useConnectorStore.setState({ connectors })
        } else {
          // Redo add = add connector back
          if (entry.after) {
            const connectors = new Map(connectorStore.connectors)
            connectors.set(entry.connectorId, entry.after)
            useConnectorStore.setState({ connectors })
          }
        }
      } else if (entry.type === 'delete') {
        if (isUndo && entry.before) {
          // Undo delete = add connector back
          const connectors = new Map(connectorStore.connectors)
          connectors.set(entry.connectorId, entry.before)
          useConnectorStore.setState({ connectors })
        } else {
          // Redo delete = delete connector again
          const connectors = new Map(connectorStore.connectors)
          connectors.delete(entry.connectorId)
          useConnectorStore.setState({ connectors })
        }
      }
      return
    }
    
    // Handle element entries
    if (entry.type === 'add') {
      if (isUndo) {
        // Undo add = delete
        store.deleteElements([entry.elementId])
      } else {
        // Redo add = add back
        if (entry.after) store.addElement(entry.after)
      }
    } else if (entry.type === 'update') {
      if (isUndo && entry.before) {
        // Restore previous state
        store.updateElement(entry.elementId, entry.before)
      } else if (!isUndo && entry.after) {
        // Restore updated state
        store.updateElement(entry.elementId, entry.after)
      }
    } else if (entry.type === 'delete') {
      if (isUndo && entry.before) {
        // Undo delete = add back
        store.addElement(entry.before)
      } else {
        // Redo delete = delete again
        store.deleteElements([entry.elementId])
      }
    }
  })
}
