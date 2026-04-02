import { create } from 'zustand'
import { Connector } from '../types/connector'
import { useHistoryStore } from './historyStore'
import { useUIStore } from './uiStore'

interface ConnectorState {
  connectors: Map<string, Connector>
  isConnectorMode: boolean
  connectingFrom: string | null
  selectedConnectorId: string | null
  
  setConnectorMode: (enabled: boolean) => void
  setConnectingFrom: (elementId: string | null) => void
  setSelectedConnector: (connectorId: string | null) => void
  addConnector: (connector: Connector) => void
  updateConnector: (id: string, connector: Connector) => void
  deleteConnector: (id: string) => void
  deleteSelectedConnector: () => void
  getConnectorsForElement: (elementId: string) => Connector[]
  clearConnectors: () => void
}

export const useConnectorStore = create<ConnectorState>((set, get) => ({
  connectors: new Map(),
  isConnectorMode: false,
  connectingFrom: null,
  selectedConnectorId: null,

  setConnectorMode: (enabled) => set({ isConnectorMode: enabled, connectingFrom: null }),

  setConnectingFrom: (elementId) => set({ connectingFrom: elementId }),

  setSelectedConnector: (connectorId) => set({ selectedConnectorId: connectorId }),

  addConnector: (connector) => {
    // Check read-only mode
    if (useUIStore.getState().isReadOnly) {
      console.warn('Cannot add connector in read-only mode')
      return
    }
    
    // Push to history
    useHistoryStore.getState().push([
      {
        type: 'add',
        connectorId: connector.id,
        after: connector,
        isConnector: true,
      },
    ])

    set((state) => {
      const next = new Map(state.connectors)
      next.set(connector.id, connector)
      return { connectors: next }
    })
  },

  updateConnector: (id, connector) => {
    // Check read-only mode
    if (useUIStore.getState().isReadOnly) {
      console.warn('Cannot update connector in read-only mode')
      return
    }
    
    set((state) => {
      const next = new Map(state.connectors)
      next.set(id, connector)
      return { connectors: next }
    })
  },

  deleteConnector: (id) => {
    // Check read-only mode
    if (useUIStore.getState().isReadOnly) {
      console.warn('Cannot delete connector in read-only mode')
      return
    }
    
    const connector = get().connectors.get(id)
    
    if (connector) {
      // Push to history
      useHistoryStore.getState().push([
        {
          type: 'delete',
          connectorId: id,
          before: connector,
          isConnector: true,
        },
      ])
    }

    set((state) => {
      const next = new Map(state.connectors)
      next.delete(id)
      return { 
        connectors: next,
        selectedConnectorId: state.selectedConnectorId === id ? null : state.selectedConnectorId
      }
    })
  },

  deleteSelectedConnector: () => {
    const selectedId = get().selectedConnectorId
    if (selectedId) {
      get().deleteConnector(selectedId)
    }
  },

  getConnectorsForElement: (elementId) => {
    const connectors = get().connectors
    return Array.from(connectors.values()).filter(
      (c) => c.startElementId === elementId || c.endElementId === elementId
    )
  },

  clearConnectors: () => set({ connectors: new Map() }),
}))
