const ApiError = require('../utils/ApiError');
const sectionRepository = require('../repositories/sectionRepository');

class SectionService {

    async createSection(data, userId) {
        const course = await sectionRepository.findCourseById(data.course);
        if (!course) {
            throw ApiError.notFound('Course not found');
        }

        if (course.instructor.toString() !== userId) {
            throw ApiError.forbidden('Not authorized to add sections to this course');
        }

        const section = await sectionRepository.create(data);
        await sectionRepository.addSectionToCourse(data.course, section._id);

        return section;
    }

    async getSectionById(id) {
        const section = await sectionRepository.findSectionByIdWithLessons(id);
        if (!section) {
            throw ApiError.notFound('Section not found');
        }
        return section;
    }

    async updateSection(id, data, userId) {
        const section = await sectionRepository.findSectionById(id);
        if (!section) {
            throw ApiError.notFound('Section not found');
        }

        if (section.course.instructor.toString() !== userId) {
            throw ApiError.forbidden('Not authorized to update this section');
        }

        //Don't allow changing the course
        delete data.course;

        Object.assign(section, data);
        return sectionRepository.save(section);
    }

    async deleteSection(id, userId) {
        const section = await sectionRepository.findSectionById(id);
        if (!section) {
            throw ApiError.notFound('Section not found');
        }

        if (section.course.instructor.toString() !== userId) {
            throw ApiError.forbidden('Not authorized to delete this section');
        }

        await sectionRepository.removeSectionFromCourse(section.course._id, section._id);
        await sectionRepository.delete(section);
        
        return;
    }

    async getSectionsByCourse(courseId) {
        return sectionRepository.findSectionsByCourse(courseId);
    }
}

module.exports =  SectionService;