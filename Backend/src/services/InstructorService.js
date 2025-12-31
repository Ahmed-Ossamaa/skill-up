const mongoose = require('mongoose');
const ApiError = require('../utils/ApiError');
const { uploadToCloudinary } = require('../utils/cloudinaryHelpers');


class InstructorService {
    constructor(instructorReqRepository, userRepository, courseRepository, enrollmentRepository) {
        this.instructorRequestRepository = instructorReqRepository;
        this.userRepository = userRepository;
        this.courseRepository = courseRepository;
        this.enrollmentRepository = enrollmentRepository;
    }



    /**
     * Creates a new instructor request
     * @param {string} userId - The id of the user making the request
     * @param {object} data - The request data (instructor experience)
     * @param {object} files - The documents (National ID, Certificate, Resume) to upload
     * @returns {Promise<{_id: string, user, experience, documents: {nationalId, certificate, resume>}>} - The created instructor request
     * @throws {conflict} - If the user already has a pending instructor request
     * @throws {badRequest} - If all documents are not provided
     */
    async createRequest(userId, data, files) {
        const existing = await this.instructorRequestRepository.findOne({ user: userId, status: 'pending' });
        if (existing) {
            throw ApiError.conflict('You already have a pending instructor request.');
        }

        const nationalIdFile = files.nationalId ? files.nationalId[0] : null;
        const certificateFile = files.certificate ? files.certificate[0] : null;
        const resumeFile = files.resume ? files.resume[0] : null;

        if (!nationalIdFile || !certificateFile || !resumeFile) {
            throw ApiError.badRequest("All documents (National ID, Certificate, Resume) are required.");
        }

        const uploadPromises = [
            uploadToCloudinary(nationalIdFile.buffer, 'instructorDocs/nationalId', 'auto'),
            uploadToCloudinary(certificateFile.buffer, 'instructorDocs/certificates', 'auto'),
            uploadToCloudinary(resumeFile.buffer, 'instructorDocs/resumes', 'auto')
        ];

        const [nationalIdResult, certificateResult, resumeResult] = await Promise.all(uploadPromises);

        const requestData = {
            user: userId,
            experience: data.experience,
            documents: {
                nationalId: { url: nationalIdResult.secure_url, publicId: nationalIdResult.publicId },
                certificate: { url: certificateResult.secure_url, publicId: certificateResult.publicId },
                resume: { url: resumeResult.secure_url, publicId: resumeResult.publicId }
            }
        };

        return this.instructorRequestRepository.create(requestData);
    }

    /**
     * Retrieves all instructor requests from the database
     * @returns {Promise<Array<InstructorRequest>>} - The instructor requests
     */
    async getAllRequests() {
        return this.instructorRequestRepository.find({});
    }

    /**
     * Reviews an instructor request
     * @param {string} requestId - The id of the instructor request to review
     * @param {string} status - The status to set the request to ('approved' or 'rejected')
     * @param {string} [feedback] - The feedback to leave for the user
     * @returns {Promise<InstructorRequest>} - The reviewed instructor request
     * @throws {badRequest} - If the request is not pending
     */
    async reviewRequest(requestId, status, feedback) {
        const request = await this.instructorRequestRepository.findById(requestId);

        if (!request) {
            throw ApiError.notFound('Request not found');
        }

        if (request.status !== 'pending') {
            throw ApiError.badRequest(`Request is already ${request.status}`);
        }

        request.status = status;
        request.adminFeedback = feedback || '';
        await this.instructorRequestRepository.save(request);

        if (status === 'approved') {
            await this.userRepository.findByIdAndUpdate(request.user, {
                role: 'instructor',
            });
        }

        return request;
    }

    /**
     * Returns all students enrolled in instructor's courses grouped by course
     * @param {string} instructorId - The instructor's MongoDB ObjectId
     * @returns {Promise<object[]>} - A promise that resolves with an array of objects containing course information and student details
     */
    async getAllInstructorStudents(instructorId) {
        return this.enrollmentRepository.getInstructorStudentsGroupedByCourse(instructorId);
    }

