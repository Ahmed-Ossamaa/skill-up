const ApiError = require('../utils/ApiError');
const { deleteMediaFromCloudinary } = require('../utils/cloudinaryCelanUp');

class CourseService {
    constructor(CourseModel, EnrollmentModel) {
        this.Course = CourseModel;
        this.Enrollment = EnrollmentModel;
    }

    // ================= Public courses =================

    async createCourse(instructorId, data) {
        const course = await this.Course.create({ ...data, instructor: instructorId });
        return course;
    }
    async getPublishedCourses(page = 1, limit = 10, filters = {}) {
        const skip = (page - 1) * limit;
        const query = { status: 'published' };

        if (filters.level) query.level = filters.level;
        if (filters.category) query.category = filters.category;
        if (filters.priceMin !== undefined) query.price = { $gte: filters.priceMin };
        if (filters.priceMax !== undefined) query.price = { ...query.price, $lte: filters.priceMax };
        if (filters.instructor) query.instructor = filters.instructor;

        const [courses, total] = await Promise.all([
            this.Course.find(query).skip(skip).limit(limit),
            this.Course.countDocuments(query)
        ]);

        return {
            total,
            page,
            pages: Math.ceil(total / limit),
            count: courses.length,
            data: courses
        };
    }

    async getCourseById(courseId) {
        const course = await this.Course.findById(courseId)
            .populate('instructor', 'name email')
            .populate('lessons');
        if (!course) throw ApiError.notFound('Course not found');
        return course;
    }

    async getInstructorCourses(instructorId, page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const [courses, total] = await Promise.all([
            this.Course.find({ instructor: instructorId }).skip(skip).limit(limit),
            this.Course.countDocuments({ instructor: instructorId })
        ]);

        return {
            total,
            page,
            pages: Math.ceil(total / limit),
            count: courses.length,
            data: courses
        };
    }

    async getAllCourses(page = 1, limit = 10, filters = {}) {
        const skip = (page - 1) * limit;
        const query = {};

        if (filters.status) query.status = filters.status;
        if (filters.level) query.level = filters.level;
        if (filters.category) query.category = filters.category;
        if (filters.instructor) query.instructor = filters.instructor;

        const [courses, total] = await Promise.all([
            this.Course.find(query).skip(skip).limit(limit),
            this.Course.countDocuments(query)
        ]);

        return {
            total,
            page,
            pages: Math.ceil(total / limit),
            count: courses.length,
            data: courses
        };
    }

    async updateCourse(courseId, data, userId, userRole) {
        const course = await this.getCourseById(courseId);
        if (course.instructor.toString() !== userId && userRole !== 'admin') {
            throw ApiError.forbidden('Not authorized to update this course');
        }
        Object.assign(course, data);
        await course.save();
        return course;
    }
    //delete the course with all of its sections and lessons and media from cloudinary
    async deleteCourse(courseId, userId, userRole) {
        const course = await this.getCourseById(courseId);
        if (course.instructor.toString() !== userId && userRole !== 'admin') {
            throw ApiError.forbidden('Not authorized to delete this course');
        }
        // Load sections with lessons
        const sections = await this.Section.find({ _id: { $in: course.sections } }).populate('lessons');
        const lessons = sections.flatMap(section => section.lessons);

        // Delete all media from Cloudinary
        await deleteMediaFromCloudinary({ thumbnailPublicId: course.thumbnailPublicId, lessons });

        // Delete lessons and sections from DB
        for (const lesson of lessons) {
            await this.Lesson.findByIdAndDelete(lesson._id);
        }
        for (const section of sections) {
            await this.Section.findByIdAndDelete(section._id);
        }

        // Delete course
        await course.remove();
    }

    async publishCourse(courseId, userId, userRole, status) {
        if (!['published', 'draft', 'archived'].includes(status)) {
            throw ApiError.badRequest("Status must be 'published' or 'draft', or 'archived'");
        }
        const course = await this.getCourseById(courseId);
        if (course.instructor.toString() !== userId && userRole !== 'admin') {
            throw ApiError.forbidden('Not authorized to publish/unpublish this course');
        }
        course.status = status;
        await course.save();
        return course;
    }

    async getCourseContent(courseId, userId, userRole) {
        const course = await this.Course.findById(courseId)
            .populate({
                path: 'sections',
                populate: { path: 'lessons' }
            });
        if (!course) throw ApiError.notFound('Course not found');

        // Admin or instructor who owns the course
        if (userRole === 'admin' || course.instructor.toString() === userId) {
            return course;
        }

        // Students must be enrolled
        const enrollment = await this.Enrollment.findOne({
            course: courseId,
            student: userId
        });

        if (!enrollment) throw ApiError.forbidden('You are not enrolled in this course');

        return course;
    }
}

module.exports = CourseService;
