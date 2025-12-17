const Stripe = require("stripe");
const Course = require("../models/Course");
const ApiError = require("../utils/ApiError");
const asyncHandler = require('express-async-handler');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * Creates a Stripe PaymentIntent for a course.
 * 
 * This function creates a Stripe PaymentIntent for a course. 
 * The payment intent is created with the amount of the course's price
 *  or sale price if it is on sale.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<Object>} - A promise that resolves with the response object.
 */
exports.createPaymentIntent = asyncHandler( async (req, res) => {

        const userId = req.user._id;
        const { courseId } = req.body;
        
        const course = await Course.findById(courseId);
        if (!course) throw ApiError.notFound("Course not found");

        if (course.isFree) {
            return res.status(400).json({ message: "This course is already free." });
        }

        const amount = course.price * 100;
            // course.salePrice > 0 ? course.salePrice * 100 : course.price * 100;

        // Create PaymentIntent
        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency: "usd",
            metadata: {
                courseId: course._id.toString(),
                userId: userId.toString(),
                courseTitle: course.title
            },
            automatic_payment_methods: { enabled: true },
        });
        if(paymentIntent.error){
            console.log(paymentIntent.error.message);
            return res.status(400).json({ message: paymentIntent.error.message });
        }else{
            console.log("success",paymentIntent.client_secret);
            return res.status(200).json({
                clientSecret: paymentIntent.client_secret,
            });
        }

} );
