import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import connectToMongoDB from './db.js';
import socketOperations from './socket.js';

const app = express();
app.use(cors({
  origin: '*', // Allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
})); // Apply CORS policy with specific options

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // Allow all origins
    methods: ['GET', 'POST'],
  },
});

connectToMongoDB()
socketOperations(io)

server.listen(3000, () => {
  console.log('Server running on port 3000');
});