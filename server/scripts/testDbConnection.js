import dotenv from 'dotenv';
import { connectDB } from '../config/db.js';

// Load server .env if present
dotenv.config();

(async () => {
  try {
    const uri = process.env.MONGODB_URI;
    console.log('Attempting to connect to:', uri ? uri.replace(/:([^@]+)@/, ':****@') : 'undefined');
    const { client } = await connectDB();
    console.log('Test: MongoDB connection successful');
    await client.close();
    process.exit(0);
  } catch (err) {
    console.error('Test: MongoDB connection failed:', err);
    process.exit(1);
  }
})();
