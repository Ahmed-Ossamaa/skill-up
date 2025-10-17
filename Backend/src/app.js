const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./config/db');
dotenv.config();
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const goalRoutes = require('./routes/goalRoutes');
const feedbackRoutes = require('./routes/feedBackRoutes');
const ApiError = require('./utils/ApiError');
const errorHandler = require('./middlewares/errorHandler');

const app = express();
db.connect("Mongo");

//===============================Middlewares===================================
app.use(cors());
app.use(express.json());

//===============================Routes===================================
app.use('/auth', authRoutes);
app.use('/goals', goalRoutes);
app.use('/users', userRoutes);
app.use('/feedback', feedbackRoutes);
app.all(/.*/, (req, res, next) => {
    throw  ApiError.notFound(`Path ${req.originalUrl} not found`);
});

//===============================Error Handler===================================
app.use(errorHandler);


module.exports = app;