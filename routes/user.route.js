import express from 'express';
import bcrypt from 'bcrypt';
import User from '../model/users.model.js';

const router = express.Router();

//register
router.post('/register', async (req, res) => {
    try {
        const { username, password , profilePic} = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user
        const newUser = new User({
            username,
            password: hashedPassword,
            profilePic : `api.multiavatar.com/${username}.svg`
        });

        await newUser.save();

        res.status(201).json({ message: 'User registered successfully', newUser });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});




// login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        res.json({ user});
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
