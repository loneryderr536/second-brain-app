require('dotenv').config();
require('./db'); // init DB + run migration on startup

const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json());

app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/birthdays', require('./routes/birthdays'));
app.use('/api/events', require('./routes/events'));
app.use('/api/points', require('./routes/points'));

require('./services/cronService');

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Second Brain backend running on port ${PORT}`));
