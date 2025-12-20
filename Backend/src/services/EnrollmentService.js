const Enrollment = require("../models/Enrollment");
const Course = require("../models/Course");
const ApiError = require("../utils/ApiError");

class EnrollmentService {

    async enroll(studentId, courseId) {

        // Validate course exists
        const course = await Course.findById(courseId);
        if (!course) throw ApiError.notFound("Course not found");

        // Prevent duplicate enrollment
        const existing = await Enrollment.findOne({ student: studentId, course: courseId });
        if (existing) throw ApiError.badRequest("You are already enrolled in this course");

        // Create enrollment 
        const enrollment = await Enrollment.create({
            student: studentId,
            course: courseId,
            progress: {
                completedLessons: [],
                percentage: 0
            },
            amountPaid: 0, //def value for free courses
            status: "enrolled"
        });

        return enrollment;
    }

    async getMyEnrollments(studentId) {
        return Enrollment.find({ student: studentId })
            .populate({
                path: "course",
                select: "title thumbnail instructor slug rating price",
                populate: {
                    path: "instructor",
                    select: "name email"
                }
            })
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
