import { connectDB } from '../config/db.js';
import { User } from '../models/User.js';
import { Profile } from '../models/Profile.js';
import { UserRole } from '../models/UserRole.js';
import dotenv from 'dotenv';

dotenv.config();

const createAdmin = async () => {
  try {
    await connectDB();

    const email = process.argv[2] || 'admin@example.com';
    const password = process.argv[3] || '123456';
    const fullName = process.argv[4] || 'Admin User';

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      console.log('User already exists with this email');
      process.exit(1);
    }

    // Create user
    const user = await User.create({ email, password });
    const userId = user._id.toString();

    // Create profile
    await Profile.create({
      id: userId,
      email,
      full_name: fullName,
      status: 'active',
    });

    // Create admin role
    await UserRole.create({
      user_id: userId,
      role: 'admin',
    });

    console.log('Admin user created successfully!');
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log('\nYou can now sign in with these credentials.');

    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
};

createAdmin();

