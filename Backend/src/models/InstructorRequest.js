const mongoose = require('mongoose');

const instructorRequestSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },

    experience: { type: String },
    documents: {
        nationalId: {
            url: { type: String },
            publicId: { type: String },

        },
        certificate: {
            url: { type: String },
            publicId: { type: String},

        },
        resume: {
            url: { type: String },
            publicId: { type: String },
        },

    },
    adminFeedback: String
}, { timestamps: true });

module.exports = mongoose.model('InstructorRequest', instructorRequestSchema);