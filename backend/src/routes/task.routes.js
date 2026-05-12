const express = require('express');
const router = express.Router({ mergeParams: true });
// mergeParams: true → üst route'daki :projectId'yi burada da kullanabilmek için

const { getTasks, createTask, updateTask, deleteTask } = require('../controllers/task.controller');
const { authenticate } = require('../middleware/auth.middleware');

// /api/projects/:projectId/tasks
router.get('/', authenticate, getTasks);
router.post('/', authenticate, createTask);

// /api/tasks/:taskId
router.put('/:taskId', authenticate, updateTask);
router.delete('/:taskId', authenticate, deleteTask);

module.exports = router;