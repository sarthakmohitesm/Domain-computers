import { connectDB, getDB } from '../config/db.js';
import dotenv from 'dotenv';

dotenv.config();

const migrateTaskIds = async () => {
  try {
    await connectDB();
    const db = getDB();

    console.log('Fetching tasks without task_id...');
    const tasks = await db.collection('tasks')
      .find({ task_id: { $exists: false } })
      .sort({ created_at: 1 })
      .toArray();

    if (tasks.length === 0) {
      console.log('No tasks found that need migration.');
      process.exit(0);
    }

    console.log(`Found ${tasks.length} tasks to migrate.`);

    // Get current counter or start at 1
    const counterDoc = await db.collection('counters').findOne({ _id: 'task_id' });
    let currentSeq = counterDoc ? counterDoc.seq : 0;

    for (const task of tasks) {
      currentSeq++;
      const taskId = `D${currentSeq.toString().padStart(4, '0')}`;
      
      await db.collection('tasks').updateOne(
        { _id: task._id },
        { $set: { task_id: taskId } }
      );
      console.log(`Updated task ${task._id} with ID ${taskId}`);
    }

    // Update the counter to match the last assigned sequence
    await db.collection('counters').updateOne(
      { _id: 'task_id' },
      { $set: { seq: currentSeq } },
      { upsert: true }
    );

    console.log('\nMigration complete successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

migrateTaskIds();
