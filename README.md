https://github.com/user-attachments/assets/09e825bb-cc6e-4869-834b-901182d5ca86


# Collaborative Whiteboard

Production-level Figma-like collaborative whiteboard built with React, TypeScript, and HTML5 Canvas.

## Features


### Core Drawing Tools
✅ Drawing tools: Rectangle, Ellipse, Triangle, Star, Arrow, Line, Text, Freehand Path
✅ Selection & drag-and-drop
✅ Zoom & pan (mouse wheel + shift+drag)
✅ Properties panel (fill, stroke, opacity)
✅ Layers panel
✅ Multi-board support with navigation

### Export & Import (NEW!)
✅ Export to PNG (high-resolution)
✅ Export to SVG (vector graphics)
✅ Export to PDF (print-ready)
✅ Export to JSON (editable format)
✅ Import JSON boards
✅ Import images (PNG, JPG, SVG, GIF, WebP)
✅ Drag & drop images directly onto canvas

### Clipboard Operations (NEW!)
✅ Copy/Paste (Ctrl+C / Ctrl+V)
✅ Cut (Ctrl+X)
✅ Duplicate (Ctrl+D)
✅ Cross-board copy/paste
✅ System clipboard integration

### Sharing (NEW!)
✅ Generate shareable links
✅ View-only permission
✅ Edit permission
✅ Link expiration support
✅ Copy link to clipboard

### Collaboration
✅ Real-time collaboration with Socket.io
✅ Multi-user cursors and presence
✅ Optimistic updates (works offline)

### Keyboard Shortcuts
✅ Delete: Delete / Backspace
✅ Undo: Ctrl+Z
✅ Redo: Ctrl+Y / Ctrl+Shift+Z
✅ Select All: Ctrl+A
✅ Copy: Ctrl+C
✅ Cut: Ctrl+X
✅ Paste: Ctrl+V
✅ Duplicate: Ctrl+D

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

### Basic Tools
- **Select Tool**: Click and drag elements
- **Draw Tools**: Click and drag to create shapes
- **Zoom**: Mouse wheel
- **Pan**: Shift + drag or middle mouse button

### Export & Import
- **Export**: Click Export button (top-right) and choose format (PNG/SVG/PDF/JSON)
- **Import**: Click Import button to load JSON boards or images
- **Drag & Drop**: Drag images directly onto the canvas

### Sharing
- **Share Board**: Click Share button, select permission (View/Edit), generate link
- **Copy Link**: Click copy button to share with others
- **Access Shared Board**: Open the shared link in any browser

### Clipboard
- **Copy**: Select elements and press Ctrl+C
- **Paste**: Press Ctrl+V to paste copied elements
- **Duplicate**: Select elements and press Ctrl+D for quick duplication

## Architecture

- **Canvas Engine**: RAF-based rendering with dirty tracking
- **Viewport**: Zoom/pan with world ↔ screen transforms
- **State**: Zustand stores (canvas, session, history, UI)
- **Real-time**: Socket.io with operation-based sync
- **Optimistic Updates**: Local changes apply instantly
- **Export Service**: High-accuracy PNG/SVG/PDF/JSON export
- **Import Service**: Robust file validation and sanitization
- **Share Service**: Link-based sharing with permissions
- **Clipboard Service**: Cross-board and system clipboard support
