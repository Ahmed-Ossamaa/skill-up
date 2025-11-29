const mongoose = require('mongoose');

const sectionSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Section title is required']
        },
        description: {
            type: String
        },
        isFree: {// needs implementation later (this is a free section for unEnrolled users)
            type: Boolean,
            default: false
        },
        order: {
            type: Number,
            default: 0
        },
        course: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Course',
            required: true
        },
        lessons: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Lesson',
                default: []
            }
        ]
    },
    { timestamps: true }
);

module.exports = mongoose.model('Section', sectionSchema);
