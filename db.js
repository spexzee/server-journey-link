import mongoose from 'mongoose';

const connectToMongoDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI 
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB successfully');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1);
  }
};

export default connectToMongoDB;
