import { connectDB } from '../config/db.js';
import { User } from '../models/User.js';
import { UserRole } from '../models/UserRole.js';
import { Profile } from '../models/Profile.js';
import dotenv from 'dotenv';

dotenv.config();

const checkAdmin = async () => {
  try {
    await connectDB();

    const email = process.argv[2] || 'admin@example.com';

    console.log(`\nChecking admin user with email: ${email}\n`);

    // Find user
    const user = await User.findByEmail(email);
    if (!user) {
      console.log('❌ User not found in database');
      console.log('\n💡 You may need to create the admin user first:');
      console.log('   npm run create-admin [email] [password] [name]');
      process.exit(1);
    }

    console.log('✅ User found in database');
    console.log(`   User ID: ${user._id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Password hash exists: ${user.password ? 'Yes' : 'No'}`);

    // Check user role
    const userRole = await UserRole.findByUserId(user._id.toString());
    if (!userRole) {
      console.log('\n❌ User role not found');
      console.log('💡 The user exists but does not have a role assigned.');
      console.log('   This could be why login is failing.');
      process.exit(1);
    }

    console.log(`\n✅ User role found: ${userRole.role}`);
    if (userRole.role !== 'admin') {
      console.log('⚠️  Warning: User role is not "admin", it is:', userRole.role);
    }

    // Check profile
    const profile = await Profile.findById(user._id.toString());
    if (!profile) {
      console.log('\n⚠️  Profile not found (this might be okay)');
    } else {
      console.log(`\n✅ Profile found`);
      console.log(`   Full Name: ${profile.full_name || 'Not set'}`);
      console.log(`   Status: ${profile.status || 'Not set'}`);
    }

    // Test password verification
    const testPassword = process.argv[3];
    if (testPassword) {
      console.log(`\n🔐 Testing password verification...`);
      const isValid = await User.comparePassword(testPassword, user.password);
      if (isValid) {
        console.log('✅ Password is correct!');
      } else {
        console.log('❌ Password is incorrect');
      }
    } else {
      console.log('\n💡 To test password, run:');
      console.log(`   node server/scripts/checkAdmin.js ${email} <password>`);
    }

    console.log('\n✅ Admin user check completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error checking admin:', error);
    process.exit(1);
  }
};

checkAdmin();

