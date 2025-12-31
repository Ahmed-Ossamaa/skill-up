
class CourseRepository {
    constructor(courseModel, enrollmentModel, sectionModel, lessonModel, userModel) {
        this.Course = courseModel;
        this.Enrollment = enrollmentModel;
        this.Section = sectionModel;
        this.Lesson = lessonModel;
        this.User = userModel;
    }


    /**
     * Finds a course by id
     * @param {string} courseId - The id of the course to find
     * @param {string} select - The fields to select
     * @returns {Promise<Course>} - The course with the given id
     */
    async findCourseById(courseId, select = null) {
        if (select) {
            return this.Course.findById(courseId).select(select);
        }
        return this.Course.findById(courseId);
    }


    /**
     * Find a course by id with details (instructor, sections, lessons, category)
     * @param {string} courseId - The id of the course to find
     * @returns {Promise<Course>} - The course with details
     */
    async findCourseByIdWithDetails(courseId,) {
        return this.Course.findById(courseId)
            .populate('instructor', 'name email avatar title headline bio')
            .populate({
                path: 'sections',
                populate: {
                    path: 'lessons',
                    select: 'title type duration isPreview video description documents resources duration'
                }
            })
            .populate('category', 'name');
    }


    /**
     * Check if a user is enrolled in a course
     * @param {string} courseId - The id of the course to check
     * @param {string} userId - The id of the user to check
     * @returns {Promise<boolean>} - True if the user is enrolled, false otherwise
     */
    async isEnrolled(courseId, userId) {
        if (!userId) return false;
        return !!(await this.Enrollment.exists({
            course: courseId,
            student: userId,
            status: { $in: ['enrolled', 'completed'] }
        }));
    }


    /**
     * Get the count of users who have completed a course
     * @param {string} courseId - The id of the course to get the count for
     * @returns {Promise<number>} - The count of users who have completed the course
     */
    async getCompletedEnrollmentCount(courseId) {
        return this.Enrollment.countDocuments({
            course: courseId,
            status: 'completed'
        });
    }


    /**
     * Creates a new course with the given data
     * @param {Object} courseData - The data to create the course with
     * @returns {Promise<Course>} - The created course
     */
    async create(courseData) {
        return this.Course.create(courseData);
    }


    /**
     * Saves a course to the database
     * @param {Course} course - The course to save
     * @returns {Promise<Course>} - The saved course
     */
    async save(course) {
        return course.save();
    }


    /**
     * Deletes a course and its associated sections and lessons
     * @param {Course} course - The course to delete
     * @param {Section[]} sections - The sections to delete
     * @param {Lesson[]} lessons - The lessons to delete
     */
    async delete(course, sections, lessons) {
        const sectionIds = sections.map(s => s._id);
        const lessonIds = lessons.map(l => l._id);

        const session = await this.Course.startSession();
        try {
            await session.withTransaction(async () => {
                await this.Lesson.deleteMany({ _id: { $in: lessonIds } }, { session });
                await this.Section.deleteMany({ _id: { $in: sectionIds } }, { session });
                await course.deleteOne({ session });
            });
        } finally {
            await session.endSession();
        }
    }


    /**
     * Finds all sections of a given course
     * @param {Course} course - The course to find sections for
     * @returns {Promise<Section[]>} - An array of sections belonging to the course
     */
    async findSectionsByCourse(course) {
        return this.Section.find({ _id: { $in: course.sections } });
    }


    /**
     * Finds all lessons that belong to the given sections
     * @param {Section[]} sections - The sections to find lessons for
     * @returns {Promise<Lesson[]>} - An array of lessons belonging to the sections
     */
    async findLessonsBySectionIds(sections) {
        const lessonIds = sections.flatMap(s => s.lessons);
        return this.Lesson.find({ _id: { $in: lessonIds } });
    }


    /**
     * Retrieves published courses based on pagination and filters
     * @param {number} [page=1] - The page number to retrieve
     * @param {number} [limit=10] - The number of courses to retrieve per page
     * @param {Object} [filters={}] - The filters to apply to the courses
     * @property {string} [filters.search] - The search term to search courses by title
     * @property {string} [filters.level] - The level of the courses to filter by
     * @property {string} [filters.category] - The category of the courses to filter by
     * @property {string} [filters.instructor] - The instructor of the courses to filter by
     * @property {number} [filters.priceMin] - The minimum price of the courses to filter by
     * @property {number} [filters.priceMax] - The maximum price of the courses to filter by
     * @property {boolean|string} [filters.isFree] - true >free courses.false > paid courses.undefined returns ALL.
     * @property {number} [filters.rating] - The minimum rating of the courses to filter by
     * @property {string} [filters.sort] - The field to sort the courses by. If prefixed with '-', the courses are sorted in descending order.
     * @returns {Promise<Object>} - An object with pagination information and the courses
     */
    async findAndCountPublished(page = 1, limit = 10, filters = {}) {
        const skip = (page - 1) * limit;
        const query = { status: 'published' };

        if (filters.search) {
            query.$or = [{ title: { $regex: filters.search, $options: 'i' } }];
        }
        if (filters.level) query.level = filters.level;
        if (filters.category) {
            const categoryIds = filters.category.split(',');
            query.category = { $in: categoryIds };
        }
        if (filters.instructor) query.instructor = filters.instructor;
        if (filters.priceMin !== undefined || filters.priceMax !== undefined) {
            query.price = {};
            if (filters.priceMin !== undefined) query.price.$gte = Number(filters.priceMin);
            if (filters.priceMax !== undefined) query.price.$lte = Number(filters.priceMax);
        }
        if (filters.isFree === 'true' || filters.isFree === true) query.price = 0;
        if (filters.isFree === 'false' || filters.isFree === false) query.price = { $ne: 0 };
        if (filters.rating) {
            query.averageRating = { $gte: Number(filters.rating) };
        }

        let sort = { createdAt: -1 };
        if (filters.sort) {
            const sortField = filters.sort.replace('-', '');
            const direction = filters.sort.startsWith('-') ? -1 : 1;
            sort = { [sortField]: direction };
        }

        const [courses, total] = await Promise.all([
            this.Course.find(query).skip(skip).limit(limit).populate('instructor', 'name').populate('category', 'name').sort(sort),
            this.Course.countDocuments(query)
        ]);

        return { total, page, pages: Math.ceil(total / limit), count: courses.length, data: courses };
    }


