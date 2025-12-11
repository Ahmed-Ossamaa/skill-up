const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Title is required']
        },
        description: { type: String },
        type: {
            type: String,
            enum: ["video", "raw"],
            default: "video"
        },
        video: {
            url: { type: String },
            publicId: { type: String },
            type: { type: String }
        },
        resources: [{
            fileUrl: { type: String },
            filePublicId: { type: String },
            fileName: { type: String },
            fileType: { type: String }
        }],
        content: { type: String },
        duration: {
            type: Number,
            min: [1, "Duration must be a positive number"]
        },
        order: {
            type: Number,
            default: 0
        },
        isPreview: {
            type: Boolean,
            default: false
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
