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
        const existing = await this.Review.findOne({ course: courseId, user: userId });
        if (existing) throw ApiError.badRequest('You have already reviewed this course');

        const review = await this.Review.create({ ...data, user: userId, course: courseId });

        await this.updateCourseRatingOnCreate(courseId, data.rating)

        return review;
    }
    async updateCourseRatingOnCreate(courseId, newRating) {
        const course = await this.Course.findById(courseId);

        const totalRating = course.rating * course.ratingCount;
        const newTotal = totalRating + newRating;

        const newCount = course.ratingCount + 1;
        const newAverage = newTotal / newCount;

        course.rating = Number(newAverage.toFixed(2));
        course.ratingCount = newCount;

        await course.save();
    }

    async updateReview(reviewId, userId, userRole, data) {
        const review = await this.getReviewById(reviewId);

            if (review.user.toString() !== userId && userRole !== 'admin') {
            throw ApiError.forbidden('Not authorized to update this review');
        }
        review.rating = data.rating ?? review.rating;
        review.comment = data.comment ?? review.comment;
        await review.save();

        await this.recalculateCourseRating(review.course);
        return review;
    }

    async deleteReview(reviewId, userId, userRole) {
        const review = await this.getReviewById(reviewId);

        if (review.user.toString() !== userId && userRole !== 'admin') {
            throw ApiError.forbidden('Not authorized to delete this review');
        }
        const courseId = review.course;

        await review.remove();
        await this.recalculateCourseRating(courseId);
        return;
    }
    async recalculateCourseRating(courseId) {
        const stats = await this.Review.aggregate([
            { $match: { course: new mongoose.Types.ObjectId(courseId) } },
            { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } }
        ]);

        const avg = stats[0]?.avg || 0;
        const count = stats[0]?.count || 0;

        await this.Course.findByIdAndUpdate(courseId, {
            rating: Number(avg.toFixed(2)),
            ratingCount: count
        });
    }

}

module.exports = ReviewService;
