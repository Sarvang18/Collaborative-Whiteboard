# Collaborative Whiteboard

Production-level Figma-like collaborative whiteboard built with React, TypeScript, and HTML5 Canvas.

## Features

✅ Drawing tools: Rectangle, Ellipse, Text, Freehand Path
✅ Selection & drag-and-drop
✅ Zoom & pan (mouse wheel + shift+drag)
✅ Properties panel (fill, stroke, opacity)
✅ Layers panel
✅ Keyboard shortcuts (Delete, Ctrl+Z, Ctrl+Y, Ctrl+A)
✅ Real-time collaboration with Socket.io
✅ Multi-user cursors and presence
✅ Optimistic updates (works offline)

## Getting Started

### Frontend
```bash
npm install
npm run dev
```

### Backend (Optional - for collaboration)
```bash
cd server
npm install
npm start
```

The app works offline without the server. Start the server for real-time collaboration.

## Usage

- **Select Tool**: Click and drag elements
- **Draw Tools**: Click and drag to create shapes
- **Zoom**: Mouse wheel
- **Pan**: Shift + drag or middle mouse button
- **Delete**: Select element and press Delete/Backspace
- **Undo/Redo**: Ctrl+Z / Ctrl+Y
- **Select All**: Ctrl+A

## Architecture

- **Canvas Engine**: RAF-based rendering with dirty tracking
- **Viewport**: Zoom/pan with world ↔ screen transforms
- **State**: Zustand stores (canvas, session, history, UI)
- **Real-time**: Socket.io with operation-based sync
- **Optimistic Updates**: Local changes apply instantly
