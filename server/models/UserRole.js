import { getDB } from '../config/db.js';
import { ObjectId } from 'mongodb';

export class UserRole {
  constructor(data) {
    this.user_id = data.user_id;
    this.role = data.role; // 'admin' or 'staff'
    this.created_at = data.created_at || new Date();
  }

  static async create(data) {
    const db = getDB();
    const userRole = {
      user_id: data.user_id,
      role: data.role,
      created_at: new Date(),
    };

    const result = await db.collection('user_roles').insertOne(userRole);
    return { ...userRole, _id: result.insertedId, id: result.insertedId.toString() };
  }

  static async findByUserId(userId) {
    const db = getDB();
    return await db.collection('user_roles').findOne({ user_id: userId });
  }

  static async findByRole(role) {
    const db = getDB();
    return await db.collection('user_roles').find({ role }).toArray();
  }

  static async deleteByUserId(userId) {
    const db = getDB();
    const result = await db.collection('user_roles').deleteMany({ user_id: userId });
    return result;
  }

  static async hasRole(userId, role) {
    const db = getDB();
    const userRole = await db.collection('user_roles').findOne({ user_id: userId, role });
    return !!userRole;
  }
}

