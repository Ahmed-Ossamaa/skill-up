const Stripe = require("stripe");
const Enrollment = require("../models/Enrollment");
const Course = require("../models/Course");
const User = require("../models/User");
const EnrollmentService = require("../services/EnrollmentService");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const enrollmentService = new EnrollmentService(Enrollment, Course, User);

/**
 * Handles a webhook event from Stripe.
 * 
 * This function is responsible for handling any webhook events sent from Stripe.
 * It will construct the event from the request body and signature, and then
 * process the event accordingly.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<Object>} - A promise that resolves with the response object.
 */

exports.webhookHandler = async (req, res) => {
    const sig = req.headers["stripe-signature"];

    let event;
    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        console.error("Webhook signature verification failed.", err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle PaymentIntent success
    if (event.type === "payment_intent.succeeded") {
        const paymentIntent = event.data.object;

        // create payment intent
        const { userId, courseId } = paymentIntent.metadata;

        const realAmountPaid = paymentIntent.amount_received / 100;

        console.log("Payment succeeded for:", { userId, courseId });


        try {

            await enrollmentService.enroll(
                userId,
                courseId,
                realAmountPaid,
                paymentIntent.id
            );

            // await Course.findByIdAndUpdate(courseId, {
            //     $addToSet: { students: userId },
            //     $inc: { studentsCount: 1 }
            // });

            // await User.findByIdAndUpdate(userId, {
            //     $inc: {
            //         'studentStats.totalEnrolledCourses': 1,
            //         'studentStats.totalAmountPaid': realAmountPaid
            //     }
            // });

            console.log("User enrolled successfully:", userId);
        } catch (err) {
            if (err.message && err.message.includes("already enrolled")) {
                console.log("Enrollment already exists, skipping.");
                return res.json({ received: true });
            }

            console.error("Enrollment Service Error:", err);
            return res.status(500).json({ error: err.message });
        }
    }

    res.json({ received: true });
};
