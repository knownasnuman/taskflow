
const taskService = require('../services/task.service');


const getTasks = async (req, res) => {
    try{
        const { projectId } = req.params;

        const tasks = await taskService.getTasks(projectId, req.user.userId);

        return res.status(200).json({ tasks });

    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({ error: error.message });
        }
        console.error('getTasks hatası:', error);
        return res.status(500).json({ error: 'Sunucu hatası' });        
    }
};

const createTask = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { title, description, status, priority, dueDate, assigneeId } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Görev başlığı zorunludur' });
    }

    const task = await taskService.createTask(projectId, req.user.userId, {
      title,
      description,
      status,
      priority,
      dueDate,
      assigneeId
    });

    return res.status(201).json({
      message: 'Görev oluşturuldu',
      task
    });

  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    console.error('createTask hatası:', error);
    return res.status(500).json({ error: 'Sunucu hatası' });
  }
};

const updateTask = async (req, res) => {
  try {

    const { taskId } = req.params;
    const { title, description, status, priority, dueDate, assigneeId } = req.body;

    const task = await taskService.updateTask(taskId, req.user.userId, {
      title,
      description,
      status,
      priority,
      dueDate,
      assigneeId
    });

    return res.status(200).json({
      message: 'Görev güncellendi',
      task
    });

  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    console.error('updateTask hatası:', error);
    return res.status(500).json({ error: 'Sunucu hatası' });
  }
};

const deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    await taskService.deleteTask(taskId, req.user.userId);

    return res.status(200).json({ message: 'Görev silindi' });

  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    console.error('deleteTask hatası:', error);
    return res.status(500).json({ error: 'Sunucu hatası' });
  }
};

module.exports = { getTasks, createTask, updateTask, deleteTask };