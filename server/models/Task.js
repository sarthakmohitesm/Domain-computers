import { getDB } from '../config/db.js';
import { ObjectId } from 'mongodb';

export class Task {
  constructor(data) {
    this.customer_name = data.customer_name;
    this.contact_number = data.contact_number;
    this.device_name = data.device_name;
    this.accessories_received = data.accessories_received || '';
    this.problem_reported = data.problem_reported;
    this.assigned_to = data.assigned_to || null;
    this.status = data.status || 'not_started';
    this.staff_notes = data.staff_notes || null;
    this.rejection_reason = data.rejection_reason || null;
    this.comments = data.comments || [];
    this.images = data.images || [];
    this.created_by = data.created_by || null;
    this.completed_at = data.completed_at || null;
    this.created_at = data.created_at || new Date();
    this.updated_at = data.updated_at || new Date();
  }

  static async create(data) {
    const db = getDB();
    const task = {
      customer_name: data.customer_name,
      contact_number: data.contact_number,
      device_name: data.device_name,
      accessories_received: data.accessories_received || '',
      problem_reported: data.problem_reported,
      assigned_to: data.assigned_to || null,
      status: data.status || 'not_started',
      staff_notes: data.staff_notes || null,
      rejection_reason: data.rejection_reason || null,
      comments: [],
      images: data.images || [],
      created_by: data.created_by || null,
      completed_at: null,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const result = await db.collection('tasks').insertOne(task);
    return { ...task, _id: result.insertedId, id: result.insertedId.toString() };
  }

  static async findById(id) {
    const db = getDB();
    const objectId = typeof id === 'string' ? new ObjectId(id) : id;
    const task = await db.collection('tasks').findOne({ _id: objectId });
    if (task) {
      return { ...task, id: task._id.toString() };
    }
    return null;
  }

  static async update(id, updates) {
    const db = getDB();
    const objectId = typeof id === 'string' ? new ObjectId(id) : id;
    
    // If status is being set to 'approved', set completed_at
    if (updates.status === 'approved') {
      updates.completed_at = new Date();
    }
    
    const result = await db.collection('tasks').updateOne(
      { _id: objectId },
      { $set: { ...updates, updated_at: new Date() } }
    );
    return result;
  }

  static async addComment(id, comment) {
    const db = getDB();
    const objectId = typeof id === 'string' ? new ObjectId(id) : id;
    const result = await db.collection('tasks').updateOne(
      { _id: objectId },
      { 
        $push: { comments: { ...comment, timestamp: new Date() } },
        $set: { updated_at: new Date() }
      }
    );
    return result;
  }

  static async delete(id) {
    const db = getDB();
    const objectId = typeof id === 'string' ? new ObjectId(id) : id;
    const result = await db.collection('tasks').deleteOne({ _id: objectId });
    return result;
  }

  static async find(query = {}) {
    const db = getDB();
    const tasks = await db.collection('tasks').find(query).sort({ created_at: -1 }).toArray();
    return tasks.map(task => {
      const { _id, ...rest } = task;
      return {
        ...rest,
        id: _id.toString(),
      };
    });
  }

  static async findByAssignedTo(userId) {
    return await this.find({ assigned_to: userId });
  }

  static async findByStatus(status) {
    return await this.find({ status });
  }

  static async findUnassigned() {
    return await this.find({ assigned_to: null });
  }

  static async findAssigned() {
    return await this.find({ assigned_to: { $ne: null } });
  }

  static async search(searchQuery, filters = {}) {
    const db = getDB();
    const query = {};

    // Text search across customer name, device, problem
    if (searchQuery) {
      query.$or = [
        { customer_name: { $regex: searchQuery, $options: 'i' } },
        { device_name: { $regex: searchQuery, $options: 'i' } },
        { problem_reported: { $regex: searchQuery, $options: 'i' } },
        { contact_number: { $regex: searchQuery, $options: 'i' } },
      ];
    }

    // Status filter
    if (filters.status) {
      query.status = filters.status;
    }

    // Assigned to filter
    if (filters.assigned_to) {
      query.assigned_to = filters.assigned_to === 'unassigned' ? null : filters.assigned_to;
    }

    const tasks = await db.collection('tasks').find(query).sort({ created_at: -1 }).toArray();
    return tasks.map(task => {
      const { _id, ...rest } = task;
      return { ...rest, id: _id.toString() };
    });
  }
}
