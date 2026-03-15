import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from '../server/config/db.js';
import authRoutes from '../server/routes/auth.js';
import taskRoutes from '../server/routes/tasks.js';
import staffRoutes from '../server/routes/staff.js';
import profileRoutes from '../server/routes/profiles.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Increased limit to support base64 image uploads
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Ensure DB is connected for every request (Serverless Guard)
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    res.status(500).json({ 
      error: 'Database connection failed', 
      details: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/profiles', profileRoutes);

// Health check
app.get('/api/health', async (req, res) => {
  try {
    await connectDB();
    res.json({ status: 'OK', message: 'Server and Database are connected' });
  } catch (err) {
    res.status(500).json({ 
      status: 'Error', 
      message: 'Database connection failed', 
      details: err.message,
      env_uri_exists: !!process.env.MONGODB_URI
    });
  }
});

// Connect to MongoDB and start server
const startServer = async () => {
  try {
    await connectDB();
    
    if (!process.env.VERCEL) {
      app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
      });
    }
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err);
    if (!process.env.VERCEL) process.exit(1);
  }
};

startServer();

export default app;
