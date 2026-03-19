import express from 'express';
import cors from 'cors';
import { connectDB, getDB } from '../server/config/db.js';
import authRoutes from '../server/routes/auth.js';
import taskRoutes from '../server/routes/tasks.js';
import staffRoutes from '../server/routes/staff.js';
import profileRoutes from '../server/routes/profiles.js';

// On Vercel, environment variables are injected automatically into process.env.
// No need for dotenv - it would look for a .env file that doesn't exist on Vercel.

const app = express();

// Middleware
app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Ensure DB is connected for every request (Serverless Guard)
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('DB middleware error:', err.message);
    res.status(500).json({
      error: 'Database connection failed',
      details: err.message,
      mongodbUriExists: !!process.env.MONGODB_URI,
    });
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/profiles', profileRoutes);

// Health check with detailed debug info
app.get('/api/health', async (req, res) => {
  try {
    await connectDB();
    const db = getDB();
    await db.command({ ping: 1 });
    res.json({
      status: 'OK',
      message: 'Server and Database are connected',
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Health check failed:', err.message);
    res.status(500).json({
      status: 'Error',
      message: 'Database connection failed',
      details: err.message,
      env_uri_exists: !!process.env.MONGODB_URI,
      env_uri_prefix: process.env.MONGODB_URI ? process.env.MONGODB_URI.substring(0, 25) + '...' : 'NOT SET',
      env_jwt_exists: !!process.env.JWT_SECRET,
      vercel: !!process.env.VERCEL,
    });
  }
});

// Debug endpoint - shows which env vars exist (remove after debugging)
app.get('/api/debug-env', (req, res) => {
  res.json({
    MONGODB_URI_exists: !!process.env.MONGODB_URI,
    MONGODB_URI_prefix: process.env.MONGODB_URI ? process.env.MONGODB_URI.substring(0, 25) + '...' : 'NOT SET',
    JWT_SECRET_exists: !!process.env.JWT_SECRET,
    PORT: process.env.PORT || 'not set',
    NODE_ENV: process.env.NODE_ENV || 'not set',
    VERCEL: process.env.VERCEL || 'not set',
  });
});

export default app;
