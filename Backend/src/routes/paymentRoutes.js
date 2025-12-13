const express = require("express");
const router = express.Router();
const { createPaymentIntent } = require("../controllers/paymentController");
const {protect} = require("../middlewares/AuthMW");

// Stripe PaymentIntent route
router.post("/create-payment-intent", protect, createPaymentIntent);

module.exports = router;
