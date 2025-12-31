const asyncHandler = require('express-async-handler');
const ApiError = require('../utils/ApiError');


class FeedbackController {
    constructor(feedbackService) {
        this.feedbackService =  feedbackService;
    }
    createFeedback = asyncHandler(async (req, res) => {
        const feedbackData = {
            subject: req.body.subject,
            message: req.body.message,
            email: req.body.email,
            name: req.body.name
        };
        if (req.user) {
            feedbackData.user = req.user.id;
            feedbackData.name = req.user.name;
            feedbackData.email = req.user.email;
        }
        const feedback = await this.feedbackService.createFeedback(feedbackData);
        res.status(201).json({
            message: 'Message sent successfully',
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

        const feedbackUserId = feedback.user ? feedback.user.toString() : null;

        if (feedbackUserId !== userId && req.user.role !== 'admin') {
            throw ApiError.forbidden('Not authorized to view this feedback');
        }

        res.status(200).json({ data: feedback });
    });

    updateFeedback = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const { status } = req.body;

        //Validate status (no JOI)
        if (!['new', 'read', 'replied'].includes(status)) {
            throw ApiError.badRequest('Invalid status');
        }

        const feedback = await this.feedbackService.updateFeedback(id, { status });

        res.status(200).json({
            message: 'Status updated successfully',
            data: feedback
        });
    });


    deleteFeedback = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const userId = req.user.id;
        const feedback = await this.feedbackService.getFeedbackById(id);

        const feedbackUserId = feedback.user ? feedback.user.toString() : null;

        if (feedbackUserId !== userId && req.user.role !== 'admin') {
            throw ApiError.forbidden('You are not authorized to delete this feedback');
        }

        await this.feedbackService.deleteFeedback(id);
        res.status(200).json({ message: 'Feedback deleted successfully' });
    });
}

module.exports =  FeedbackController;