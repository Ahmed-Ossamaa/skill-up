const mongoose = require("mongoose");

const enrollmentSchema = new mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        course: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course",
            required: true,
        },

        // Actual lesson progress
        progress: {
            completedLessons: [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Lesson",
                    _id: false,
                    default: []
                }
            ],
            percentage: {
                type: Number,
                default: 0,
                min: 0,
                max: 100
            },
        },

        status: {
            type: String,
            enum: ["enrolled", "completed", "cancelled"],
            default: "enrolled",
        },

        enrolledAt: {
            type: Date,
            default: Date.now,
        },
        amountPaid: {
            type: Number,
            required: true,
            default: 0
        },

        completedAt: Date,
    },
    { timestamps: true }
);

// Prevent enrolling in same course twice
enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });

module.exports = mongoose.model("Enrollment", enrollmentSchema);
