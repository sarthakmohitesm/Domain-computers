import dotenv from 'dotenv';
import { connectDB, getDB } from '../config/db.js';
import bcrypt from 'bcryptjs';
import { ObjectId } from 'mongodb';

dotenv.config();

const [,, newEmail, newPassword, fullNameArg] = process.argv;

if (!newEmail || !newPassword) {
  console.error('Usage: node server/scripts/updateAdmin.js <email> <password> [full_name]');
  process.exit(1);
}

const main = async () => {
  try {
    await connectDB();
    const db = getDB();

    const userRolesColl = db.collection('user_roles');
    const usersColl = db.collection('users');
    const profilesColl = db.collection('profiles');

    // Try to find an existing admin role document
    const adminRoleDoc = await userRolesColl.findOne({ role: 'admin' });

    if (adminRoleDoc) {
      const userId = adminRoleDoc.user_id;
      const objectId = typeof userId === 'string' ? new ObjectId(userId) : userId;
      const user = await usersColl.findOne({ _id: objectId });

      if (!user) {
        console.log('Admin role exists but user record not found. Creating a new admin user and assigning the existing role.');
        const hashed = await bcrypt.hash(newPassword, 10);
        const result = await usersColl.insertOne({
          email: newEmail,
          password: hashed,
          created_at: new Date(),
          updated_at: new Date(),
        });
        const newUserId = result.insertedId;
        await userRolesColl.updateOne({ _id: adminRoleDoc._id }, { $set: { user_id: newUserId.toString() } });
        await profilesColl.updateOne(
          { id: userId },
          { $set: { id: newUserId.toString(), email: newEmail, full_name: fullNameArg || 'Admin User', status: 'active' } },
          { upsert: true }
        );
        console.log('Admin user created and role assigned.');
      } else {
        // Update existing admin user's email and password
        const hashed = await bcrypt.hash(newPassword, 10);
        await usersColl.updateOne(
          { _id: objectId },
          { $set: { email: newEmail, password: hashed, updated_at: new Date() } }
        );

        await profilesColl.updateOne(
          { id: userId },
          { $set: { email: newEmail, full_name: fullNameArg || (user.full_name || 'Admin User'), status: 'active' } },
          { upsert: true }
        );

        console.log('Admin user updated successfully.');
      }
    } else {
      // No admin role found: create new admin user + profile + role
      console.log('No admin role found. Creating a new admin user and role.');
      const hashed = await bcrypt.hash(newPassword, 10);
      const createRes = await usersColl.insertOne({
        email: newEmail,
        password: hashed,
        created_at: new Date(),
        updated_at: new Date(),
      });
      const newUserId = createRes.insertedId.toString();
      await profilesColl.insertOne({ id: newUserId, email: newEmail, full_name: fullNameArg || 'Admin User', status: 'active' });
      await userRolesColl.insertOne({ user_id: newUserId, role: 'admin' });
      console.log('Admin user created and role assigned.');
    }

    console.log(`Done. Admin email set to: ${newEmail}`);
    process.exit(0);
  } catch (err) {
    console.error('Error updating/creating admin:', err);
    process.exit(1);
  }
};

main();
