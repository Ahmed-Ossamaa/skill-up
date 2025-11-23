require('dotenv').config();
const mongoose = require('mongoose');

// Import your models
const User = require('./src/models/User');
const Course = require('./src/models/Course');
const Lesson = require('./src/models/Lesson');
const Enrollment = require('./src/models/Enrollment');
const Category = require('./src/models/Category');
const Review = require('./src/models/Review'); 

mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

async function seed() {
    try {
        // --- Users ---
        const admin = await User.create({
            name: 'Admin User',
            email: 'admin@example.com',
            password: 'password123', // in real you hash it
            role: 'admin',
            status: 'active'
        });

        const instructor = await User.create({
            name: 'Instructor User',
            email: 'instructor@example.com',
            password: 'password123',
            role: 'instructor'
        });

        const student = await User.create({
            name: 'Student User',
            email: 'student@example.com',
            password: 'password123',
            role: 'student'
        });

        // --- Category ---
        const category = await Category.create({
            name: 'Programming',
            description: 'All programming courses'
        });

        // --- Course ---
        const course = await Course.create({
            title: 'Intro to JavaScript',
            description: 'Learn JS basics',
            status: 'published',
            instructor: instructor._id,
            category: category._id
        });

        // --- Lesson ---
        const lesson = await Lesson.create({
            title: 'JS Variables',
            videoUrl: 'https://example.com/video.mp4',
            duration: 10,
            course: course._id,
            createdBy: instructor._id
        });

        // --- Enrollment ---
        const enrollment = await Enrollment.create({
            student: student._id,
            course: course._id,
            progress: 0
        });

        // --- Review ---
        const review = await Review.create({
            course: course._id,
            user: student._id,
            rating: 5,
            comment: 'Great course!'
        });

        console.log('Dummy data created successfully!');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

seed();