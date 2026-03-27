import bcrypt from 'bcryptjs';
import { getDB } from '../config/db.js';
import { ObjectId } from 'mongodb';

export class User {
  constructor(data) {
    this.email = data.email;
    this.password = data.password;
    this.created_at = data.created_at || new Date();
    this.updated_at = data.updated_at || new Date();
  }

  static async create(data) {
    const db = getDB();
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = {
      email: data.email,
      password: hashedPassword,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const result = await db.collection('users').insertOne(user);
    return { ...user, _id: result.insertedId, id: result.insertedId.toString() };
  }

  static async findByEmail(email) {
    const db = getDB();
    return await db.collection('users').findOne({ email });
  }

  static async findById(id) {
    const db = getDB();
    const objectId = typeof id === 'string' ? new ObjectId(id) : id;
    return await db.collection('users').findOne({ _id: objectId });
  }

  static async comparePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  static async updatePassword(id, hashedPassword) {
    const db = getDB();
    const objectId = typeof id === 'string' ? new ObjectId(id) : id;
    const result = await db.collection('users').updateOne(
      { _id: objectId },
      { $set: { password: hashedPassword, updated_at: new Date() } }
    );
    return result;
  }

  static async delete(id) {
    const db = getDB();
    const objectId = typeof id === 'string' ? new ObjectId(id) : id;
    const result = await db.collection('users').deleteOne({ _id: objectId });
    return result;
  }
}
