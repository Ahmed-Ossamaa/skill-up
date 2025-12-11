const Enrollment = require("../models/Enrollment");
const Course = require("../models/Course");
const ApiError = require("../utils/ApiError");

class EnrollmentService {

    async enroll(studentId, courseId) {

        // 1. Validate course exists
        const course = await Course.findById(courseId);
        if (!course) throw ApiError.notFound("Course not found");

        // 2. Prevent duplicate enrollment
        const existing = await Enrollment.findOne({ student: studentId, course: courseId });
        if (existing) throw ApiError.badRequest("You are already enrolled in this course");

        // 3. Create enrollment (matches new schema)
        const enrollment = await Enrollment.create({
            student: studentId,
            course: courseId,
            progress: {
                completedLessons: [],
                percentage: 0
            },
            status: "enrolled"
        });

        return enrollment;
    }

    async getMyEnrollments(studentId) {
        return Enrollment.find({ student: studentId })
            .populate("course", "title thumbnail instructor slug rating price");
    }

    async isUserEnrolled(studentId, courseId) {
        return Enrollment.findOne({
            student: studentId,
            course: courseId,
            status: { $in: ["enrolled", "completed"] }
        });
    }
}

module.exports = EnrollmentService;
