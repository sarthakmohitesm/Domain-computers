import { MongoClient } from 'mongodb';

let client = null;
let db = null;
let connectionPromise = null;

export const connectDB = async () => {
  if (client && db) {
    // Verify the connection is still alive
    try {
      await db.command({ ping: 1 });
      return { client, db };
    } catch (e) {
      // Connection was lost, reset and reconnect
      console.log('MongoDB connection lost, reconnecting...');
      client = null;
      db = null;
      connectionPromise = null;
    }
  }

  if (connectionPromise) {
    return connectionPromise;
  }

  const uri = process.env.MONGODB_URI;
  
  if (!uri) {
    throw new Error(
      'MONGODB_URI environment variable is not set! ' +
      'If on Vercel, add it in Project Settings > Environment Variables. ' +
      'If local, add it to your .env file.'
    );
  }

  console.log('Connecting to MongoDB...', uri.replace(/:([^@]+)@/, ':****@'));
  
  connectionPromise = (async () => {
    try {
      client = new MongoClient(uri, {
        serverSelectionTimeoutMS: 10000, // 10 second timeout
        connectTimeoutMS: 10000,
      });
      await client.connect();
      db = client.db();
      
      console.log('MongoDB connected successfully');
      
      // Create indexes (catch errors to not block connection)
      await db.collection('users').createIndex({ email: 1 }, { unique: true }).catch(() => {});
      await db.collection('profiles').createIndex({ email: 1 }, { unique: true }).catch(() => {});
      await db.collection('user_roles').createIndex({ user_id: 1, role: 1 }, { unique: true }).catch(() => {});
      await db.collection('tasks').createIndex({ assigned_to: 1 }).catch(() => {});
      await db.collection('tasks').createIndex({ status: 1 }).catch(() => {});
      
      return { client, db };
    } catch (error) {
      console.error('MongoDB connection error:', error.message);
      client = null;
      db = null;
      connectionPromise = null;
      throw error;
    }
  })();

  return connectionPromise;
};

export const getDB = () => {
  if (!db) {
    throw new Error('Database not connected. Connection is in progress or failed.');
  }
  return db;
};

export const getClient = () => {
  if (!client) {
    throw new Error('Database client not connected.');
  }
  return client;
};

