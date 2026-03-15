import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import authRoutes from './routes/auth.js';
import taskRoutes from './routes/tasks.js';
import staffRoutes from './routes/staff.js';
import profileRoutes from './routes/profiles.js';

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
    res.status(500).json({ error: `Database connection failed: ${err.message}` });
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

// Migration endpoint (One-time use)
app.get('/api/migrate-task-ids', async (req, res) => {
  try {
    const { getDB } = await import('./config/db.js');
    const db = getDB();
    
    const tasks = await db.collection('tasks')
      .find({ task_id: { $exists: false } })
      .sort({ created_at: 1 })
      .toArray();
      
    if (tasks.length === 0) {
      return res.json({ message: 'No tasks need migration' });
    }
    
    const counterDoc = await db.collection('counters').findOne({ _id: 'task_id' });
    let currentSeq = counterDoc ? counterDoc.seq : 0;
    
    const updates = [];
    for (const task of tasks) {
      currentSeq++;
      const taskId = `D${currentSeq.toString().padStart(4, '0')}`;
      updates.push(
        db.collection('tasks').updateOne({ _id: task._id }, { $set: { task_id: taskId } })
      );
    }
    
    await Promise.all(updates);
    await db.collection('counters').updateOne({ _id: 'task_id' }, { $set: { seq: currentSeq } }, { upsert: true });
    
    res.json({ message: `Successfully migrated ${tasks.length} tasks`, last_id: `D${currentSeq.toString().padStart(4, '0')}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Seed completed tasks route
app.get('/api/seed-completed-tasks', async (req, res) => {
  try {
    const { getDB } = await import('./config/db.js');
    const db = getDB();
    
    // Get current seq to start seeding
    const counterDoc = await db.collection('counters').findOneAndUpdate(
      { _id: 'task_id' },
      { $inc: { seq: 15 } },
      { upsert: true, returnDocument: 'after' }
    );
    let seedStartSeq = (counterDoc.value ? counterDoc.value.seq : counterDoc.seq) - 15;
    
    const completedTasks = [];
    const now = new Date();
    
    for (let i = 0; i < 15; i++) {
      const seq = seedStartSeq + i + 1;
      const taskId = `D${seq.toString().padStart(4, '0')}`;
      completedTasks.push({
        task_id: taskId,
        customer_name: `Test Customer ${seq}`,
        contact_number: `98765432${seq.toString().padStart(2, '0')}`,
        device_name: i % 2 === 0 ? 'Laptop' : 'Desktop',
        problem_reported: `Sample completed task ${taskId}`,
        status: 'approved',
        completed_at: now,
        created_at: now,
        updated_at: now,
        assigned_to: null,
        staff_notes: 'System generated seed task.',
        comments: [],
        images: [],
        created_by: null
      });
    }
    
    await db.collection('tasks').insertMany(completedTasks);
    res.json({ message: `Successfully seeded 15 completed tasks starting from ${seedStartSeq + 1}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
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
