const ApiError = require("../utils/ApiError");
const Crypto = require("crypto");

class EnrollmentService {
    constructor(EnrollmentModel, CourseModel, UserModel) {
        this.Enrollment = EnrollmentModel;
        this.Course = CourseModel;
        this.User = UserModel;
    }

    async enroll(studentId, courseId, amountPaid = 0, paymentId = null) {

        // Validate course exists
        const course = await this.Course.findById(courseId).select('instructor title price');
        if (!course) throw ApiError.notFound("Course not found");

        // Prevent duplicate enrollment
        const existing = await this.Enrollment.findOne({ student: studentId, course: courseId });
        if (existing) {
            if (paymentId && existing.paymentId === paymentId) {
                return existing;
            }
            throw ApiError.badRequest("You are already enrolled in this course");
        }
        // Create enrollment 
        const enrollment = await this.Enrollment.create({
            student: studentId,
            course: courseId,
            amountPaid: amountPaid,
            paymentId: paymentId,
            progress: {
                completedLessons: [],
                percentage: 0
            },
            amountPaid: 0, //def value for free courses
            status: "enrolled",
            enrolledAt: new Date(),
        });

        //Update course stats (stunteds[], studentsCount)
        await this.Course.findByIdAndUpdate(courseId, {
            $addToSet: { students: studentId },
            $inc: { studentsCount: 1 }
        });

        //Update student Stats (Courses + Spent) in the user schema
        await this.User.findByIdAndUpdate(studentId, {
            $inc: {
                'studentStats.totalEnrolledCourses': 1,
                'studentStats.totalAmountPaid': amountPaid
            }
        });

        if (course.instructor) {
            await this.User.findByIdAndUpdate(course.instructor, {
                $inc: {
                    'instructorStats.totalStudentsTaught': 1,
                    'instructorStats.totalEarnings': amountPaid
                }
            });
        }

        return enrollment;
    }

    async getMyEnrollments(studentId) {
        return this.Enrollment.find({ student: studentId })
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
        return this.Enrollment.findOne({
            student: studentId,
            course: courseId,
            status: { $in: ["enrolled", "completed"] }
        });
    }

    async getCertificate(userId, courseId) {

        const enrollment = await this.Enrollment.findOne({
            student: userId,
            course: courseId
        }).populate({
            path: 'course',
            select: 'title instructor thumbnail',
            populate: {
                path: 'instructor',
                select: 'name'
            }
        })
            .populate('student', 'name');

        if (!enrollment) throw ApiError.notFound('Enrollment not found');

        if (enrollment.progress.percentage < 100) {
            throw ApiError.badRequest('Course not completed yet. Progress is ' + enrollment.progress.percentage + '%');
        }

        //Issue Certificate if not exists
        if (!enrollment.certificate?.issued) {
            const certId = 'SU-CERT-' + Crypto.randomBytes(6).toString('hex').toUpperCase();

            enrollment.certificate = {
                issued: true,
                certificateId: certId,
                issuedAt: new Date()
            };

            enrollment.status = 'completed';

            await enrollment.save();
        }

        return {
            studentName: enrollment.student.name,
            courseName: enrollment.course.title,
            instructorName: enrollment.course.instructor?.name || 'Instructor',
            certificateId: enrollment.certificate.certificateId,
            issuedAt: enrollment.certificate.issuedAt,
            verificationUrl: `${process.env.CLIENT_URL}/verify/${enrollment.certificate.certificateId}`
        };
    }
}

module.exports = EnrollmentService;
