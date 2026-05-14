const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

let io;

const initSocket  = (server) => {
    io = new Server(server, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST']
        }
    });

    io.use((socket, next) =>{
        const token = socket.handshake.auth.token;

        if(!token){
            return next( new Error  ('Token bulunamadi'));
        }
        try{
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            socket.user = decoded;
            next();
        } catch (error){
            next(new Error ('Gecersiz token'));
        }
    });

    io.on('connection', (socket) => {
        console.log(`Kullanici baglandi: ${socket.user.userId}`);

        socket.on('join_project', (projectId) => {
            socket.join(projectId);
            console.log(`${socket.user.userId} → ${projectId} odasına katıldı`);
        });

        socket.on('leave_project', (projectId) => {
            socket.leave(projectId);
            console.log(`${socket.user.userId} → ${projectId} odasından ayrıldı`);
        });

        socket.on('disconnect', () => {
        console.log(`Kullanıcı ayrıldı: ${socket.user.userId}`);
        });
    });
    return io;
};


const getIO = () => {
    if(!io) {
        throw new Error('Socket.IO henuz baslatilamadi');
    }
    return io;
};

module.exports = { initSocket, getIO };