    /**
     * Get instructor stats (lifetime and current month with trends)
     * @param {ObjectId} instructorId
     * @returns {Promise<Object>}
     */
    async getInstructorStats(instructorId) {
        const id = new mongoose.Types.ObjectId(String(instructorId));
        const now = new Date();
        const startCurrent = new Date(now.getFullYear(), now.getMonth(), 1);
        const startPrev = new Date(now.getFullYear(), now.getMonth() - 1, 1);

        // Get Course IDs for filtering
        const courses = await this.courseRepository.find({ instructor: id });
        const courseIds = courses.map(c => c._id);

        const [instructor, currentMonthEnrollments, prevMonthEnrollments] = await Promise.all([
            this.userRepository.findById(id),
            this.enrollmentRepository.find({
                course: { $in: courseIds },
                enrolledAt: { $gte: startCurrent }
            }),
            this.enrollmentRepository.find({
                course: { $in: courseIds },
                enrolledAt: { $gte: startPrev, $lt: startCurrent }
            })
        ]);

        const totalCoursesCount = courses.length;
        const activeCoursesCount = courses.filter(c => c.status === 'published').length;

        // Calculate current month stats
        const currentMonthStats = {
            count: currentMonthEnrollments.length,
            amount: currentMonthEnrollments.reduce((sum, e) => sum + (e.amountPaid || 0), 0)
        };

        // Calculate previous month stats
        const prevMonthStats = {
            count: prevMonthEnrollments.length,
            amount: prevMonthEnrollments.reduce((sum, e) => sum + (e.amountPaid || 0), 0)
        };

        // Calculate average rating across all courses
        const ratedCourses = courses.filter(c => c.ratingCount > 0);
        const avgRating = ratedCourses.length > 0
            ? ratedCourses.reduce((sum, c) => sum + c.rating, 0) / ratedCourses.length
            : 0;

        // Trend Calculation Helper
        const calculateGrowth = (current, previous) => {
            if (previous === 0) return current > 0 ? "100" : "0";
            return (((current - previous) / previous) * 100).toFixed(1);
        };

        const stats = instructor.instructorStats || {};

        return {
            courses: totalCoursesCount || 0,
            activeCourses: activeCoursesCount || 0,
            students: stats.totalStudentsTaught || 0,
            revenue: stats.totalEarnings || 0,
            rating: avgRating.toFixed(1),

            revenueTrend: calculateGrowth(currentMonthStats.amount, prevMonthStats.amount),
            revenueTrendDir: currentMonthStats.amount >= prevMonthStats.amount ? 'up' : 'down',

            studentTrend: calculateGrowth(currentMonthStats.count, prevMonthStats.count),
            studentTrendDir: currentMonthStats.count >= prevMonthStats.count ? 'up' : 'down'
        };
    }

    /**
     * Get revenue analytics for an instructor
     * @param {ObjectId} instructorId - The ID of the instructor to get analytics for
     * @returns {Promise<object[]>} - A promise that resolves with an array of objects containing revenue and student data for each month/year
     */
    async getRevenueAnalytics(instructorId) {
        return this.enrollmentRepository.getRevenueAnalyticsByInstructor(instructorId);
    }

    /**
     * Get course performance data for an instructor
     * @param {ObjectId} instructorId - The ID of the instructor to get course performance data for
     * @returns {Promise<object[]>} - A promise that resolves with an array of objects containing course performance data
     */
    async getCoursePerformance(instructorId) {
        const id = new mongoose.Types.ObjectId(String(instructorId));

        // Use repository aggregation for stats
        const stats = await this.enrollmentRepository.getCoursePerformanceStats(id);

        // Get Course Details
        const courses = await this.courseRepository.getInstructorCourseDetails(instructorId);

        const statsMap = new Map(stats.map(s => [s._id.toString(), s]));

        const result = courses.map(course => {
            const stat = statsMap.get(course._id.toString());
            return {
                _id: course._id,
                title: course.title,
                thumbnail: course.thumbnail,
                rating: course.rating,
                studentsCount: course.studentsCount || 0,
                revenue: stat ? stat.revenue : 0,
                lastEnrollment: stat ? stat.lastEnrollment : null
            };
        });

        // Sort by Student Count (Descending)
        return result.sort((a, b) => b.studentsCount - a.studentsCount);
    }

    /**
     * Returns the public profile data for an instructor
     * @param {ObjectId} instructorId - The ID of the instructor to get the public profile for
     * @returns {Promise<object>} - A promise that resolves with an object containing the instructor's public profile data and stats
     */
    async getPublicProfile(instructorId) {
        const id = new mongoose.Types.ObjectId(String(instructorId));

        const [instructor, courses, statsAggregate] = await Promise.all([
            this.userRepository.findById(id),

            // Get Published Courses
            this.courseRepository.find({
                instructor: id,
                status: 'published'
            }),

            // Use repository aggregation for rating stats
            this.courseRepository.getInstructorRatingStats(id)
        ]);

        if (!instructor || instructor.role !== 'instructor') {
            throw ApiError.notFound('Instructor not found');
        }

        const stats = statsAggregate[0] || { totalReviews: 0, avgRating: 0 };

        return {
            instructor: {
                _id: instructor._id,
                name: instructor.name,
                avatar: instructor.avatar,
                bio: instructor.bio,
                headline: instructor.headline,
                website: instructor.website,
                linkedin: instructor.linkedin,
                github: instructor.github,
                twitter: instructor.twitter,
                totalStudents: instructor.instructorStats?.totalStudentsTaught || 0
            },
            stats: {
                totalStudents: instructor.instructorStats?.totalStudentsTaught || 0,
                totalReviews: stats.totalReviews,
                avgRating: parseFloat(stats.avgRating.toFixed(1))
            },
            courses: courses.map(c => ({
                _id: c._id,
                title: c.title,
                thumbnail: c.thumbnail,
                price: c.price,
                rating: c.rating,
                ratingCount: c.ratingCount,
                level: c.level,
                slug: c.slug,
                category: c.category,
                instructor: c.instructor
            }))
        };
    }
}

module.exports = InstructorService;