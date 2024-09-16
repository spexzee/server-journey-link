import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    profilePic: {
        type: String,
        default: ''
        
    },
    password: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    rooms: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room'
    }]
});

const User = mongoose.model('User', userSchema);

export default User;
