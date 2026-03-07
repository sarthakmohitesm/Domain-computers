import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/domain-digital-haven';
let client = null;
let db = null;

export const connectDB = async () => {
  try {
    if (client && db) {
      return { client, db };
    }

    client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db();
    
    console.log('MongoDB connected successfully');
    
    // Create indexes
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('profiles').createIndex({ email: 1 }, { unique: true });
    await db.collection('user_roles').createIndex({ user_id: 1, role: 1 }, { unique: true });
    await db.collection('tasks').createIndex({ assigned_to: 1 });
    await db.collection('tasks').createIndex({ status: 1 });
    
    return { client, db };
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
};

export const getDB = () => {
  if (!db) {
    throw new Error('Database not connected. Call connectDB() first.');
  }
  return db;
};

export const getClient = () => {
  if (!client) {
    throw new Error('Database client not connected. Call connectDB() first.');
  }
  return client;
};

