const EnrollmentService = require("../services/EnrollmentService");
const asyncHandler = require("express-async-handler");


class EnrollmentController {
    constructor() {
        this.enrollmentService = new EnrollmentService();
    }


    enrollStudent = asyncHandler(async (req, res) => {
        const studentId = req.user._id;
        const courseId = req.params.courseId;

        const enrollment = await this.enrollmentService.enroll(studentId, courseId);

        res.status(201).json({
            success: true,
            message: "Enrolled successfully",
            data: enrollment
        });
    });

    getMyEnrollments = asyncHandler(async (req, res) => {
        const studentId = req.user._id;

        const enrollments = await this.enrollmentService.getMyEnrollments(studentId);

        res.status(200).json({
            success: true,
            data: enrollments
        });
    });

}

module.exports = new EnrollmentController();
