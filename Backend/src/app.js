const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const goalRoutes = require('./routes/goalRoutes');
const feedbackRoutes = require('./routes/feedBackRoutes');

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/goals',goalRoutes);
app.use('/users', userRoutes);
app.use('/feedback', feedbackRoutes);

db.connect("Mongo");

module.exports = app;