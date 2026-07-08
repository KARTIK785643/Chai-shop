import mongoose from 'mongoose';

export const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/chaispot';
  try {
    await mongoose.connect(mongoURI);
    console.log('MongoDB database connected successfully!');
  } catch (err) {
    console.error('Error connecting to MongoDB database:', err.message);
    // Do not exit the process, so that the server stays online and can report the connection error or allow CORS preflights.
  }
};
