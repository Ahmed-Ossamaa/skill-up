const ApiError = require('../utils/ApiError');

class ReviewService {
    constructor(ReviewModel) {
        this.Review = ReviewModel;
    }

    async getAllReviews(courseId, page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const query = {};
        if (courseId) query.course = courseId;

        const [reviews, total] = await Promise.all([
            this.Review.find(query)
                .populate('user', 'name email')
                .populate('course', 'title')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            this.Review.countDocuments(query)
        ]);

        return {
            total,
            page,
            pages: Math.ceil(total / limit),
            count: reviews.length,
            data: reviews
        };
    }


    async getReviewById(id) {
        const review = await this.Review.findById(id);
        if (!review) throw ApiError.notFound('Review not found');
        return review;
    }

    async createReview(userId, data) {
        const existing = await this.Review.findOne({ course: data.course, user: userId });
        if (existing) throw ApiError.badRequest('You have already reviewed this course');

        const review = await this.Review.create({ ...data, user: userId });
        return review;
    }

    async updateReview(reviewId, userId, userRole, data) {
        const review = await this.getReviewById(reviewId);

        if (review.user.toString() !== userId && userRole !== 'admin') {
            throw ApiError.forbidden('Not authorized to update this review');
        }

        Object.assign(review, data);
        await review.save();
        return review;
    }

    async deleteReview(reviewId, userId, userRole) {
        const review = await this.getReviewById(reviewId);

        if (review.user.toString() !== userId && userRole !== 'admin') {
            throw ApiError.forbidden('Not authorized to delete this review');
        }

        await review.remove();
        return;
    }
}

module.exports = ReviewService;
