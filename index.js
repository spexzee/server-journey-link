import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

// Create an Express application
const app = express();

// Define allowed origins for CORS
const allowedOrigins = [
  'http://localhost:3000',  // Local development URL
  'https://sp-trip.vercel.app' // Production URL
];

// Configure CORS to allow specific origins
app.use(cors({
  origin: (origin, callback) => {
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST']
}));

// Create an HTTP server and integrate with Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST']
  }
});

// Object to store room data
const rooms = {};

// Handle socket connections
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Handle joining a room
  socket.on('join-room', ({ roomId, location, isAdmin }) => {
    if (!rooms[roomId]) {
      rooms[roomId] = { users: [], admin: socket.id }; // First user is the admin
    }

    // Add the user to the room
    rooms[roomId].users.push({ id: socket.id, location });
    socket.join(roomId);

    console.log(`User ${socket.id} joined room ${roomId}`);
    console.log(`Current users in room ${roomId}:`, rooms[roomId].users);

    // If the user is the admin, send them the list of users
    if (rooms[roomId].admin === socket.id) {
      socket.emit('admin-user-joined', rooms[roomId].users);
    }

    // Broadcast updated users' locations to everyone in the room
    io.to(roomId).emit('location-updated', rooms[roomId].users);
  });

  // Update user's location
  socket.on('update-location', ({ roomId, location }) => {
    if (rooms[roomId]) {
      // Find the user and update their location
      rooms[roomId].users = rooms[roomId].users.map(user =>
        user.id === socket.id ? { ...user, location } : user
      );

      console.log(`Location updated for room ${roomId}:`, rooms[roomId].users);

      io.to(roomId).emit('location-updated', rooms[roomId].users);
    }
  });

  // Handle user disconnect
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

// Define a simple route for testing
app.get('/', (req, res) => {
  res.send("Hello, this is the server!");
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
