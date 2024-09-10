import mongoose from 'mongoose';

const connectToMongoDB = async () => {
  try {
    const mongoURI = 'mongodb+srv://spexzeeabufxu69:spexzee@cluster0.qkyze.mongodb.net/Road-Trip?retryWrites=true&w=majority&appName=Cluster0';
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB successfully');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1);
  }
};

export default connectToMongoDB;
