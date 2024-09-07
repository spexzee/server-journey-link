import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
app.use(cors()); // Apply CORS policy

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // Allow all origins
    methods: ['GET', 'POST'],
  },
});

// Object to store room data
let rooms = {};

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Create or join a room
  socket.on('join-room', ({ roomId, location, isAdmin }) => {
    // Create room if it doesn't exist
    if (!rooms[roomId]) {
      rooms[roomId] = { users: [], admin: socket.id }; // First user is the admin
    }

    // Add the user to the room with their location
    rooms[roomId].users.push({ id: socket.id, location });

    // Join the room on Socket.IO
    socket.join(roomId);

    // Log the user ID and location
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

      // Log the updated location array
      console.log(`Location updated for room ${roomId}:`, rooms[roomId].users);

      io.to(roomId).emit('location-updated', rooms[roomId].users);
    }
  });

  // Handle user disconnect
  socket.on('disconnect', () => {
    for (const roomId in rooms) {
      rooms[roomId].users = rooms[roomId].users.filter(user => user.id !== socket.id);
      
      // Emit the updated user list to the admin only
      if (rooms[roomId].admin) {
        io.to(rooms[roomId].admin).emit('admin-user-joined', rooms[roomId].users);
      }

      io.to(roomId).emit('location-updated', rooms[roomId].users);
      console.log(`User ${socket.id} disconnected from room ${roomId}`);
    }
  });
});

app.get('/', (req, res)=>{
  res.send("hello, spexzee")
})

server.listen(3000, () => {
  console.log('Server running on port 3000');
});
