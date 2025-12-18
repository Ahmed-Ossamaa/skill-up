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
    thumbnail: {
        url: { type: String },
        publicId: { type: String },
        type: { type: String }
    },

    status: {
        type: String,
        enum: ['draft', 'published', 'archived'],
        default: 'draft'
    },
    price: {
        type: Number,
        min: [0, "Price must be a positive number"],
        default: 0,
        required: function () { return !this.isFree; }
    },
    discount: {
        type: Number,
        min: [0, "Discount must be a positive number"],
        default: 0
    },
    requirements: [{
        type: String
    }],
    learningOutcomes: [{
        type: String
    }],
    targetAudience: [{
        type: String
    }],

    language: {
        type: String,
        default: "English"
    },
    level: {
        type: String,
        enum: ["beginner", "intermediate", "advanced", "all levels"],
        default: "beginner"
    },
    rating: {
        type: Number,
        default: 0
    },
    ratingCount: {
        type: Number,
        default: 0
    },
    studentsCount: {
        type: Number,
        default: 0
    },
    isFree: {
        type: Boolean,
        default: false
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    sections: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Section',
        default: []
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

courseSchema.virtual("lessons", {
    ref: "Lesson",
    localField: "_id",
    foreignField: "course",
    justOne: false
});

courseSchema.set("toObject", { virtuals: true });
courseSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model('Course', courseSchema);