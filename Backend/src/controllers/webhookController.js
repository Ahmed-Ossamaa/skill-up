const Stripe = require("stripe");
const Enrollment = require("../models/Enrollment");
const Course = require("../models/Course");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * Handles a webhook event from Stripe.
 * 
 * This function is responsible for handling any webhook events sent from Stripe.
 * It will construct the event from the request body and signature, and then
 * process the event accordingly.
 * 
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
            const existing = await Enrollment.findOne({ student: userId, course: courseId });

            if (!existing) {
                await Enrollment.create({
                    student: userId,
                    course: courseId,
                    status: "enrolled",
                    paymentId: paymentIntent.id,
                    amountPaid: realAmountPaid,
                });

                await Course.findByIdAndUpdate(courseId, {
                    $addToSet: { students: userId },
                    $inc: { studentsCount: 1 }
                });
            }

            console.log("User enrolled:", userId);
        } catch (err) {
            console.error("Enrollment error:", err);
            return res.status(500).json({ error: err.message });
        }
    }

    res.json({ received: true });
};
