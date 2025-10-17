const ApiError = require('../utils/ApiError');
class FeedbackService {
    constructor(FeedbackModel) {
        this.Feedback = FeedbackModel;
    }

    async createFeedback(data) {
        const feedback = await this.Feedback.create(data);
        return feedback;
    }

    async getAllFeedbacks(page = 1, limit = 10) { // get all feedbacks with pagination
        const skip = (page - 1) * limit;


        const [feedbacks, total] = await Promise.all([
            this.Feedback.find().skip(skip).limit(limit),//  feedbacks docs
            this.Feedback.countDocuments() // total number of feedbacks in DB
        ]);

        return {
            total,  // total number of feedbacks in DB
            page,   // current page number
            pages: Math.ceil(total / limit),    // total pages
            count: feedbacks.length,           // number of feedbacks in this page
            data: feedbacks                   // actual feedback docs
        };
    }


    async getFeedbackById(feedbackId) {
        const feedback = await this.Feedback.findById(feedbackId);
        if (!feedback) {
            throw ApiError.notFound('Feedback not found');
        }
        return feedback;
    }


    async deleteFeedback(feedbackId) {
        const feedback = await this.Feedback.findByIdAndDelete(feedbackId);
        if (!feedback) {
            throw ApiError.notFound('Feedback not found');
        }
        return feedback;
    }





}

module.exports = FeedbackService;