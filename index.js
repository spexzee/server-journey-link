import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();

const allowedOrigins = [
  'http://localhost:3000',  // Local development URL
  'https://sp-trip.vercel.app' // Production URL
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST'],
  credentials: true
}));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

const rooms = {};

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('join-room', ({ roomId, location, isAdmin }) => {
    if (!rooms[roomId]) {
      rooms[roomId] = { users: [], admin: socket.id };
    }

    rooms[roomId].users.push({ id: socket.id, location });
    socket.join(roomId);

    console.log(`User ${socket.id} joined room ${roomId}`);
    console.log(`Current users in room ${roomId}:`, rooms[roomId].users);

    if (rooms[roomId].admin === socket.id) {
      socket.emit('admin-user-joined', rooms[roomId].users);
    }

    io.to(roomId).emit('location-updated', rooms[roomId].users);
  });

  socket.on('update-location', ({ roomId, location }) => {
    if (rooms[roomId]) {
      rooms[roomId].users = rooms[roomId].users.map(user =>
        user.id === socket.id ? { ...user, location } : user
      );

      console.log(`Location updated for room ${roomId}:`, rooms[roomId].users);

      io.to(roomId).emit('location-updated', rooms[roomId].users);
    }
  });

  socket.on('disconnect', () => {
    for (const roomId in rooms) {
      rooms[roomId].users = rooms[roomId].users.filter(user => user.id !== socket.id);
      
      if (rooms[roomId].admin) {
        io.to(rooms[roomId].admin).emit('admin-user-joined', rooms[roomId].users);
      }

      io.to(roomId).emit('location-updated', rooms[roomId].users);
      console.log(`User ${socket.id} disconnected from room ${roomId}`);
    }
  });
});

app.get('/', (req, res) => {
  res.send("Hello, this is the server!");
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
