

const express = require('express');
const router = express.Router();

const {
  getProjects,
  createProject,
  getProjectById,
  deleteProject,
  addMember
} = require('../controllers/project.controller');

const { authenticate } = require('../middleware/auth.middleware');

router.get('/', authenticate, getProjects);
router.post('/', authenticate, createProject);
router.get('/:id', authenticate, getProjectById);
router.delete('/:id', authenticate, deleteProject);
router.post('/:id/members', authenticate, addMember);

module.exports = router;