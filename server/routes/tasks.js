import express from 'express';
import { Task } from '../models/Task.js';
import { Profile } from '../models/Profile.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { appendTaskToSheet } from '../config/googleSheets.js';

const router = express.Router();

// Search tasks
router.get('/search', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { q, status, assigned_to } = req.query;
    const tasks = await Task.search(q || '', { status, assigned_to });
    res.json(tasks);
  } catch (error) {
    console.error('Search tasks error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all tasks (admin only)
router.get('/', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { status, assigned_to } = req.query;
    let query = {};

    if (status) {
      query.status = status;
    }
    if (assigned_to) {
      query.assigned_to = assigned_to === 'null' ? null : assigned_to;
    }

    const tasks = await Task.find(query);
    res.json(tasks);
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get unassigned tasks
router.get('/unassigned', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const tasks = await Task.findUnassigned();
    res.json(tasks);
  } catch (error) {
    console.error('Get unassigned tasks error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get assigned tasks
router.get('/assigned', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const tasks = await Task.findAssigned();
    res.json(tasks);
  } catch (error) {
    console.error('Get assigned tasks error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get tasks by status
router.get('/status/:status', authenticateToken, async (req, res) => {
  try {
    const { status } = req.params;
    const tasks = await Task.findByStatus(status);
    res.json(tasks);
  } catch (error) {
    console.error('Get tasks by status error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get my tasks (staff)
router.get('/my-tasks', authenticateToken, async (req, res) => {
  try {
    const tasks = await Task.findByAssignedTo(req.user.userId);
    // Filter out approved tasks
    const filteredTasks = tasks.filter(t => t.status !== 'approved');
    res.json(filteredTasks);
  } catch (error) {
    console.error('Get my tasks error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get task by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json(task);
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create task
router.post('/', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { customer_name, contact_number, device_name, accessories_received, problem_reported } = req.body;

    if (!customer_name || !contact_number || !device_name || !problem_reported) {
      return res.status(400).json({ error: 'All required fields must be filled' });
    }

    const task = await Task.create({
      customer_name,
      contact_number,
      device_name,
      accessories_received: accessories_received || '',
      problem_reported,
      created_by: req.user.userId,
      status: 'not_started',
    });

    res.status(201).json(task);
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update task
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Staff can only update their own tasks
    if (req.user.role === 'staff' && task.assigned_to !== req.user.userId) {
      return res.status(403).json({ error: 'You can only update your own tasks' });
    }

    const updates = req.body;
    await Task.update(req.params.id, updates);

    const updatedTask = await Task.findById(req.params.id);
    res.json(updatedTask);
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add comment to task
router.post('/:id/comments', authenticateToken, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Comment text is required' });
    }

    const comment = {
      userId: req.user.userId,
      userEmail: req.user.email,
      userRole: req.user.role,
      text: text.trim(),
      timestamp: new Date(),
    };

    await Task.addComment(req.params.id, comment);
    const updatedTask = await Task.findById(req.params.id);
    res.json(updatedTask);
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete task (archive to Google Sheets first)
router.delete('/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    // Fetch the task before deleting
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Resolve assigned employee name
    let assignedEmployeeName = 'Unassigned';
    if (task.assigned_to) {
      const profile = await Profile.findById(task.assigned_to);
      if (profile) {
        assignedEmployeeName = profile.full_name || profile.email || 'Unknown';
      }
    }

    // Archive to Google Sheets before deleting
    try {
      await appendTaskToSheet({
        customer_name: task.customer_name,
        contact_number: task.contact_number,
        device_name: task.device_name,
        problem_reported: task.problem_reported,
        assigned_employee_name: assignedEmployeeName,
        completed_at: task.completed_at,
        updated_at: task.updated_at,
      });
    } catch (sheetError) {
      console.error('Google Sheets archive failed:', sheetError.message);
      return res.status(500).json({
        error: 'Failed to archive task to Google Sheet. Task was NOT deleted.',
        details: sheetError.message,
      });
    }

    // Delete from database after successful archiving
    const result = await Task.delete(req.params.id);
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json({ message: 'Task archived to Google Sheet and deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
