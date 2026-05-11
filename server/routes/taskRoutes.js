const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// @desc    Get all tasks
// @route   GET /api/tasks
// @access  Private
router.get('/', protect, async (req, res) => {
  let tasks;
  if (req.user.role === 'Admin') {
    tasks = await Task.find().populate('project', 'title').populate('assignedTo', 'name email');
  } else {
    tasks = await Task.find({ assignedTo: req.user._id }).populate('project', 'title').populate('assignedTo', 'name email');
  }
  res.status(200).json(tasks);
});

// @desc    Create a task
// @route   POST /api/tasks
// @access  Private/Admin
router.post('/', protect, authorize('Admin'), async (req, res) => {
  const { title, description, project, assignedTo, status, dueDate } = req.body;

  const task = await Task.create({
    title,
    description,
    project,
    assignedTo,
    status,
    dueDate,
  });

  res.status(201).json(task);
});

// @desc    Update a task (Admin can update all, Member only status)
// @route   PATCH /api/tasks/:id
// @access  Private
router.patch('/:id', protect, async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  // If user is member, they can only update status of tasks assigned to them
  if (req.user.role === 'Member') {
    if (task.assignedTo.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to update this task');
    }
    
    // Only allow status update for members
    const { status } = req.body;
    task.status = status || task.status;
    const updatedTask = await task.save();
    return res.status(200).json(updatedTask);
  }

  // Admin can update everything
  const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  res.status(200).json(updatedTask);
});

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private/Admin
router.delete('/:id', protect, authorize('Admin'), async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  await task.deleteOne();

  res.status(200).json({ id: req.params.id });
});

module.exports = router;
