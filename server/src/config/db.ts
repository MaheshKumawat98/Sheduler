import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { MongoMemoryServer } from 'mongodb-memory-server';

dotenv.config();

// Ensure VC++ runtime libs are on PATH
if (process.env.PATH && !process.env.PATH.includes('vclibs')) {
  process.env.PATH = 'C:\\Users\\DELL\\AppData\\Local\\Programs\\vclibs;' + process.env.PATH;
}

let memoryServer: MongoMemoryServer | null = null;

export const connectDB = async (): Promise<void> => {
  const mongoUri = process.env.MONGO_URI;
  const isPlaceholder =
    !mongoUri ||
    mongoUri.includes('your_mongodb_atlas_connection_string') ||
    mongoUri.includes('<db_username>');

  if (!isPlaceholder && mongoUri) {
    try {
      const conn = await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log(`MongoDB Connected: ${conn.connection.host}`);
      return;
    } catch (error) {
      console.warn('⚠️ Could not connect to remote MongoDB Atlas cluster. Falling back to in-memory MongoDB...');
    }
  }

  try {
    memoryServer = await MongoMemoryServer.create({
      instance: {
        dbName: 'scheduler',
      },
    });
    const uri = memoryServer.getUri();
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
};
