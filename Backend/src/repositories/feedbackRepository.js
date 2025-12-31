

class FeedbackRepository {
    constructor(feedbackModel) {
        this.Feedback = feedbackModel;
    }

    async create(data) {
        return this.Feedback.create(data);
    }

    async findAndCountAll(skip, limit) {
        const [feedbacks, total] = await Promise.all([
            this.Feedback.find().skip(skip).limit(limit),
            this.Feedback.countDocuments()
        ]);
        return { feedbacks, total };
    }

    async findById(id) {
        return this.Feedback.findById(id);
    }

    async findByIdAndUpdate(id, data, options) {
        return this.Feedback.findByIdAndUpdate(id, data, options);
    }

    async findByIdAndDelete(id) {
        return this.Feedback.findByIdAndDelete(id);
    }
}

module.exports =  FeedbackRepository;