    /**
     * Retrieves courses created by an instructor based on pagination and filters
     * @param {string} instructorId - The id of the instructor to retrieve courses for
     * @param {number} [page=1] - The page number to retrieve
     * @param {number} [limit=10] - The number of courses to retrieve per page
     * @returns {Promise<Object>} - An object with pagination information and the courses
     */
    async findAndCountByInstructor(instructorId, page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const [courses, total] = await Promise.all([
            this.Course.find({ instructor: instructorId }).skip(skip).limit(limit).sort({ createdAt: -1 }),
            this.Course.countDocuments({ instructor: instructorId })
        ]);
        return { total, page, pages: Math.ceil(total / limit), count: courses.length, data: courses };
    }


    /**
     * Retrieves all courses based on pagination and filters
     * @param {number} [page=1] - The page number to retrieve
     * @param {number} [limit=10] - The number of courses to retrieve per page
     * @param {Object} [filters={}] - An object with filters to apply on the retrieved courses
     * @param {string} [filters.status] - The status of the courses to retrieve (draft, published, archived)
     * @param {string} [filters.level] - The level of the courses to retrieve (beginner, intermediate, advanced)
     * @param {number} [filters.minStudents] - The minimum number of students a course must have
     * @param {string} [filters.instructor] - The name of an instructor to filter the courses by
     * @returns {Promise<Object>} - An object with pagination information and the courses
     */
    async findAndCountAll(page = 1, limit = 10, filters = {}) {
        const skip = (page - 1) * limit;
        let query = {};

        if (filters.status) query.status = filters.status;
        if (filters.level) query.level = filters.level;
        if (filters.minStudents) query.studentsCount = { $gte: parseInt(filters.minStudents) };
        if (filters.instructor) {
            const matchingInstructors = await this.User.find({
                name: { $regex: filters.instructor, $options: 'i' },
                role: 'instructor'
            }).select('_id');
            const instructorIds = matchingInstructors.map(u => u._id);
            query.instructor = { $in: instructorIds };
        }

        const [courses, total] = await Promise.all([
            this.Course.find(query).populate('instructor', 'name').skip(skip).limit(limit),
            this.Course.countDocuments(query)
        ]);
        return { total, page, pages: Math.ceil(total / limit), count: courses.length, data: courses };
    }

    async countAll() {
        return this.Course.countDocuments();
    }

    async findRecent() {
        return this.Course.find()
            .select('title price studentsCount createdAt instructor studentStats instructorStats')
            .populate('instructor', 'name')
            .sort({ createdAt: -1 })
            .limit(5);
    }

    async pullStudentFromCourses(enrollments, studentId) {
        const courseIds = enrollments.map(e => e.course);
        return this.Course.updateMany(
            { _id: { $in: courseIds } },
            {
                $inc: { studentsCount: -1 },
                $pull: { students: studentId }
            }
        );
    }

    async addStudent(courseId, studentId) {
        return this.Course.findByIdAndUpdate(courseId, {
            $addToSet: { students: studentId },
            $inc: { studentsCount: 1 }
        });
    }

    async find(query) {
        return this.Course.find(query);
    }

    async findByIdAndUpdate(id, update, options = { new: true }) {
        return this.Course.findByIdAndUpdate(id, update, options);
    }

    async getInstructorCourseDetails(instructorId) {
        return this.Course.find({ instructor: instructorId })
            .select('title thumbnail studentsCount rating');
    }

    /**
 * Get instructor rating statistics
 * @param {ObjectId} instructorId - The instructor's ID
 * @returns {Promise<Array>} Array with totalReviews and avgRating
 */
    async getInstructorRatingStats(instructorId) {
        return this.Course.aggregate([
            {
                $match: {
                    instructor: instructorId,
                    status: 'published',
                    ratingCount: { $gt: 0 }
                }
            },
            {
                $group: {
                    _id: null,
                    totalReviews: { $sum: "$ratingCount" },
                    avgRating: { $avg: "$rating" }
                }
            }
        ]);
    }
}

module.exports = CourseRepository;
