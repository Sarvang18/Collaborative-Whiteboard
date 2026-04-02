const express = require('express')
const { createServer } = require('http')
const { Server } = require('socket.io')
const cors = require('cors')

const app = express()
app.use(cors())

const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: { origin: '*' }
})

const boards = new Map()
const users = new Map()
const shares = new Map() // Store shared board data

io.on('connection', (socket) => {
  const { boardId, userId } = socket.handshake.query
  
  console.log(`User ${userId} connected to board ${boardId}`)

  if (!boards.has(boardId)) {
    boards.set(boardId, { elements: [], version: 0 })
  }

  socket.join(boardId)
  
  const color = '#' + Math.floor(Math.random() * 16777215).toString(16)
  users.set(socket.id, { userId, boardId, color })

  // Send current board state
  socket.emit('board_state', boards.get(boardId))

  // Notify others
  socket.to(boardId).emit('user_joined', {
    user: { id: userId, name: `User ${userId.slice(0, 6)}` },
    color
  })

  socket.on('operation', (op) => {
    const board = boards.get(boardId)
    board.version++
    op.version = board.version
    
    socket.to(boardId).emit('operation', op)
  })

  socket.on('operations_batch', (ops) => {
    const board = boards.get(boardId)
    ops.forEach(op => {
      board.version++
      op.version = board.version
    })
    
    socket.to(boardId).emit('operations_batch', ops)
  })

  // Real-time collaboration events
  socket.on('element:add', (element) => {
    console.log(`Broadcasting element:add to board ${boardId}`)
    socket.to(boardId).emit('element:add', element)
  })

  socket.on('element:update', (data) => {
    console.log(`Broadcasting element:update to board ${boardId}`)
    socket.to(boardId).emit('element:update', data)
  })

  socket.on('element:delete', (ids) => {
    console.log(`Broadcasting element:delete to board ${boardId}`)
    socket.to(boardId).emit('element:delete', ids)
  })

  socket.on('connector:add', (connector) => {
    console.log(`Broadcasting connector:add to board ${boardId}`)
    socket.to(boardId).emit('connector:add', connector)
  })

  socket.on('connector:update', (data) => {
    console.log(`Broadcasting connector:update to board ${boardId}`)
    socket.to(boardId).emit('connector:update', data)
  })

  socket.on('connector:delete', (id) => {
    console.log(`Broadcasting connector:delete to board ${boardId}`)
    socket.to(boardId).emit('connector:delete', id)
  })

  socket.on('cursor_move', ({ x, y }) => {
    socket.to(boardId).emit('cursor_move', { userId, x, y })
  })

  socket.on('disconnect', () => {
    const user = users.get(socket.id)
    if (user) {
      socket.to(user.boardId).emit('user_left', { userId: user.userId })
      users.delete(socket.id)
    }
    console.log(`User disconnected`)
  })
})

// Share endpoints
app.use(express.json({ limit: '50mb' }))

app.post('/api/share', (req, res) => {
  try {
    const { boardId, boardName, elements, connectors, permission } = req.body
    const shareId = 's' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5)
    
    shares.set(shareId, {
      boardId,  // Store the original boardId so everyone joins the same room
      boardName,
      elements,
      connectors: connectors || [],
      permission,
      createdAt: new Date().toISOString()
    })
    
    console.log(`Created share ${shareId} for board ${boardId}`)
    
    res.json({ success: true, shareId })
  } catch (error) {
    console.error('Share error:', error)
    res.status(500).json({ success: false, error: error.message })
  }
})

app.get('/api/share/:shareId', (req, res) => {
  try {
    const { shareId } = req.params
    const shareData = shares.get(shareId)
    
    if (!shareData) {
      return res.status(404).json({ success: false, error: 'Share not found' })
    }
    
    res.json({ success: true, data: shareData })
  } catch (error) {
    console.error('Load share error:', error)
    res.status(500).json({ success: false, error: error.message })
  }
})

const PORT = 3001
httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
