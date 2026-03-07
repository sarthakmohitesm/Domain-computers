import express from 'express';
import { User } from '../models/User.js';
import { Profile } from '../models/Profile.js';
import { UserRole } from '../models/UserRole.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Get all staff members
router.get('/', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const staffRoles = await UserRole.findByRole('staff');
    const userIds = staffRoles.map(role => role.user_id);

    if (userIds.length === 0) {
      return res.json([]);
    }

    const profiles = await Profile.findByIds(userIds);
    res.json(profiles);
  } catch (error) {
    console.error('Get staff error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create staff member
router.post('/', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { email, password, full_name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Create user
    const user = await User.create({ email, password });
    const userId = user._id.toString();

    // Create profile
    await Profile.create({
      id: userId,
      email,
      full_name,
      status: 'active',
    });

    // Create staff role
    await UserRole.create({
      user_id: userId,
      role: 'staff',
    });

    res.status(201).json({
      id: userId,
      email,
      full_name,
      status: 'active',
    });
  } catch (error) {
    console.error('Create staff error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update staff status
router.put('/:id/status', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'disabled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    await Profile.update(id, { status });
    const profile = await Profile.findById(id);

    res.json(profile);
  } catch (error) {
    console.error('Update staff status error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete staff member
router.delete('/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;

    // Delete user role
    await UserRole.deleteByUserId(id);

    res.json({ message: 'Staff member removed successfully' });
  } catch (error) {
    console.error('Delete staff error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

