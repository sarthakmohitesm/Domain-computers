import { getDB } from '../config/db.js';
import { ObjectId } from 'mongodb';

export class Profile {
  constructor(data) {
    this.id = data.id || data._id?.toString();
    this.email = data.email;
    this.full_name = data.full_name || null;
    this.status = data.status || 'active';
    this.created_at = data.created_at || new Date();
    this.updated_at = data.updated_at || new Date();
  }

  static async create(data) {
    const db = getDB();
    const profile = {
      id: data.id,
      email: data.email,
      full_name: data.full_name || null,
      status: data.status || 'active',
      created_at: new Date(),
      updated_at: new Date(),
    };

    const result = await db.collection('profiles').insertOne(profile);
    return { ...profile, _id: result.insertedId };
  }

  static async findById(id) {
    const db = getDB();
    return await db.collection('profiles').findOne({ id });
  }

  static async findByEmail(email) {
    const db = getDB();
    return await db.collection('profiles').findOne({ email });
  }

  static async update(id, updates) {
    const db = getDB();
    const result = await db.collection('profiles').updateOne(
      { id },
      { $set: { ...updates, updated_at: new Date() } }
    );
    return result;
  }

  static async findByIds(ids) {
    const db = getDB();
    return await db.collection('profiles').find({ id: { $in: ids } }).toArray();
  }

  static async findAll() {
    const db = getDB();
    return await db.collection('profiles').find({}).toArray();
  }

  static async delete(id) {
    const db = getDB();
    const result = await db.collection('profiles').deleteOne({ id });
    return result;
  }
}

