const Enrollment = require("../models/Enrollment");
const Lesson = require("../models/Lesson");
const ApiError = require("../utils/ApiError");

const isEnrolled = async (req, res, next) => {
    const studentId = req.user._id;

    // Allow instructor and admin
    if (req.user.role === 'instructor' || req.user.role === 'admin') {
        return next();
    }

    // Get courseId from different sources depending on the route
    let courseId = req.params.courseId; // For routes with :courseId

    // If no courseId param, check if it's a lesson route
    if (!courseId && req.params.id) {
        // Fetch the lesson to get courseId
        const lesson = await Lesson.findById(req.params.id).select('course');
        if (!lesson) {
            throw ApiError.notFound("Lesson not found");
        }
        courseId = lesson.course;
    }

    if (!courseId) {
        throw ApiError.badRequest("Course ID not found");
    }

    const enrollment = await Enrollment.findOne({
        student: studentId,
        course: courseId
    });

    if (!enrollment) {
        throw ApiError.forbidden("You must enroll in this course first");
    }

    req.enrollment = enrollment;
    next();
};

module.exports = isEnrolled;