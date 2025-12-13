const ApiError = require('../utils/ApiError');

class SectionService {
    constructor(SectionModel, CourseModel) {
        this.Section = SectionModel;
        this.Course = CourseModel;
    }

    async createSection(data, userId, userRole) {
        const course = await this.Course.findById(data.course);
        if (!course) throw ApiError.notFound('Course not found');

        if (course.instructor.toString() !== userId && userRole !== 'admin') {
            throw ApiError.forbidden('Not authorized to add sections to this course');
        }
        const section = await this.Section.create(data);

        //  Add section to course's sections 
        await this.Course.findByIdAndUpdate(
            data.course,
            { $push: { sections: section._id } }
        );

        return section;
    }

    async getSectionById(id) {
        const section = await this.Section.findById(id).populate('lessons');
        if (!section) throw ApiError.notFound('Section not found');
        return section;
    }

    async updateSection(id, data, userId, userRole) {
        const section = await this.Section.findById(id).populate('course');
        if (!section) throw ApiError.notFound('Section not found');

        if (section.course.instructor.toString() !== userId && userRole !== 'admin') {
            throw ApiError.forbidden('Not authorized to update this section');
        }

        // Don't allow changing the course
        delete data.course;

        Object.assign(section, data);
        await section.save();
        return section;
    }

    async deleteSection(id, userId, userRole) {
        const section = await this.Section.findById(id).populate('course');
        if (!section) throw ApiError.notFound('Section not found');

        if (section.course.instructor.toString() !== userId && userRole !== 'admin') {
            throw ApiError.forbidden('Not authorized to delete this section');
        }

        // Remove section from course's sections array
        await this.Course.findByIdAndUpdate(
            section.course._id,
            { $pull: { sections: section._id } }
        );

        // FIX: Delete all lessons in this section 
        if (section.lessons && section.lessons.length > 0) {
            const LessonModel = require('../models/Lesson');
            await LessonModel.deleteMany({ _id: { $in: section.lessons } });
        }

        await section.deleteOne();
        return;
    }

    async getSectionsByCourse(courseId) {
        const sections = await this.Section.find({ course: courseId })
            .populate('lessons')
            .sort({ order: 1 });
        return sections;
    }

    // Helper to add lesson to section
    async addLessonToSection(sectionId, lessonId) {
        await this.Section.findByIdAndUpdate(
            sectionId,
            { $push: { lessons: lessonId } }
        );
    }

    // Helper to remove lesson from section
    async removeLessonFromSection(sectionId, lessonId) {
        await this.Section.findByIdAndUpdate(
            sectionId,
            { $pull: { lessons: lessonId } }
        );
    }
}

module.exports = SectionService;