const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
    {
        course: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course",
            required: true
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        rating: {
            type: Number,
            required: [true, "Rating is required"],
            min: 1, max: 5
        },
        comment: {
            type: String,
            maxlength: [300, "Comment must be at most 300 characters"]
        },
    },
    { timestamps: true }
);

reviewSchema.index({ course: 1, user: 1 }, { unique: true })

reviewSchema.statics.updateCourseRating = async function (courseId) {
    const stats = await this.aggregate([
        { $match: { course: courseId } },
        {
            $group: {
                _id: '$course',
                nRating: { $sum: 1 },
                avgRating: { $avg: '$rating' }
            }
        }
    ]);

    if (stats.length > 0) {
        await mongoose.model('Course').findByIdAndUpdate(courseId, {
            ratingCount: stats[0].nRating,
            rating: parseFloat(stats[0].avgRating.toFixed(1))
        });
    } else {
        await mongoose.model('Course').findByIdAndUpdate(courseId, {
            ratingCount: 0,
            rating: 0
        });
    }
};
//after saving a review >> update course rating
reviewSchema.post('save', function () {
    this.constructor.updateCourseRating(this.course);
});

// Call after a review is deleted 
reviewSchema.post('findOneAndDelete', async function (doc) {
    if (doc) await doc.constructor.updateCourseRating(doc.course);
});

module.exports = mongoose.model("Review", reviewSchema);
