const ApiError = require('../utils/ApiError');
const { deleteMediaFromCloudinary } = require('../utils/cloudinaryCelanUp');
const { uploadToCloudinary } = require('../utils/cloudinaryHelpers');

class CourseService {
    constructor(CourseModel, EnrollmentModel, SectionModel, LessonModel, UserModel) {
        this.Course = CourseModel;
        this.Enrollment = EnrollmentModel;
        this.Section = SectionModel;
        this.Lesson = LessonModel;
        this.User = UserModel
    }

    // ==================== Public & User-Specific ====================

    async getCourseForUser(courseId, user = null) {
        const course = await this.Course.findById(courseId)
            .populate('instructor', 'name email avatar title headline bio')
            .populate({
                path: 'sections',
                populate: {
                    path: 'lessons',
                    select: 'title type duration isPreview video description documents resources duration'
                }
            });

        if (!course) throw ApiError.notFound('Course not found');

        const isOwnerOrAdmin = user && (user.role === 'admin' || course.instructor._id.toString() === user.id);

        let isEnrolled = false;
        if (user && user.role === 'student') {
            isEnrolled = !!(await this.Enrollment.exists({
                course: courseId,
                student: user.id,
                status: { $in: ['enrolled', 'completed'] }
            }));
        }

        // Map sections and lessons
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
            })),
        }));

        const completedCount = await this.Enrollment.countDocuments({
            course: courseId,
            status: 'completed'
        });

        return {
            ...course.toObject(),
            sections: filteredSections,
            isEnrolled,
            completedCount,
        };
    }


    // ==================== CRUD Operations ====================

    async createCourse(instructorId, data) {
        const uploadResults = data.file
            ? await uploadToCloudinary(data.file.buffer, 'courses/thumbnails', 'image')
            : null;

        const thumbnail = uploadResults
            ? { url: uploadResults.secure_url, publicId: uploadResults.publicId, type: "image" }
            : undefined;

        const course = await this.Course.create({
            ...data,
            thumbnail,
            instructor: instructorId,
            category: data.category
        });

        return course;
    }

    async updateCourse(courseId, data, userId, userRole) {
        const course = await this.Course.findById(courseId);
        if (!course) throw ApiError.notFound('Course not found');
        if (course.instructor.toString() !== userId && userRole !== 'admin') {
            throw ApiError.forbidden('Not authorized to update this course');
        }

        Object.assign(course, data);
        await course.save();
        return course;
    }

    async deleteCourse(courseId, userId, userRole) {
        const course = await this.Course.findById(courseId);
        if (!course) throw ApiError.notFound('Course not found');
        if (course.instructor.toString() !== userId && userRole !== 'admin') {
            throw ApiError.forbidden('Not authorized to delete this course');
        }

        // Fetch all related data at once
        const sections = await this.Section.find({ _id: { $in: course.sections } });
        const sectionIds = sections.map(s => s._id);
        const lessonIds = sections.flatMap(s => s.lessons);

        const lessons = await this.Lesson.find({ _id: { $in: lessonIds } });

        //  Delete files first
        await deleteMediaFromCloudinary({
            thumbnailPublicId: course.thumbnail?.publicId,
            lessons
        });

        const session = await this.Course.startSession();
        try {//delete all or nothing
            await session.withTransaction(async () => {
                await this.Lesson.deleteMany({ _id: { $in: lessonIds } }, { session });
                await this.Section.deleteMany({ _id: { $in: sectionIds } }, { session });
                await course.deleteOne({ session });
            });
        } finally {
            await session.endSession();
        }
    }

    async publishCourse(courseId, userId, userRole, status) {
        if (!['published', 'draft', 'archived'].includes(status)) {
            throw ApiError.badRequest("Status must be 'published', 'draft' or 'archived'");
        }
        const course = await this.Course.findById(courseId);
        if (!course) throw ApiError.notFound('Course not found');
        if (course.instructor.toString() !== userId && userRole !== 'admin') {
            throw ApiError.forbidden('Not authorized to publish/unpublish this course');
        }

        course.status = status;
        await course.save();
        return course;
    }

    // ==================== Listings ====================

    async getPublishedCourses(page = 1, limit = 10, filters = {}) {
        const skip = (page - 1) * limit;
        const query = { status: 'published' };

        // Text Search 
        if (filters.search) {
            query.$or = [
                { title: { $regex: filters.search, $options: 'i' } },
            ];
        }

        // Exact Filters
        if (filters.level) query.level = filters.level;
        if (filters.category) query.category = filters.category;
        if (filters.instructor) query.instructor = filters.instructor;

        // Price Filter 
        if (filters.priceMin !== undefined || filters.priceMax !== undefined) {
            query.price = {};
            if (filters.priceMin !== undefined) query.price.$gte = Number(filters.priceMin);
            if (filters.priceMax !== undefined) query.price.$lte = Number(filters.priceMax);
        }
        if (filters.isFree === 'true' || filters.isFree === true) query.price = 0;
        if (filters.isFree === 'false' || filters.isFree === false) query.price = { $ne: 0 };

        // Rating Filter
        if (filters.rating) {
            query.averageRating = { $gte: Number(filters.rating) };
        }

        //Sorting
        let sort = { createdAt: -1 }; // Default
        if (filters.sort) {
            const sortField = filters.sort.replace('-', '');
            const direction = filters.sort.startsWith('-') ? -1 : 1;
            sort = { [sortField]: direction };
        }

        const [courses, total] = await Promise.all([
            this.Course.find(query)
                .skip(skip)
                .limit(limit)
                .populate('instructor', 'name')
                .populate('category', 'name')
                .sort(sort),
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
    async getInstructorCourses(instructorId, page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const [courses, total] = await Promise.all([
            this.Course
                .find({ instructor: instructorId })
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 }),
            this.Course.countDocuments({ instructor: instructorId })
        ]);

        return { total, page, pages: Math.ceil(total / limit), count: courses.length, data: courses };
    }

    async getAllCourses(page = 1, limit = 10, filters = {}) {
        const skip = (page - 1) * limit;
        const query = {};
        if (filters.status) query.status = filters.status;
        if (filters.level) query.level = filters.level;
        // if (filters.category) query.category = filters.category;
        if (filters.minStudents) {
            query.studentsCount = { $gte: parseInt(filters.minStudents) };
        }
        if (filters.instructor) {
            // find insructor that contains part of the name
            const matchingInstructors = await this.User.find({
                name: { $regex: filters.instructor, $options: 'i' },
                role: 'instructor'
            }).select('_id');

            const instructorIds = matchingInstructors.map(u => u._id);
            query.instructor = { $in: instructorIds };
        }

        const [courses, total] = await Promise.all([
            this.Course.find(query)
                .populate('instructor', 'name')
                .skip(skip).limit(limit),
            this.Course.countDocuments(query)
        ]);

        return { total, page, pages: Math.ceil(total / limit), count: courses.length, data: courses };
    }
    // ==================== CheckEnrollment ====================
    async checkEnrollment(courseId, userId) {
        const enrollment = await this.Enrollment.findOne({
            course: courseId,
            student: userId
        });
        return !!enrollment; // returns true if enrolled
    }
}

module.exports = CourseService;
