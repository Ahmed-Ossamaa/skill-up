const Review = require('../models/Review');
const ReviewService = require('../services/ReviewService');
const asyncHandler = require('express-async-handler');

class ReviewController {
    constructor() {
        this.reviewService = new ReviewService(Review);
    }

    getAllReviews = asyncHandler(async (req, res) => {
        const courseId= req.query.course;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const reviews = await this.reviewService.getAllReviews(courseId, page, limit);
        res.status(200).json({ data: reviews });
    });

    createReview = asyncHandler(async (req, res) => {
        const review = await this.reviewService.createReview(req.user.id, req.body);
        res.status(201).json({ message: 'Review created', data: review });
    });

    updateReview = asyncHandler(async (req, res) => {
        const review = await this.reviewService.updateReview(req.params.id, req.user.id, req.user.role, req.body);
        res.status(200).json({ message: 'Review updated', data: review });
    });

    deleteReview = asyncHandler(async (req, res) => {
        await this.reviewService.deleteReview(req.params.id, req.user.id, req.user.role);
        res.status(200).json({ message: 'Review deleted' });
    });
}

module.exports = new ReviewController();
