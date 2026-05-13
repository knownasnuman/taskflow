

const prisma = require('../lib/prisma');


const getProjects = async (userId) => {
    return await prisma.project.findMany({
        where: {
            OR: [
                { ownerId: userId},
                { members: { some: { userId }}}
            ]
        },
        include: {
            owner: {
                select: { id: true, name: true, email: true }
            },
            _count: { 
                select: {members: true, tasks: true }
            }
        },
        orderBy: { createdAt: 'desc'}

    });
};

const createProject = async (userId, {name, description}) => {
  return await prisma.$transaction(async (tx) => {
    const project = await tx.project.create({
      data: {
        name,
        description,
        ownerId: userId,
      },
      include: {
        owner: {
          select: { id: true, name: true, email: true }
        },
        _count: {
          select: { members: true, tasks: true }
        }
      }
    });

    await tx.projectMember.create({
      data: {
        projectId: project.id,
        userId,
        role: 'ADMIN'
      }
    });

    return project;
  });
};

const getProjectById = async(projectId, userId) =>{
    const project = await prisma.project.findUnique({
        where: { id: projectId},
        include: {
            owner:{
                select: { id: true, name: true, email: true}
            },
            members: {
                include: {
                    user: {
                        select: { id: true, name: true, email: true }
                    }
                }
            },
            tasks: {
                include: {
                    assignee: {
                        select: { id: true, name: true}
                    }
                },
                orderBy: { createdAt: 'desc'}
            }  
        }
    }); 
    
    if(!project) {
        const error =  new Error('Proje bulunamadi');
        error.statusCode = 404;
        throw error;
    }
    return project;
};

const deleteProject = async(projectId, userId) => {
    const project = await prisma.project.findUnique({
        where: { id: projectId}
    });
    
    if(!project){
        const error = new Error('Porje bulunamadi');
        error.statusCode = 404;
        throw error;
    }

    if(project.ownerId !== userId){
        const error = new Error('Sadece proje sahibi silebilir!!');
        error.statusCode = 404;
        throw error;
    }

    await prisma.project.delete({
        where: {id: projectId}
    });
};

const addMember = async (projectId, userId, {email, role}) => {

    const requester = await prisma.projectMember.findUnique({
        where: {
            projectId_userId: { projectId, userId}
        }
    });

    if (!requester || requester.role !== 'ADMIN') {
        const error = new Error('Üye ekleme yetkiniz yok');
        error.statusCode = 403;
        throw error;
    }

    const userToAdd = await prisma.user.findUnique({
        where: { email }
    });

    if (!userToAdd) {
        const error = new Error('Bu emailde kullanıcı bulunamadı');
        error.statusCode = 404;
        throw error;
    }

    const existing = await prisma.projectMember.findUnique({
        where: {
            projectId_userId: { projectId, userId: userToAdd.id }
        }
    });

    if (existing) {
        const error = new Error('Bu kullanıcı zaten üye');
        error.statusCode = 400;
        throw error;
    }

    return await prisma.projectMember.create({
        data: {
            projectId,
            userId: userToAdd.id,
            role: role || 'MEMBER'
        },
        include: {
            user: {
                select: { id: true, name: true, email: true }
            }
        }
    });
};

module.exports = { getProjects, createProject, getProjectById, deleteProject, addMember };