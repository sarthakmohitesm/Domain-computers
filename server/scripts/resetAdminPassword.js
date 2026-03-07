import { connectDB } from '../config/db.js';
import { User } from '../models/User.js';
import { UserRole } from '../models/UserRole.js';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { getDB } from '../config/db.js';

dotenv.config();

const resetAdminPassword = async () => {
  try {
    await connectDB();

    const email = process.argv[2];
    const newPassword = process.argv[3];

    if (!email || !newPassword) {
      console.log('Usage: node server/scripts/resetAdminPassword.js <email> <new_password>');
      console.log('Example: node server/scripts/resetAdminPassword.js admin@example.com newpassword123');
      process.exit(1);
    }

    console.log(`\nResetting password for user: ${email}\n`);

    // Find user
    const user = await User.findByEmail(email);
    if (!user) {
      console.log('❌ User not found in database');
      process.exit(1);
    }

    // Check if user is admin
    const userRole = await UserRole.findByUserId(user._id.toString());
    if (!userRole || userRole.role !== 'admin') {
      console.log('⚠️  Warning: User is not an admin, but resetting password anyway...');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    const db = getDB();
    await db.collection('users').updateOne(
      { _id: user._id },
      { $set: { password: hashedPassword, updated_at: new Date() } }
    );

    console.log('✅ Password reset successfully!');
    console.log(`\nYou can now login with:`);
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${newPassword}\n`);

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error resetting password:', error);
    process.exit(1);
  }
};

resetAdminPassword();

