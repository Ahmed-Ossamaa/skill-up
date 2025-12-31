
class ReviewRepository {
    constructor(reviewModel) {
        this.Review = reviewModel;
    }

    async findAndCountAll(query, skip, limit) {
        const [reviews, total] = await Promise.all([
            this.Review.find(query)
                .populate('user', 'name email')
                .populate('course', 'title')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            this.Review.countDocuments(query)
        ]);
        return { reviews, total };
    }

    async findById(id) {
        return this.Review.findById(id);
    }

    async findOne(query) {
        return this.Review.findOne(query);
    }

    async create(data) {
        return this.Review.create(data);
    }

    async save(review) {
        return review.save();
    }

    async delete(review) {
        return review.deleteOne();
    }

    async findByCourseIds(courseIds, limit) {
        return this.Review.find({ course: { $in: courseIds } })
            .populate('user', 'name avatar')
            .populate('course', 'title slug')
            .sort({ createdAt: -1 })
            .limit(limit);
    }
}

module.exports = ReviewRepository;
