// src/controllers/project.controller.js
const projectService = require("../services/project.service");

const getProjects = async (req, res) => {
  try {
    const projects = await projectService.getProjects(req.user.userId);

    return res.status(200).json({ projects });
  } catch (error) {
    console.error("getProjects hatası:", error);
    return res.status(500).json({ error: "Sunucu hatası" });
  }
};

const createProject = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Proje adı zorunludur" });
    }

    const project = await projectService.createProject(req.user.userId, {
      name,
      description,
    });

    return res.status(201).json({
      message: "Proje oluşturuldu",
      project,
    });
  } catch (error) {
    console.error("createProject hatası:", error);
    return res.status(500).json({ error: "Sunucu hatası" });
  }
};

const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;

    const project = await projectService.getProjectById(id, req.user.userId);

    return res.status(200).json({ project });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    console.error("getProjectById hatası:", error);
    return res.status(500).json({ error: "Sunucu hatası" });
  }
};

const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;

    await projectService.deleteProject(id, req.user.userId);

    return res.status(200).json({ message: "Proje silindi" });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    console.error("deleteProject hatası:", error);
    return res.status(500).json({ error: "Sunucu hatası" });
  }
};

const addMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, role } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email zorunludur" });
    }

    const member = await projectService.addMember(id, req.user.userId, {
      email,
      role,
    });

    return res.status(201).json({
      message: "Üye eklendi",
      member,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    console.error("addMember hatası:", error);
    return res.status(500).json({ error: "Sunucu hatası" });
  }
};

const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Proje adı zorunludur" });
    }

    const project = await projectService.updateProject(id, req.user.userId, {
      name,
      description,
    });

    return res.status(200).json({
      message: "Proje güncellendi",
      project,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    console.error("updateProject hatası:", error);
    return res.status(500).json({ error: "Sunucu hatası" });
  }
};

const removeMember = async (req, res) => {
  try {
    const { id, memberId } = req.params;

    await projectService.removeMember(id, req.user.userId, memberId);

    return res.status(200).json({ message: 'Üye çıkarıldı' });

  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    console.error('removeMember hatası:', error);
    return res.status(500).json({ error: 'Sunucu hatası' });
  }
};

module.exports = {
  getProjects,
  createProject,
  getProjectById,
  deleteProject,
  addMember,
  updateProject,
  removeMember,
};

