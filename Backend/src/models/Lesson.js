const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Title is required']
        },
        description: { type: String },
        videoUrl: {
            type: String,
            required: [true, 'Video URL is required']
        },
        videoPublicId: { type: String },
        resources: [
            {
                fileUrl: String,
                filePublicId: String,
                fileName: String,
                fileType: String
            }
        ],
        duration: {
            type: Number,
            required: [true, 'Duration is required'],
            min: [1, "Duration must be a positive number"]
        },
        order: {
            type: Number,
            default: 0
        },
        section: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Section",
            required: true
        },
        course: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course",
            required: true,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Lesson", lessonSchema);
