const ApiError = require("../utils/ApiError");
const Crypto = require("crypto");


class EnrollmentService {
    constructor(enrollmentRepository, courseRepository, userRepository) {
        this.enrollmentRepository = enrollmentRepository;
        this.courseRepository = courseRepository;
        this.userRepository = userRepository;
    }

    /**
     * Enroll a student in a course
     * @param {string} studentId - The ID of the student to enroll
     * @param {string} courseId - The ID of the course to enroll in
     * @param {number} amountPaid - (Optional) The amount paid for the course
     * @param {string} paymentId - (Optional) The ID of the payment made for the course
     * @returns {Promise<Enrollment>} - The created enrollment object
     * @throws {badRequest} - If the student is already enrolled
     */
    async enroll(studentId, courseId, amountPaid = 0, paymentId = null) {

        // Validate course exists
        const course = await this.courseRepository.findCourseById(courseId,'instructor title price');
        if (!course) throw ApiError.notFound("Course not found");

        // Prevent duplicate enrollment
        const existing = await this.enrollmentRepository.findOne({ student: studentId, course: courseId });
        if (existing) {
            if (paymentId && existing.paymentId === paymentId) {
                return existing;
            }
            throw ApiError.badRequest("You are already enrolled in this course");
        }
        // Create enrollment
        const enrollment = await this.enrollmentRepository.create({
            student: studentId,
            course: courseId,
            amountPaid: amountPaid,
            paymentId: paymentId,
            progress: {
                completedLessons: [],
                percentage: 0
            },
            status: "enrolled",
            enrolledAt: new Date(),
        });

        //Update course stats (stunteds[], studentsCount)
        await this.courseRepository.addStudent(courseId, studentId);

        //Update student Stats (Courses + Spent) in the user schema
        await this.userRepository.findByIdAndUpdate(studentId, {
            $inc: {
                'studentStats.totalEnrolledCourses': 1,
                'studentStats.totalAmountPaid': amountPaid
            }
        });

        if (course.instructor) {
            await this.userRepository.findByIdAndUpdate(course.instructor, {
                $inc: {
                    'instructorStats.totalStudentsTaught': 1,
                    'instructorStats.totalEarnings': amountPaid
                }
            });
        }

        return enrollment;
    }

    /**
     * Get all enrollments of a student with course details
     * @param {string} studentId - The id of the student to get the enrollments for
     * @returns {Promise<Enrollment[]>} - The array of enrollments of the student
     */
    async getMyEnrollments(studentId) {
        return this.enrollmentRepository.findStudentEnrollmentsWithDetails(studentId);
    }

    /**
     * Checks if a user is enrolled in a course
     * @param {string} studentId - The id of the student to check
     * @param {string} courseId - The id of the course to check
     * @returns {Promise<Enrollment | null>} The enrollment object if the user is enrolled, null otherwise
     */
    async isUserEnrolled(studentId, courseId) {
        return this.enrollmentRepository.findOne({
            student: studentId,
            course: courseId,
            status: { $in: ["enrolled", "completed"] }
        });
    }

    /**
     * Get the certificate of a student for a course
     * @param {string} userId - The id of the student to get the certificate for
     * @param {string} courseId - The id of the course to get the certificate for
     * @returns {Promise<{studentName: string, courseName: string, instructorName: string, certificateId: string, issuedAt: Date, verificationUrl: string}>} - The object containing the certificate details
     * @throws {badRequest} - if the course is not completed
     */
    async getCertificate(userId, courseId) {

        const enrollment = await this.enrollmentRepository.findEnrollmentForCertificate(userId, courseId);

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

            await this.enrollmentRepository.save(enrollment);
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
