const mongoose = require('mongoose');
const slugify = require('slugify');

const courseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required']
    },
    slug: {
        type: String,
        unique: true,
        lowercase: true
    },
    description: {
        type: String,
        required: [true, 'Description is required']
    },
    thumbnailUrl: { type: String },
    thumbnailPublicId: { type: String },

    status: {
        type: String,
        enum: ['draft', 'published', 'archived'],
        default: 'draft'
    },
    price: {
        type: Number,
        min: [0, "Price must be a positive number"],
        default: 0
    },
    level: {
        type: String,
        enum: ["beginner", "intermediate", "advanced"],
        default: "beginner"
    },
    rating: { type: Number, default: 0 },
    studentsCount: { type: Number, default: 0 },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    },
    sections: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Section'  
    }],

    instructor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    students: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],

}, { timestamps: true });

courseSchema.pre('save', function (next) {
    if (this.isModified('title')) {
        this.slug = slugify(this.title, { lower: true });
    }
    next();
});

module.exports = mongoose.model('Course', courseSchema);