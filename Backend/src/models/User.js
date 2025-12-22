const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email (DB Error)']
    },
    password: {
        type: String,
        required: true,
        minLength: [8, 'Password must be at least 8 characters'],
        select: false
    },
    role: {
        type: String,
        enum: ['student', 'admin', 'instructor'],
        default: 'student'
    },
    bio: {
        type: String,
        maxLength: [200, 'Bio must be at most 200 characters'],
    },
    headline: {
        type: String,
        maxLength: [50, 'Headline must be at most 50 characters'],
    },
    website: {
        type: String,
        maxLength: [100, 'Website must be at most 100 characters'],
    },
    github: {
        type: String,
        maxLength: [100, 'Github must be at most 100 characters'],
    },
    linkedin: {
        type: String,
        maxLength: [100, 'Linkedin must be at most 100 characters'],
    },
    twitter: {
        type: String,
        maxLength: [100, 'Twitter must be at most 100 characters'],
    },

    resetPasswordToken: {
        type: String,
        select: false
    },
    resetPasswordExpires: {
        type: Date,
        select: false
    },
    refreshToken: {
        type: String,
        select: false
    },
    avatar: {
        url: { type: String },
        publicId: { type: String },
        type: { type: String },
    },
    status: {
        type: String,
        enum: ['active', 'banned'],
        default: 'active'
    },

    studentStats: {
        totalEnrolledCourses: { type: Number, default: 0 },
        totalAmountPaid: { type: Number, default: 0 }
    },

    instructorStats: {
        totalCoursesCreated: { type: Number, default: 0 }, //6 -- ossama 2
        totalStudentsTaught: { type: Number, default: 0 },//10
        totalEarnings: { type: Number, default: 0 }
    }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);