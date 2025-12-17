const ApiError = require('../utils/ApiError');
const { deleteMediaFromCloudinary } = require('../utils/cloudinaryCelanUp');
const { uploadToCloudinary } = require('../utils/cloudinaryHelpers');

class LessonService {
    constructor(LessonModel, SectionModel, CourseModel, EnrollmentModel) {
        this.Lesson = LessonModel;
        this.Section = SectionModel;
        this.Course = CourseModel;
        this.Enrollment = EnrollmentModel;
    }

    async createLesson(data, userId, userRole) {
        const section = await this.Section.findById(data.section).populate('course');
        if (!section) throw ApiError.notFound('Section not found');

        const course = section.course;

        // Only the course instructor or admin can create lessons
        if (course.instructor.toString() !== userId && userRole !== 'admin') {
            throw ApiError.forbidden('Not authorized to add lesson to this course');
        }

        const uploadResults = await uploadToCloudinary(data.file.buffer, 'lessons', 'video');

        const video = data.file
            ? {
                url: uploadResults.secure_url,
                publicId: uploadResults.public_id,
                type: "video"
            }
            : undefined;


        // Create the lesson
        const lesson = await this.Lesson.create({
            ...data,
            video,
            createdBy: userId,
            course: course._id
        });

        // Add lesson to section's lessons array
        await this.Section.findByIdAndUpdate(
            data.section,
            { $push: { lessons: lesson._id } }
        );

        return lesson;
    }

    async updateLesson(lessonId, data, userId, userRole) {
        const lesson = await this.Lesson.findById(lessonId).populate({
            path: 'section',
            populate: { path: 'course' }
        });
        if (!lesson) throw ApiError.notFound('Lesson not found');

        const course = lesson.section?.course || await this.Course.findById(lesson.course);

        // Only the course instructor or admin can update
        if (course.instructor.toString() !== userId && userRole !== 'admin') {
            throw ApiError.forbidden('Not authorized to update this lesson');
        }

        // If section is being changed, update both sections
        if (data.section && data.section !== lesson.section.toString()) {
            // Remove from old section
            await this.Section.findByIdAndUpdate(
                lesson.section,
                { $pull: { lessons: lesson._id } }
            );
            // Add to new section
            await this.Section.findByIdAndUpdate(
                data.section,
                { $push: { lessons: lesson._id } }
            );
        }

        Object.assign(lesson, data);
        await lesson.save();
        return lesson;
    }

    // Delete the lesson and its media from cloudinary
    async deleteLesson(lessonId, userId, userRole) {
        const lesson = await this.Lesson.findById(lessonId).populate({
            path: 'section',
            populate: { path: 'course' }
        });

        if (!lesson) throw ApiError.notFound('Lesson not found');

        const course = lesson.section?.course || await this.Course.findById(lesson.course);

        if (course.instructor.toString() !== userId && userRole !== 'admin') {
            throw ApiError.forbidden('Not authorized to delete this lesson');
        }

        // Delete lesson media from Cloudinary
        await deleteMediaFromCloudinary({ lessons: [lesson] });

        // Remove lesson from sections
        if (lesson.section) {
            await this.Section.findByIdAndUpdate(
                lesson.section,
                { $pull: { lessons: lesson._id } }
            );
        }

        await lesson.deleteOne();
    }

    // Get all lessons for a specific section
    async getSectionLessons(sectionId) {
        const section = await this.Section.findById(sectionId);
        if (!section) throw ApiError.notFound('Section not found');

        const lessons = await this.Lesson.find({ section: sectionId }).sort({ order: 1 });
        return lessons;
    }

    // Get lesson by ID ( enrollment check for students)
    async getLessonById(lessonId, userId, userRole) {
        const lesson = await this.Lesson.findById(lessonId)
            .populate('section')
            .populate('course');

        if (!lesson) throw ApiError.notFound('Lesson not found');

        // Students must be enrolled
        if (userRole === 'student') {
            const enrollment = await this.Enrollment.findOne({
                student: userId,
                course: lesson.course
            });
            if (!enrollment) throw ApiError.forbidden('You are not enrolled in this course');
        }

        return lesson;
    }
//working on it -----------------------------------------------------------------
    async markLessonCompleted(studentId, courseId, lessonId) {
        const enrollment = await this.Enrollment.findOne({
            student: studentId,
            course: courseId
        });

        if (!enrollment)
            throw ApiError.forbidden("Not enrolled");

        // If lesson already completed>> skip
        const alreadyCompleted = enrollment.progress.completedLessons.some(
            (id) => id.toString() === lessonId.toString()
        );
        if (alreadyCompleted) return enrollment;

        // Add completed lesson ID
        enrollment.progress.completedLessons.push(lessonId);

        // Count total lessons in course
        const totalLessons = await this.Lesson.countDocuments({ course: courseId });
        const completedCount = enrollment.progress.completedLessons.length;

        // Calculate progress percentage
        const percentage =totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

        enrollment.progress.percentage = percentage;

        // If progress reaches 100% -> mark as completed
        if (percentage >= 100) {
            enrollment.status = "completed";
            enrollment.completedAt = new Date();
        }

        await enrollment.save();
        return enrollment;
    }

}

module.exports = LessonService;