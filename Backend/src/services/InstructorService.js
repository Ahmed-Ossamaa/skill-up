const ApiError = require('../utils/ApiError');
const { uploadToCloudinary } = require('../utils/cloudinaryHelpers');
const instructorRequestRepository = require('../repositories/instructorRequestRepository');
const userRepository = require('../repositories/userRepository');
const courseRepository = require('../repositories/courseRepository');
const enrollmentRepository = require('../repositories/enrollmentRepository');


class InstructorService {
    constructor() {
        this.instructorRequestRepository = instructorRequestRepository;
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
            await this.userRepository.findByIdAndUpdate(request.user._id, {
                role: 'instructor',
            });
        }

        return request;
    }


    /**
     * Retrieves all students of an instructor (enrolled in his courses)
     * @param {string} instructorId - The id of the instructor to get the students for
     * @returns {Promise<Array<User>>} - The array of students of the instructor
     */
    async getAllInstructorStudents(instructorId) {
        const courses = await this.courseRepository.find({ instructor: instructorId });
        const courseIds = courses.map(course => course._id);
        const enrollments = await this.enrollmentRepository.find({ course: { $in: courseIds } })
            .populate('student', 'name email avatar');
        return enrollments.map(e => e.student).filter(Boolean);
    }

    /**
     * Retrieves the stats of an instructor (total courses, total students, total revenue)
     * @param {string} instructorId - The id of the instructor to get the stats for
     * @returns {Promise<{totalCourses: number, totalStudents: number, totalRevenue: number}>} - The instructor stats
     */
    async getInstructorStats(instructorId) {
        const courses = await this.courseRepository.find({ instructor: instructorId });
        const courseIds = courses.map(course => course._id);
        const totalStudents = await this.enrollmentRepository.count({ course: { $in: courseIds } });
        const totalRevenue = await this.enrollmentRepository.getTotalRevenueByInstructor(instructorId);
        return {
            totalCourses: courses.length,
            totalStudents,
            totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0,
        };
    }

    /**
     * Retrieves the revenue analytics for an instructor (total revenue by month)
     * @param {string} instructorId - The id of the instructor to get the revenue analytics for
     * @returns {Promise<Array<{_id: {month: number, year: number}, totalRevenue: number}>>} - The array of revenue analytics objects
     */
    async getRevenueAnalytics(instructorId) {
        return this.enrollmentRepository.getRevenueAnalyticsByInstructor(instructorId);
    }



    /**
     * Retrieves the performance stats of an instructor's courses
     * @param {string} instructorId - The id of the instructor to get the course performance stats for
     * @returns {Promise<Array<{_id: ObjectId, title: string, thumbnail: string, rating: number, studentsCount: number, revenue: number, lastEnrollment: Date}>} - The array of course performance stats objects
     */
    async getCoursePerformance(instructorId) {
        const stats = await this.enrollmentRepository.getCoursePerformanceStats(instructorId);
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
     * Retrieves the public profile of an instructor
     * @param {string} instructorId - The id of the instructor to retrieve the profile for
     * @returns {Promise<Object>} - The public profile of the instructor with the instructor's details and courses
     * @throws {ApiError} - If the instructor is not found
     */
    async getPublicProfile(instructorId) {
        const instructor = await this.userRepository.findById(instructorId);
        if (!instructor || instructor.role !== 'instructor') {
            throw ApiError('Instructor not found');
        }
        const courses = await this.courseRepository.find({ instructor: instructorId })
            .select('title description price averageRating studentsCount');
        return {
            instructor,
            courses
        };
    }
}

module.exports = InstructorService;
