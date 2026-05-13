const prisma = require('../lib/prisma');

//gorev listesi 

const getTasks = async (projectId, userId) =>{


    //uyelik kontrolu 
    const member = await prisma.projectMember.findUnique({
        where: {
            projectId_userId: { projectId, userId }
        }
    });

    if(!member){
        const error = new Error('Bu projeye erisim yetkiniz yok');
        error.statusCode = 403;
        throw error;
    }

    return await prisma.task.findMany({
          where: { projectId },
          include: {
            assignee: {
                select: {id: true, name:true, email:true}
            },
            createdBy: {
                select: {id: true, name:true}
            },
            _count: {
                select: { comments:true}
            }
          },
          orderBy: { createdAt: 'desc'}
    });
};

//gorev olusturma

const createTask = async (projectId, userId, { title, description, status, priority, dueDate, assigneeId}) => {

    const member = await prisma.projectMember.findUnique({
        where: {
            projectId_userId: { projectId, userId}
        }
    });

    if(!member) {
        const error = new Error('Bu projeye erisim yetkiniz yok');
        error.statusCode = 403;
        throw error;
    }

    return await prisma.task.create({
        data: {
            title,
            description,
            status: status || 'TODO',
            priority: priority || 'MEDIUM',
            dueDate: dueDate ? new Date(dueDate) : null,
            projectId,
            createdById: userId,
            assigneeId: assigneeId || null,
        },
        include: { 
            assignee: {
                select: {id: true, name:true, email:true}
            },
            createdBy: {
                select: {id: true, name:true}
            }
        }
    });

};

//gorev guncelleme

const updateTask = async (taskId, userId, { title, description, status, priority, dueDate, assigneeId}) => {

    const task =  await prisma.task.findUnique({
        where: { id: taskId },
        include: {
            project: {
                include: {
                    members: true
                }
            }
        }
    });

    const isMember = task.project.members.some(m => m.userId === userId);
    if (!isMember) {
        const error = new Error('Bu göreve erişim yetkiniz yok');
        error.statusCode = 403;
        throw error;
    }

    return await prisma.task.update({
        where: { id: taskId },
        data: {
            ...(title && { title }),
            ...(description !== undefined && {description}),
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

};

//gorev sil

const deleteTask = async (taskId, userId) => {
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

  const member = task.project.members.find(m => m.userId === userId);
  const isAdmin = member?.role === 'ADMIN';
  const isCreator = task.createdById === userId;

  if (!isAdmin && !isCreator) {
    const error = new Error('Bu görevi silme yetkiniz yok');
    error.statusCode = 403;
    throw error;
  }

  await prisma.task.delete({ where: { id: taskId } });
};

module.exports = { getTasks, createTask, updateTask, deleteTask };