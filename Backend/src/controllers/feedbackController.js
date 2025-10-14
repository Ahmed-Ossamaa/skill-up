const Feedback = require('../models/Feedback');
const asyncHandler = require('express-async-handler');
const FeedbackService = require('../services/FeedbackService');


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
        if (Feedback.user.toString() !== userId || req.user.role !== 'admin') {
            res.status(401);
            throw new Error('User not authorized to delete this feedback');
        }
        const feedback = await this.feedbackService.getFeedbackById(id);
        res.status(200).json({ data: feedback });
    });

    deleteFeedback = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const userId = req.user.id;
        if (Feedback.user.toString() !== userId || req.user.role !== 'admin') {
            res.status(401);
            throw new Error('User not authorized to delete this feedback');
        }
        await this.feedbackService.deleteFeedback(id);
        res.status(200).json({ message: 'Feedback deleted successfully' });
    });
}

module.exports = new FeedbackController();