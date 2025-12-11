
const Enrollment = require("../models/Enrollment");
const ApiError = require("../utils/ApiError");

const isEnrolled = async (req, res, next) => {
    const studentId  = req.user._id;
    const courseId = req.params.courseId;

    //allow teacher and admin
    if(req.user.role === 'instructor' || req.user.role === 'admin') return next();

    const enrollment = await Enrollment.findOne({
        student: studentId,
        course: courseId
    });

    if (!enrollment) {
        throw ApiError.forbidden("You must enroll first");
    }

    req.enrollment = enrollment;
    next();
};

module.exports = isEnrolled;
