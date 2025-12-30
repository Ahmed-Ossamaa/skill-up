const Lesson = require('../models/Lesson');
const Section = require('../models/Section');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');

class LessonRepository {
    constructor() {
        this.Lesson = Lesson;
        this.Section = Section;
        this.Course = Course;
        this.Enrollment = Enrollment;
    }

    // ==================== Read Operations ====================

    async findSectionById(sectionId) {
        return this.Section.findById(sectionId).populate('course');
    }

    async findLessonById(lessonId) {
        return this.Lesson.findById(lessonId).populate({
            path: 'section',
            populate: { path: 'course' }
        });
    }

    async findCourseById(courseId) {
        return this.Course.findById(courseId);
    }

    async findLessonsBySection(sectionId) {
        return this.Lesson.find({ section: sectionId }).sort({ order: 1 });
    }
    
    async findLessonWithCourse(lessonId) {
        return this.Lesson.findById(lessonId).populate('section').populate('course');
    }

    async findEnrollment(studentId, courseId) {
        return this.Enrollment.findOne({ student: studentId, course: courseId });
    }

    async countLessonsInCourse(courseId) {
        return this.Lesson.countDocuments({ course: courseId });
    }

    // ==================== Write Operations ====================

    async create(lessonData) {
        return this.Lesson.create(lessonData);
    }
    
    async addLessonToSection(sectionId, lessonId) {
        return this.Section.findByIdAndUpdate(sectionId, { $push: { lessons: lessonId } });
    }

    async removeLessonFromSection(sectionId, lessonId) {
        return this.Section.findByIdAndUpdate(sectionId, { $pull: { lessons: lessonId } });
    }
    
    async save(document) {
        return document.save();
    }

    async delete(lesson) {
        return lesson.deleteOne();
    }

    async updateEnrollmentProgress(courseId) {
        const totalLessons = await this.countLessonsInCourse(courseId);
        if (totalLessons === 0) return;

        await this.Enrollment.updateMany(
            { course: courseId },
            [
                {
                    $set: {
                        "progress.percentage": {
                            $multiply: [
                                { $divide: [{ $size: "$progress.completedLessons" }, totalLessons] },
                                100
                            ]
                        }
                    }
                },
                {
                    $set: {
                        status: {
                            $cond: {
                                if: { $lt: ["$progress.percentage", 100] },
                                then: "enrolled",
                                else: "completed"
                            }
                        },
                        completedAt: {
                            $cond: {
                                if: { $lt: ["$progress.percentage", 100] },
                                then: null,
                                else: "$completedAt"
                            }
                        }
                    }
                }
            ]
        );
    }
}

module.exports = new LessonRepository();
