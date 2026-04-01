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

const PORT = 3001
httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
