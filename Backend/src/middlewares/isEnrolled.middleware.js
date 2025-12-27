const Enrollment = require("../models/Enrollment");
const Lesson = require("../models/Lesson");
const ApiError = require("../utils/ApiError");

const isEnrolled = async (req, res, next) => {
    const lessonId = req.params.id;
    let courseId = req.params.courseId;
    
    let isPreview = false;

    if (lessonId) {
        const lesson = await Lesson.findById(lessonId).select('course isPreview'); 
        if (!lesson) {
            throw ApiError.notFound("Lesson not found");
        }
        courseId = lesson.course;
        isPreview = lesson.isPreview; 
    }

    if (isPreview) {
        return next();
    }

    // ......................Paid Lessons........................

    // Block Guests (User must be logged in for paid lessons)
    if (!req.user) {
        throw ApiError.unauthorized("Please log in to view this lesson");
    }

    // Allow Admin/Instructor
    if (req.user.role === 'instructor' || req.user.role === 'admin') {
        return next();
    }

    // Check Enrollment
    if (!courseId) {
        throw ApiError.badRequest("Course ID not found");
    }

    const enrollment = await Enrollment.findOne({
        student: req.user._id,
        course: courseId
    });

    if (!enrollment) {
        throw ApiError.forbidden("You must enroll in this course to view this lesson");
    }

    req.enrollment = enrollment;
    next();
};

module.exports = isEnrolled;