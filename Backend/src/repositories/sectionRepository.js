
class SectionRepository {
    constructor(sectionModel, courseModel, lessonModel) {
        this.Section = sectionModel;
        this.Course = courseModel;
        this.Lesson = lessonModel;
    }

    // ==================== Read Operations ====================

    async findCourseById(courseId) {
        return this.Course.findById(courseId);
    }
    
    async findSectionById(sectionId) {
        return this.Section.findById(sectionId).populate('course');
    }

    async findSectionByIdWithLessons(sectionId) {
        return this.Section.findById(sectionId).populate('lessons');
    }

    async findSectionsByCourse(courseId) {
        return this.Section.find({ course: courseId })
            .populate('lessons')
            .sort({ order: 1 });
    }

    // ==================== Write Operations ====================

    async create(sectionData) {
        return this.Section.create(sectionData);
    }

    async addSectionToCourse(courseId, sectionId) {
        return this.Course.findByIdAndUpdate(courseId, { $push: { sections: sectionId } });
    }

    async removeSectionFromCourse(courseId, sectionId) {
        return this.Course.findByIdAndUpdate(courseId, { $pull: { sections: sectionId } });
    }

    async save(section) {
        return section.save();
    }

    async delete(section) {
        if (section.lessons && section.lessons.length > 0) {
            await this.Lesson.deleteMany({ _id: { $in: section.lessons } });
        }
        return section.deleteOne();
    }
}

module.exports =  SectionRepository;
