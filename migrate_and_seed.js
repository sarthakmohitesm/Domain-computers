import { connectDB, getDB } from './server/config/db.js';
import dotenv from 'dotenv';
import { ObjectId } from 'mongodb';

dotenv.config();

const main = async () => {
    try {
        const { client, db } = await connectDB();
        console.log('Connected to MongoDB');

        // 1. Fix missing IDs for all existing tasks
        console.log('Fixing Task IDs...');
        const tasks = await db.collection('tasks').find({ task_id: { $exists: false } }).sort({ created_at: 1 }).toArray();
        console.log(`Found ${tasks.length} tasks without IDs`);

        const counterDoc = await db.collection('counters').findOneAndUpdate(
            { _id: 'task_id' },
            { $inc: { seq: tasks.length } },
            { upsert: true, returnDocument: 'after' }
        );
        let startSeq = (counterDoc.value ? counterDoc.value.seq : counterDoc.seq) - tasks.length;
        
        for (let i = 0; i < tasks.length; i++) {
            const taskId = `D${(startSeq + i + 1).toString().padStart(4, '0')}`;
            await db.collection('tasks').updateOne({ _id: tasks[i]._id }, { $set: { task_id: taskId } });
            console.log(`Task ${tasks[i]._id} assigned ID ${taskId}`);
        }

        // 2. Add 15 tasks to completed section
        console.log('Adding 15 completed tasks...');
        const completedTasks = [];
        const now = new Date();
        
        // Get current seq again to start seeding
        const seedCounterDoc = await db.collection('counters').findOneAndUpdate(
            { _id: 'task_id' },
            { $inc: { seq: 15 } },
            { upsert: true, returnDocument: 'after' }
        );
        let seedStartSeq = (seedCounterDoc.value ? seedCounterDoc.value.seq : seedCounterDoc.seq) - 15;

        for (let i = 0; i < 15; i++) {
            const seq = seedStartSeq + i + 1;
            const taskId = `D${seq.toString().padStart(4, '0')}`;
            completedTasks.push({
                task_id: taskId,
                customer_name: `Customer ${taskId}`,
                contact_number: `900000${taskId.slice(1)}`,
                device_name: i % 2 === 0 ? 'Laptop' : 'Desktop',
                problem_reported: `Sample issue solved for ${taskId}`,
                status: 'approved',
                completed_at: now,
                created_at: now,
                updated_at: now,
                assigned_to: null,
                staff_notes: 'Seed task for testing.',
                comments: [],
                images: [],
                created_by: null
            });
        }

        const result = await db.collection('tasks').insertMany(completedTasks);
        console.log(`Successfully added ${result.insertedCount} completed tasks.`);
        console.log('DONE!');
        process.exit(0);
    } catch (error) {
        console.error('CRITICAL ERROR:', error);
        process.exit(1);
    }
};

main();
