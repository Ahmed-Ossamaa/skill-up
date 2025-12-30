const ApiError = require('../utils/ApiError');
const reviewRepository = require('../repositories/reviewRepository');
const courseRepository = require('../repositories/courseRepository');

class ReviewService {
    constructor() {
        this.reviewRepository = reviewRepository;
        this.courseRepository = courseRepository;
    }

    async getAllReviews(courseId, page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const query = {};
        if (courseId) query.course = courseId;

        const { reviews, total } = await this.reviewRepository.findAndCountAll(query, skip, limit);

        return {
            total,
            page,
            pages: Math.ceil(total / limit),
            count: reviews.length,
            data: reviews
        };
    }


    async getReviewById(id) {
        const review = await this.reviewRepository.findById(id);
        if (!review) throw ApiError.notFound('Review not found');
        return review;
    }

    async createReview(userId, courseId, data) {
        // Check if already reviewed
        const existing = await this.reviewRepository.findOne({ course: courseId, user: userId });
        if (existing) throw ApiError.badRequest('You have already reviewed this course');

        // create the review >>The Schema Hook will update rating in course schema 
        const review = await this.reviewRepository.create({ ...data, user: userId, course: courseId });

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
        await this.reviewRepository.save(review);
        return review;
    }

    async deleteReview(reviewId, userId, userRole) {
        const review = await this.getReviewById(reviewId);

        if (review.user.toString() !== userId && userRole !== 'admin') {
            throw ApiError.forbidden('Not authorized to delete this review');
        }

        await this.reviewRepository.delete(review);
        return;
    }

    async getReviewsByInstructor(instructorId, limit = 10) {
        const courses = await this.courseRepository.find({ instructor: instructorId });
        const courseIds = courses.map(course => course._id);
        if (!courseIds.length) return [];

        // Fetch reviews for the course 
        return this.reviewRepository.findByCourseIds(courseIds, limit);
    }
}

module.exports = ReviewService;
