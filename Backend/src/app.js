const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./config/db');
dotenv.config();
const stripeWebhookRoute = require('./routes/stripeWebhook');
const routes = require('./routes');
const ApiError = require('./utils/ApiError');
const errorHandler = require('./middlewares/errorHandler');
const cookieParser = require("cookie-parser");

const app = express();
db.connect("Mongo");
//=============================== Stripe Webhook ================================
app.use("/api/v1/payments/webhook", stripeWebhookRoute);

//=============================== Middlewares ===================================
app.set('trust proxy', 1);
app.use(cors(
    {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        credentials: true
    }
));
app.use(express.json());
app.use(cookieParser());

//==================== Health and Home (for Deployment) =========================
app.get('/', (req, res) => {
    res.send('Skill-Up API is running successfully');
});

//health check
app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

//================================= Routes =====================================
app.use('/api/v1', routes);

app.all(/.*/, (req, res, next) => {
    throw ApiError.notFound(`Path ${req.originalUrl} not found`);
});

//===============================Error Handler===================================
app.use(errorHandler);


module.exports = app;