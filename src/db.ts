//backend/src/db.ts
import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI;

const connectDB = async () => {
  if (!MONGO_URI) {
    console.error('ERROR: MONGO_URI environment variable is not set in .env!');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(MONGO_URI);
    console.log(`MongoDB successfully connected: ${conn.connection.host}`);
  } catch (error) {
    if (error instanceof Error) {
      console.error(`MongoDB connection error: ${error.message}`);
    } else {
      console.error('MongoDB connection error:', error);
    }
    process.exit(1);
  }
};

export default connectDB;
