const ApiError = require('../utils/ApiError');
const { deleteMediaFromCloudinary } = require('../utils/cloudinaryCelanUp');
const { uploadToCloudinary } = require('../utils/cloudinaryHelpers');

class CourseService {
    constructor(courseRepository) {
        this.courseRepository = courseRepository;
    }

    /**
     * Creates a new course with the given data
     * @param {string} instructorId - The id of the instructor creating the course
     * @param {Object} data - The data to create the course with
     * @returns {Promise<Course>} - The created course
     */
    async createCourse(instructorId, data) {
        const uploadResults = data.file
            ? await uploadToCloudinary(data.file.buffer, 'courses/thumbnails', 'image')
            : null;

        const thumbnail = uploadResults
            ? { url: uploadResults.secure_url, publicId: uploadResults.publicId, type: "image" }
            : undefined;

        const courseData = {
            ...data,
            thumbnail,
            instructor: instructorId,
            category: data.category
        };

        return this.courseRepository.create(courseData);
    }


    /**
     * Publishes/unpublishes a course
     * @param {string} courseId - The id of the course to publish/unpublish
     * @param {string} userId - The id of the user publishing/unpublish the course
     * @param {string} userRole - The role of the user publishing/unpublish the course
     * @param {string} status - The status of the course to publish/unpublish ('published', 'draft' or 'archived')
     * @throws {forbidden} - If the user is not authorized to publish/unpublish the course (owner or admin)
     * @returns {Promise<Document>} - The updated course
     */
    async publishCourse(courseId, userId, userRole, status) {
        if (!['published', 'draft', 'archived'].includes(status)) {
            throw ApiError.badRequest("Status must be 'published', 'draft' or 'archived'");
        }
        const course = await this.courseRepository.findCourseById(courseId);
        if (!course) {
            throw ApiError.notFound('Course not found');
        }
        if (course.instructor.toString() !== userId && userRole !== 'admin') {
            throw ApiError.forbidden('Not authorized to publish/unpublish this course');
        }

        course.status = status;
        return this.courseRepository.save(course);
    }


    /**
     * Updates a course with the given data
     * @param {string} courseId - The id of the course to update
     * @param {Object} data - The data to update the course with
     * @param {string} userId - The id of the user updating the course
     * @param {string} userRole - The role of the user updating the course
     * @returns {Promise<Document>} - The updated course
     */
    async updateCourse(courseId, data, userId, userRole) {
        const course = await this.courseRepository.findCourseById(courseId);
        if (!course) {
            throw ApiError.notFound('Course not found');
        }
        if (course.instructor.toString() !== userId && userRole !== 'admin') {
            throw ApiError.forbidden('Not authorized to update this course');
        }

        Object.assign(course, data);
        return this.courseRepository.save(course);
    }


    /**
     * Deletes a course and all its associated sections and lessons & media from Cloudinary
     * @param {string} courseId - The id of the course to delete
     * @param {string} userId - The id of the user deleting the course
     * @param {string} userRole - The role of the user deleting the course
     * @throws {forbidden} - If the user is not authorized to delete the course (owner or admin)
     */
    async deleteCourse(courseId, userId, userRole) {
        const course = await this.courseRepository.findCourseById(courseId);
        if (!course) {
            throw ApiError.notFound('Course not found');
        }
        if (course.instructor.toString() !== userId && userRole !== 'admin') {
            throw ApiError.forbidden('Not authorized to delete this course');
        }

        const sections = await this.courseRepository.findSectionsByCourse(course);
        const lessons = await this.courseRepository.findLessonsBySectionIds(sections);

        await deleteMediaFromCloudinary({
            thumbnailPublicId: course.thumbnail?.publicId,
            lessons
        });

        await this.courseRepository.delete(course, sections, lessons);
    }


    /**
     * Retrieves a course by its ID, with additional details 
     * @param {string} courseId - The ID of the course to retrieve
     * @param {Object} user - The user object, or null if not logged in
     * @returns {Promise<Object>} - The course object with additional details
     */
    async getCourseForUser(courseId, user = null) {
        const course = await this.courseRepository.findCourseByIdWithDetails(courseId);
        if (!course) {
            throw ApiError.notFound('Course not found');
        }

        const isOwnerOrAdmin = user && (user.role === 'admin' || course.instructor._id.toString() === user.id);
        const isEnrolled = await this.courseRepository.isEnrolled(courseId, user ? user.id : null);

        const filteredSections = course.sections.map(section => ({
            ...section.toObject(),
            lessons: section.lessons.map(lesson => ({
                id: lesson._id,
                title: lesson.title,
                type: lesson.type,
                duration: lesson.duration,
                isPreview: lesson.isPreview,
                accessible: isOwnerOrAdmin || isEnrolled || lesson.isPreview,
                video: lesson.video,
                videoUrl: lesson.video?.url,
                description: lesson.description,
                documents: lesson.documents,
                resources: lesson.resources
            }))
        }));

        const completedCount = await this.courseRepository.getCompletedEnrollmentCount(courseId);

        return {
            ...course.toObject(),
            sections: filteredSections,
            isEnrolled,
            completedCount,
        };
    }

    /**
     * Retrieves published courses based on filters
     * @param {number} page - The page number to retrieve
     * @param {number} limit - The number of courses to retrieve per page
     * @param {Object} filters - The filters to apply to the courses
     * @returns {Promise<Object>} - The published courses with pagination information
     * @example
     * const courses = await courseService.getPublishCourses(1, 10, {
     *     level: 'beginner',
     *     category: 'web-development'
     * });
     */
    async getPublishedCourses(page = 1, limit = 10, filters = {}) {
        return this.courseRepository.findAndCountPublished(page, limit, filters);
    }


    /**
     * Retrieves courses created by an instructor based on pagination and filters
     * @param {string} instructorId - The id of the instructor to retrieve courses for
     * @param {number} page - The page number to retrieve
     * @param {number} limit - The number of courses to retrieve per page
     * @returns {Promise<Object>} - The courses created by the instructor with pagination information
     */
    async getInstructorCourses(instructorId, page = 1, limit = 10) {
        return this.courseRepository.findAndCountByInstructor(instructorId, page, limit);
    }


    /**
     * Retrieves all courses based on pagination and filters
     * @param {number} page - The page number to retrieve
     * @param {number} limit - The number of courses to retrieve per page
     * @param {Object} filters - The filters to apply to the courses
     * @returns {Promise<Object>} - The courses with pagination information
     */
    async getAllCourses(page = 1, limit = 10, filters = {}) {
        return this.courseRepository.findAndCountAll(page, limit, filters);
    }


    /**
     * Checks if a user is enrolled in a course
     * @param {string} courseId - The id of the course to check
     * @param {string} userId - The id of the user to check
     * @returns {Promise<boolean>} - True if the user is enrolled, false otherwise
     */
    async checkEnrollment(courseId, userId) {
        return this.courseRepository.isEnrolled(courseId, userId);
    }
}

module.exports = CourseService;
