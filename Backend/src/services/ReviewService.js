const ApiError = require('../utils/ApiError');
const mongoose = require('mongoose');

class ReviewService {
    constructor(ReviewModel, CourseModel) {
        this.Review = ReviewModel;
        this.Course = CourseModel;

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

    async createReview(userId, courseId, data) {
        // Check if already reviewed
        const existing = await this.Review.findOne({ course: courseId, user: userId });
        if (existing) throw ApiError.badRequest('You have already reviewed this course');

        // create the review >>The Schema Hook will update rating in course schema 
        const review = await this.Review.create({ ...data, user: userId, course: courseId });

        return review;
    }



    async updateReview(reviewId, userId, userRole, data) {
        const review = await this.getReviewById(reviewId);

        if (review.user.toString() !== userId && userRole !== 'admin') {
            throw ApiError.forbidden('Not authorized to update this review');
        }

        review.rating = data.rating ?? review.rating;
        review.comment = data.comment ?? review.comment;

        // hook will  update ratings in course schema
        await review.save();
        return review;
    }

    async deleteReview(reviewId, userId, userRole) {
        const review = await this.getReviewById(reviewId);

        if (review.user.toString() !== userId || userRole !== 'admin') {
            throw ApiError.forbidden('Not authorized to delete this review');
        }

        await review.deleteOne();
        return;
    }

    async getReviewsByInstructor(instructorId, limit = 10) {
        const id = new mongoose.Types.ObjectId(String(instructorId));

        // get all courseIds for the instructor
        const courseIds = await this.Course.find({ instructor: id }).distinct('_id');
        if (!courseIds.length) return [];

        // Fetch reviews for the course 
        return await this.Review.find({ course: { $in: courseIds } })
            .populate('user', 'name avatar')
            .populate('course', 'title slug')
            .sort({ createdAt: -1 })
            .limit(limit);
    }
}

module.exports = ReviewService;
