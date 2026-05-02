const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

const authRoutes = require('./routes/auth.routes');


app.use('/api/auth', authRoutes);

//Bu endpoint sunucunun ayakta olup olmadigini kontrol etmek icin 
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>{ 
    console.log(`Sunucu calisiyor: http://localhost:${PORT} `);
});

module.exports = app;