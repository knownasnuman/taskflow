const prisma = require("../lib/prisma");
const { getIO } = require("../sockets/socket");
const { sendTaskAssignedNotification } = require('./notification.service');

//gorev listesi

const getTasks = async (projectId, userId) => {
  //uyelik kontrolu
  const member = await prisma.projectMember.findUnique({
    where: {
      projectId_userId: { projectId, userId },
    },
  });

  if (!member) {
    const error = new Error("Bu projeye erisim yetkiniz yok");
    error.statusCode = 403;
    throw error;
  }

  return await prisma.task.findMany({
    where: { projectId },
    include: {
      assignee: {
        select: { id: true, name: true, email: true },
      },
      createdBy: {
        select: { id: true, name: true },
      },
      _count: {
        select: { comments: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

//gorev olusturma

const createTask = async (
  projectId,
  userId,
  { title, description, status, priority, dueDate, assigneeId },
) => {
  const member = await prisma.projectMember.findUnique({
    where: {
      projectId_userId: { projectId, userId },
    },
  });

  if (!member) {
    const error = new Error("Bu projeye erisim yetkiniz yok");
    error.statusCode = 403;
    throw error;
  }

  const task = await prisma.task.create({
    data: {
      title,
      description,
      status: status || "TODO",
      priority: priority || "MEDIUM",
      dueDate: dueDate ? new Date(dueDate) : null,
      projectId,
      createdById: userId,
      assigneeId: assigneeId || null,
    },
    include: {
      assignee: {
        select: { id: true, name: true, email: true, pushToken: true },
      },
      createdBy: {
        select: { id: true, name: true },
      },
      project: {
        select: { name: true },
      },
    },
  });

  // Atanan kişiye bildirim gönder (kendine atamadıysa)
  if (task.assignee && task.assignee.id !== userId && task.assignee.pushToken) {
    sendTaskAssignedNotification(
      task.assignee.pushToken,
      task.title,
      task.project.name
    );
  }

  return task;
};

//gorev guncelleme

const updateTask = async (taskId, userId, { title, description, status, priority, dueDate, assigneeId }) => {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      project: {
        include: { members: true }
      }
    }
  });

  if (!task) {
    const error = new Error('Görev bulunamadı');
    error.statusCode = 404;
    throw error;
  }

  const isMember = task.project.members.some(m => m.userId === userId);
  if (!isMember) {
    const error = new Error('Bu göreve erişim yetkiniz yok');
    error.statusCode = 403;
    throw error;
  }

  const isCreator = task.createdById === userId;
  const isAssignee = task.assigneeId === userId;

  // Sadece durum değişiyorsa — sadece assignee yapabilir
  const onlyStatusChange =
    status !== undefined &&
    title === undefined &&
    description === undefined &&
    priority === undefined &&
    dueDate === undefined &&
    assigneeId === undefined;

  if (onlyStatusChange) {
    if (!isAssignee) {
      const error = new Error('Görev durumunu sadece atanan kişi değiştirebilir');
      error.statusCode = 403;
      throw error;
    }
  } else {
    // Diğer her şey — sadece creator değiştirebilir
    if (!isCreator) {
      const error = new Error('Görevi sadece oluşturan kişi düzenleyebilir');
      error.statusCode = 403;
      throw error;
    }
  }

  const updatedTask = await prisma.task.update({
    where: { id: taskId },
    data: {
      ...(title && { title }),
      ...(description !== undefined && { description }),
      ...(status && { status }),
      ...(priority && { priority }),
      ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
      ...(assigneeId !== undefined && { assigneeId }),
    },
    include: {
      assignee: {
        select: { id: true, name: true, email: true }
      },
      createdBy: {
        select: { id: true, name: true }
      }
    }
  });

  // Assignee değiştiyse ve yeni assignee varsa bildirim gönder
  if (assigneeId && assigneeId !== task.assigneeId && assigneeId !== userId) {
    const newAssignee = await prisma.user.findUnique({
      where: { id: assigneeId },
      select: { pushToken: true }
    });

    if (newAssignee?.pushToken) {
      sendTaskAssignedNotification(
        newAssignee.pushToken,
        updatedTask.title,
        task.project.name
      );
    }
  }

  try {
    const io = getIO();
    io.to(task.projectId).emit('task_updated', updatedTask);
  } catch (e) {}

  return updatedTask;
};
//gorev sil

const deleteTask = async (taskId, userId) => {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      project: {
        include: { members: true },
      },
    },
  });

  if (!task) {
    const error = new Error("Görev bulunamadı");
    error.statusCode = 404;
    throw error;
  }

  const member = task.project.members.find((m) => m.userId === userId);
  const isAdmin = member?.role === "ADMIN";
  const isCreator = task.createdById === userId;

  if (!isAdmin && !isCreator) {
    const error = new Error("Bu görevi silme yetkiniz yok");
    error.statusCode = 403;
    throw error;
  }

  await prisma.task.delete({ where: { id: taskId } });
};

module.exports = { getTasks, createTask, updateTask, deleteTask };
