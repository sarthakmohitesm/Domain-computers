import express from 'express';
import { Profile } from '../models/Profile.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all profiles
router.get('/', authenticateToken, async (req, res) => {
  try {
    const profiles = await Profile.findAll();
    res.json(profiles);
  } catch (error) {
    console.error('Get profiles error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get profile by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const profile = await Profile.findById(req.params.id);
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    res.json(profile);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

