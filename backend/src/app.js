const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const http = require('http');        
const { initSocket } = require('./sockets/socket'); 

require('dotenv').config();

const app = express();
const server = http.createServer(app);

app.use(helmet());
app.use(cors());
app.use(express.json());

const authRoutes = require('./routes/auth.routes');
const projectRoutes = require('./routes/project.routes');
const taskRoutes = require('./routes/task.routes');

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/projects/:projectId/tasks', taskRoutes);

//sunucu ayakta mi
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

initSocket(server); 

const PORT = process.env.PORT || 3000;
server.listen(PORT, () =>{ 
    console.log(`Sunucu calisiyor: http://localhost:${PORT} `);
});

module.exports = app;