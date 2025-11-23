const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    progress: {
        type: Number,
        default: 0
    },
    notes: {
        type: String,
        default: ''
    },
    completedLessons: [{
        lesson: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' },
        completedAt: Date
    }],
    status: {
        type: String,
        enum: ['active', 'completed'],
        default: 'active'
    },
    enrolledAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

module.exports = mongoose.model('Enrollment', enrollmentSchema);
