const ApiError = require('../utils/ApiError');
const feedbackRepository = require('../repositories/feedbackRepository');

class FeedbackService {
    constructor(feedbackRepository) {
        this.feedbackRepository = feedbackRepository;
    }

    async createFeedback(data) {
        return this.feedbackRepository.create(data);
    }

    async getAllFeedbacks(page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const { feedbacks, total } = await this.feedbackRepository.findAndCountAll(skip, limit);

        return {
            total,
            page,
            pages: Math.ceil(total / limit),
            count: feedbacks.length,
            data: feedbacks
        };
    }

    async getFeedbackById(feedbackId) {
        const feedback = await this.feedbackRepository.findById(feedbackId);
        if (!feedback) {
            throw ApiError.notFound('Feedback not found');
        }
        return feedback;
    }

    async updateFeedback(id, data) {
        const feedback = await this.feedbackRepository.findByIdAndUpdate(id, data, { new: true });
        if (!feedback) {
            throw ApiError.notFound('Feedback not found');
        }
        return feedback;
    }

    async deleteFeedback(feedbackId) {
        const feedback = await this.feedbackRepository.findByIdAndDelete(feedbackId);
        if (!feedback) {
            throw ApiError.notFound('Feedback not found');
        }
        return feedback;
    }
}

module.exports = FeedbackService;