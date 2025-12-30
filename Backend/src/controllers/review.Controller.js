const ReviewService = require('../services/ReviewService');
const asyncHandler = require('express-async-handler');

class ReviewController {
    constructor() {
        this.reviewService = new ReviewService();
    }

    getAllReviews = asyncHandler(async (req, res) => {
        const courseId = req.query.course;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const reviews = await this.reviewService.getAllReviews(courseId, page, limit);
        res.status(200).json({ data: reviews });
    });

    createReview = asyncHandler(async (req, res) => {
        const courseId = req.params.courseId;
        const review = await this.reviewService.createReview(req.user.id, courseId, req.body);
        res.status(201).json({ message: 'Review created', data: review });
    });

    updateReview = asyncHandler(async (req, res) => {
        const reviewId = req.params.reviewId;
        const review = await this.reviewService.updateReview(reviewId, req.user.id, req.user.role, req.body);
        res.status(200).json({ message: 'Review updated', data: review });
    });

    deleteReview = asyncHandler(async (req, res) => {
        await this.reviewService.deleteReview(req.params.id, req.user.id, req.user.role);
        res.status(200).json({ message: 'Review deleted' });
    });

    getReviewsByInstructor = asyncHandler(async (req, res) => {
        const instructorId = req.params.instructorId || req.user?.id;
        if (!instructorId) {
            return res.status(400).json({
                success: false,
                message: "No instructor identification provided."
            });
        }
        const limit = parseInt(req.query.limit) || 10;
        const reviews = await this.reviewService.getReviewsByInstructor(instructorId, limit);
        res.status(200).json({
            length: reviews.length,
            data: reviews
        });
    });
}

module.exports = new ReviewController();
