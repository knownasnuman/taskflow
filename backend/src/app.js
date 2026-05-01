const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

//Test Endpoint
app.get('/', (req, res) => {
    res.json({message: 'TaskFlow API is working'});
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>{ 
    console.log(`Server ${PORT} portunda calisiyor`);
});

module.exports = app;