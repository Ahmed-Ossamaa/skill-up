const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./config/db');
dotenv.config();
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const courseRoutes = require('./routes/courseRoutes');
const feedbackRoutes = require('./routes/feedBackRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const lessonRoutes = require('./routes/lessonRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const sectionRoutes = require('./routes/sectionRoutes');
const enrollmentRoutes = require('./routes/enrollmentRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const stripeWebhookRoute = require('./routes/stripeWebhook');
const ApiError = require('./utils/ApiError');
const errorHandler = require('./middlewares/errorHandler');
const cookieParser = require("cookie-parser");

const app = express();
db.connect("Mongo");
//=============================== Stripe Webhook ================================
app.use("/api/v1/webhook", stripeWebhookRoute);

//=============================== Middlewares ===================================
app.use(cors(
    {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        credentials: true
    }   
));
app.use(express.json());
app.use(cookieParser());

//=============================== Routes ===================================
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/courses', courseRoutes);
app.use('api/v1/enrollments', enrollmentRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/lessons', lessonRoutes);
app.use('/api/v1/reviews', reviewRoutes);
app.use('/api/v1/sections', sectionRoutes);
app.use('/api/v1/feedback', feedbackRoutes);
app.use("/api/v1/payments", paymentRoutes);

app.all(/.*/, (req, res, next) => {
    throw  ApiError.notFound(`Path ${req.originalUrl} not found`);
});

//===============================Error Handler===================================
app.use(errorHandler);


module.exports = app;