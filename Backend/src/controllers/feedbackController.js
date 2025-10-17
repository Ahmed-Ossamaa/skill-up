const Feedback = require('../models/Feedback');
const asyncHandler = require('express-async-handler');
const FeedbackService = require('../services/FeedbackService');
const ApiError = require('../utils/ApiError');


class FeedbackController {
    constructor() {
        this.feedbackService = new FeedbackService(Feedback);
    }
    createFeedback = asyncHandler(async (req, res) => {
        const feedback = await this.feedbackService.createFeedback(req.body);
        res.status(201).json({
            message: 'Feedback created & saved',
            data: feedback
        });
    });

    getAllFeedbacks = asyncHandler(async (req, res) => {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const feedbacks = await this.feedbackService.getAllFeedbacks(page, limit);

        res.status(200).json({ data: feedbacks });
    });

    getFeedbackById = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const userId = req.user.id;
        const feedback = await this.feedbackService.getFeedbackById(id);

        if (feedback.user.toString() !== userId && req.user.role !== 'admin') {
            throw ApiError.forbidden('Not authorized to view this feedback');
        }

        res.status(200).json({ data: feedback });
    });


    deleteFeedback = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const userId = req.user.id;
        const feedback = await this.feedbackService.getFeedbackById(id);

        if (feedback.user.toString() !== userId && req.user.role !== 'admin') {
            throw ApiError.forbidden('You are not authorized to delete this feedback');
        }
        await this.feedbackService.deleteFeedback(id);
        res.status(200).json({ message: 'Feedback deleted successfully' });
    });
}

module.exports = new FeedbackController();