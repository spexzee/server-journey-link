import express from 'express';
import { nanoid } from 'nanoid'; // Import nanoid
import User from '../model/users.model.js';
import Room from '../model/room.model.js';

const router = express.Router();

// Route to create a room
router.post('/create-room', async (req, res) => {
    try {
        const { userId } = req.body;

        // Find the user who is creating the room
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Generate the room ID using nanoid
        const roomId = nanoid(8); // Generate an 8-character ID

        // Create a new room
        const newRoom = new Room({
            roomId,
            createdBy: user._id
        });

        await newRoom.save();  // Save the room to the database

        // Respond with the room ID
        res.status(201).json({ roomId, message: 'Room created successfully' });
    } catch (error) {
        console.error('Room creation error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
