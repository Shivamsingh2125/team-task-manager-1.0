const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// @desc    Get all projects
// @route   GET /api/projects
// @access  Private
router.get('/', protect, async (req, res) => {
  let projects;
  if (req.user.role === 'Admin') {
    projects = await Project.find().populate('owner', 'name email').populate('members', 'name email');
  } else {
    projects = await Project.find({
      $or: [{ owner: req.user._id }, { members: req.user._id }]
    }).populate('owner', 'name email').populate('members', 'name email');
  }
  res.status(200).json(projects);
});

// @desc    Create a project
// @route   POST /api/projects
// @access  Private/Admin
router.post('/', protect, authorize('Admin'), async (req, res) => {
  const { title, description, members } = req.body;

  // Generate a random 6-character code
  const joinCode = Math.random().toString(36).substring(2, 8).toUpperCase();

  const project = await Project.create({
    title,
    description,
    owner: req.user._id,
    members: members || [],
    joinCode,
  });

  res.status(201).json(project);
});

// @desc    Update a project
// @route   PUT /api/projects/:id
// @access  Private/Admin
router.put('/:id', protect, authorize('Admin'), async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }

  const updatedProject = await Project.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  res.status(200).json(updatedProject);
});

// @desc    Delete a project
// @route   DELETE /api/projects/:id
// @access  Private/Admin
router.delete('/:id', protect, authorize('Admin'), async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }

  await project.deleteOne();

  res.status(200).json({ id: req.params.id });
});

// @desc    Join a project with code
// @route   POST /api/projects/join
// @access  Private
router.post('/join', protect, async (req, res) => {
  const { joinCode } = req.body;

  if (!joinCode) {
    res.status(400);
    throw new Error('Please provide a join code');
  }

  const project = await Project.findOne({ joinCode: joinCode.toUpperCase() });

  if (!project) {
    res.status(404);
    throw new Error('Invalid join code');
  }

  // Check if user is already a member or owner
  if (project.owner.toString() === req.user._id.toString()) {
    res.status(400);
    throw new Error('You are the owner of this project');
  }

  if (project.members.includes(req.user._id)) {
    res.status(400);
    throw new Error('You are already a member of this project');
  }

  project.members.push(req.user._id);
  await project.save();

  res.status(200).json({ message: 'Joined project successfully', project });
});

// @desc    Generate/Refresh join code for a project
// @route   PUT /api/projects/:id/generate-code
// @access  Private/Admin
router.put('/:id/generate-code', protect, authorize('Admin'), async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }

  const joinCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  project.joinCode = joinCode;
  await project.save();

  res.status(200).json(project);
});

module.exports = router;
