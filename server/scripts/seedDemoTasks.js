import dotenv from 'dotenv';
dotenv.config();

import { connectDB, getDB } from '../config/db.js';

const demoTasks = [
    {
        customer_name: 'Rahul Sharma',
        contact_number: '9876543210',
        device_name: 'Dell Inspiron 15',
        problem_reported: 'Laptop not turning on, charging light blinks 3 times',
        accessories_received: 'Charger, Laptop Bag',
        status: 'not_started',
    },
    {
        customer_name: 'Priya Patel',
        contact_number: '9123456780',
        device_name: 'HP Pavilion x360',
        problem_reported: 'Screen flickering and display goes black randomly',
        accessories_received: 'Charger',
        status: 'working',
    },
    {
        customer_name: 'Amit Kumar',
        contact_number: '9988776655',
        device_name: 'Lenovo ThinkPad T480',
        problem_reported: 'Keyboard keys not responding, multiple keys stuck',
        accessories_received: 'Laptop only',
        status: 'working',
    },
    {
        customer_name: 'Neha Desai',
        contact_number: '8877665544',
        device_name: 'Asus ROG Strix',
        problem_reported: 'Overheating during gaming, fans making loud noise',
        accessories_received: 'Charger, Mouse',
        status: 'problem_found',
    },
    {
        customer_name: 'Vikram Singh',
        contact_number: '7766554433',
        device_name: 'MacBook Air M1',
        problem_reported: 'Battery draining very fast, only lasts 2 hours',
        accessories_received: 'MagSafe Charger',
        status: 'not_started',
    },
    {
        customer_name: 'Anita Joshi',
        contact_number: '9654321870',
        device_name: 'Acer Nitro 5',
        problem_reported: 'Blue screen error on startup, Windows not booting',
        accessories_received: 'Charger, Recovery USB',
        status: 'working',
    },
    {
        customer_name: 'Rajesh Gupta',
        contact_number: '8899001122',
        device_name: 'HP EliteBook 840',
        problem_reported: 'WiFi not connecting, Bluetooth also not working',
        accessories_received: 'Laptop only',
        status: 'submitted',
    },
    {
        customer_name: 'Sneha Reddy',
        contact_number: '7788990011',
        device_name: 'Dell XPS 13',
        problem_reported: 'Touchpad not clicking, cursor jumping randomly',
        accessories_received: 'Charger, External Mouse',
        status: 'working',
    },
    {
        customer_name: 'Manoj Tiwari',
        contact_number: '9567890123',
        device_name: 'Lenovo IdeaPad 3',
        problem_reported: 'Laptop very slow, takes 10 minutes to boot up',
        accessories_received: 'Charger',
        status: 'problem_found',
    },
    {
        customer_name: 'Kavita Nair',
        contact_number: '8456789012',
        device_name: 'Asus VivoBook 15',
        problem_reported: 'Speakers not working, no audio output from any app',
        accessories_received: 'Charger, Headphones',
        status: 'not_started',
    },
    {
        customer_name: 'Suresh Menon',
        contact_number: '9345678901',
        device_name: 'HP Omen 16',
        problem_reported: 'GPU not detected, games crashing with driver errors',
        accessories_received: 'Charger, Laptop Bag',
        status: 'working',
    },
    {
        customer_name: 'Divya Pillai',
        contact_number: '8234567890',
        device_name: 'Dell Latitude 5520',
        problem_reported: 'Hinge broken, screen wobbling and about to detach',
        accessories_received: 'Laptop only',
        status: 'submitted',
    },
    {
        customer_name: 'Arjun Verma',
        contact_number: '9012345678',
        device_name: 'Lenovo Legion 5',
        problem_reported: 'USB ports not recognizing any devices',
        accessories_received: 'Charger, USB Hub',
        status: 'working',
    },
    {
        customer_name: 'Pooja Mehta',
        contact_number: '7901234567',
        device_name: 'MacBook Pro 14',
        problem_reported: 'Water spill on keyboard, some keys not working',
        accessories_received: 'USB-C Charger',
        status: 'problem_found',
    },
    {
        customer_name: 'Karan Malhotra',
        contact_number: '8890123456',
        device_name: 'Acer Aspire 7',
        problem_reported: 'Hard drive making clicking noise, data recovery needed',
        accessories_received: 'Charger, External HDD',
        status: 'not_started',
    },
];

async function seedTasks() {
    try {
        await connectDB();
        const db = getDB();

        // Get all staff profiles to assign tasks
        const profiles = await db.collection('profiles').find({}).toArray();
        console.log(`\nFound ${profiles.length} staff profiles:`);
        profiles.forEach(p => console.log(`  - ${p.full_name || p.email} (ID: ${p.id})`));

        if (profiles.length === 0) {
            console.error('\nNo staff profiles found! Please create staff members first.');
            process.exit(1);
        }

        // Filter out admin-only profiles if possible (assign to staff)
        const userRoles = await db.collection('user_roles').find({ role: 'staff' }).toArray();
        const staffIds = userRoles.map(r => r.user_id);

        let assignableProfiles = profiles.filter(p => staffIds.includes(p.id));
        if (assignableProfiles.length === 0) {
            // Fallback: use all profiles
            assignableProfiles = profiles;
        }

        console.log(`\nAssigning tasks to ${assignableProfiles.length} staff members:`);
        assignableProfiles.forEach(p => console.log(`  - ${p.full_name || p.email}`));

        // Create tasks
        console.log(`\nCreating ${demoTasks.length} demo tasks...\n`);

        for (let i = 0; i < demoTasks.length; i++) {
            const task = demoTasks[i];
            const assignedStaff = assignableProfiles[i % assignableProfiles.length];

            const staffNotes = task.status === 'working' ? 'Currently diagnosing the issue' :
                task.status === 'problem_found' ? 'Found the root cause, parts needed' :
                    task.status === 'submitted' ? 'Repair completed, awaiting admin review' :
                        null;

            const newTask = {
                customer_name: task.customer_name,
                contact_number: task.contact_number,
                device_name: task.device_name,
                accessories_received: task.accessories_received,
                problem_reported: task.problem_reported,
                assigned_to: assignedStaff.id,
                status: task.status,
                staff_notes: staffNotes,
                rejection_reason: null,
                comments: [],
                images: [],
                created_by: assignedStaff.id,
                completed_at: null,
                created_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // random within last 7 days
                updated_at: new Date(),
            };

            const result = await db.collection('tasks').insertOne(newTask);
            console.log(`  ✅ ${task.customer_name} | ${task.device_name} | ${task.status} → Assigned to: ${assignedStaff.full_name || assignedStaff.email}`);
        }

        console.log(`\n🎉 Successfully created ${demoTasks.length} demo tasks!`);
        process.exit(0);
    } catch (error) {
        console.error('Error seeding tasks:', error);
        process.exit(1);
    }
}

seedTasks();
