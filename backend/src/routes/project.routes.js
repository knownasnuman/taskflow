

const express = require('express');
const router = express.Router();

const {
  getProjects,
  createProject,
  getProjectById,
  deleteProject,
  addMember,
  removeMember,
  updateProject,
} = require('../controllers/project.controller');

const { authenticate } = require('../middleware/auth.middleware');

router.get('/', authenticate, getProjects);
router.get('/:id', authenticate, getProjectById);
router.post('/', authenticate, createProject);
router.post('/:id/members', authenticate, addMember);
router.delete('/:id', authenticate, deleteProject);
router.delete('/:id/members/:memberId', authenticate, removeMember);
router.put('/:id', authenticate, updateProject);

module.exports = router;