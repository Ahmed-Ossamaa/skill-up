const ApiError = require('../utils/ApiError');
const { deleteMediaFromCloudinary } = require('../utils/cloudinaryCelanUp');
const { uploadToCloudinary } = require('../utils/cloudinaryHelpers');
const cloudinary = require('../config/cloudinary');

class LessonService {
    constructor(lessonRepository) {
        this.lessonRepository = lessonRepository;

    }

    /**
     * Creates a new lesson with the given data
     * @param {object} data - the lesson data to be created
     * @param {string} userId - the id of the user creating the lesson
     * @returns {Promise<object>} the created lesson
     * @throws {forbidden} if the user is not authorized to add a lesson to the course
     */
    async createLesson(data, userId) {
        const section = await this.lessonRepository.findSectionById(data.section);
        if (!section) throw ApiError.notFound('Section not found');

        // Authorization
        if (section.course.instructor.toString() !== userId && userId !== 'admin') {
            throw ApiError.forbidden('Not authorized to add lesson to this course');
        }

        // File Upload
        const { videoData, documentData, resourceList, finalDuration } = await this._handleFileUploads(data);

        const finalResources = [...(data.resources || []), ...resourceList];

        const lessonData = {
            title: data.title,
            description: data.description,
            type: data.type,
            section: data.section,
            course: section.course._id,
            createdBy: userId,
            video: videoData,
            documents: documentData,
            resources: finalResources,
            content: data.content,
            duration: finalDuration
        };

        const lesson = await this.lessonRepository.create(lessonData);
        await this.lessonRepository.addLessonToSection(data.section, lesson._id);
        await this.recalculateCourseProgress(section.course._id);

        return lesson;
    }


    /**
     * Updates a lesson with the given data
     * @param {string} lessonId - the id of the lesson to update
     * @param {object} data - the lesson data to be updated
     * @param {string} userId - the id of the user updating the lesson
     * @returns {Promise<object>} the updated lesson
     * @throws {forbidden} if the user is not authorized to update the lesson
     */
    async updateLesson(lessonId, data, userId) {
        const lesson = await this.lessonRepository.findLessonById(lessonId);
        if (!lesson) throw ApiError.notFound('Lesson not found');

        // Authorization
        if (!lesson.course || lesson.course.instructor._id.toString() !== userId) {
            throw ApiError.forbidden('Not authorized to update this lesson');
        }

        // File Update
        await this._handleFileUpdates(lesson, data);

        // Update Text Fields
        if (data.title) lesson.title = data.title;
        if (data.description) lesson.description = data.description;
        if (data.content) lesson.content = data.content;
        if (typeof data.isPreview !== 'undefined') lesson.isPreview = data.isPreview;
        if (data.type) lesson.type = data.type;

        if (!lesson.video && !lesson.duration) {
            lesson.duration = 300; // default duration
        }

        // Handle Section Move (not implemented yet)
        if (data.section && data.section !== lesson.section._id.toString()) {
            await this.lessonRepository.removeLessonFromSection(lesson.section._id, lesson._id);
            await this.lessonRepository.addLessonToSection(data.section, lesson._id);
            lesson.section = data.section;
        }

        await this.lessonRepository.save(lesson);
        return lesson;
    }


    /**
     * Deletes a lesson by its ID
     * @param {string} lessonId - the ID of the lesson to be deleted
     * @param {string} userId - the ID of the user deleting the lesson
     * @returns {Promise<void>} resolves if the lesson is deleted successfully
     * @throws {forbidden} if the user is not authorized to delete the lesson
     */
    async deleteLesson(lessonId, userId) {
        const lesson = await this.lessonRepository.findLessonById(lessonId);
        if (!lesson) throw ApiError.notFound('Lesson not found');

        // Authorization
        if (!lesson.course || lesson.course.instructor.toString() !== userId) {
            throw ApiError.forbidden('Not authorized to delete this lesson');
        }

        // Delete Media from Cloudinary
        const lessonsToDelete = [{
            videoPublicId: lesson.video?.publicId,
            resources: lesson.resources?.map(r => ({ filePublicId: r.publicId }))
        }];
        await deleteMediaFromCloudinary({ lessons: lessonsToDelete });

        if (lesson.section) {
            await this.lessonRepository.removeLessonFromSection(lesson.section._id, lesson._id);
        }
        await this.recalculateCourseProgress(lesson.course._id);

        await this.lessonRepository.delete(lesson);
    }


    /**
     * Retrieves all lessons associated with a given section ID
     * @param {string} sectionId - The ID of the section to retrieve lessons from
     * @returns {Promise<Lesson[]>} A promise that resolves with an array of lessons
     */
    async getSectionLessons(sectionId) {
        const section = await this.lessonRepository.findSectionById(sectionId);
        if (!section) throw ApiError.notFound('Section not found');

        return this.lessonRepository.findLessonsBySection(sectionId);
    }


    /**
     * Retrieves a lesson by its ID
     * @param {string} lessonId - the ID of the lesson to retrieve
     * @param {string} userId - the ID of the user retrieving the lesson
     * @param {string} userRole - the role of the user retrieving the lesson
     * @returns {Promise<Lesson>} a promise that resolves with the lesson
     * @throws {forbidden} if the user is not authorized to access the lesson
     */
    async getLessonById(lessonId, userId, userRole) {
        const lesson = await this.lessonRepository.findLessonWithCourse(lessonId);
        if (!lesson) throw ApiError.notFound('Lesson not found');


        console.log('lesson.course:', lesson.course);
        console.log('lesson.course.instructor:', lesson.course.instructor);
        console.log('userId:', userId);
        // Authorization
        const isOwner = lesson.course.instructor?._id.toString() === userId.toString();
        if (isOwner || userRole === 'admin' || lesson.isPreview) {
            return lesson;
        }
        console.log('isOwner:', isOwner);
        const enrollment = await this.lessonRepository.findEnrollment(userId, lesson.course._id);
        if (!enrollment) {
            throw ApiError.forbidden('Please enroll to access this course');
        }

        return lesson;
    }


    /**
     * Marks a lesson as completed by a student
     * @param {string} studentId - the ID of the student completing the lesson
     * @param {string} courseId - the ID of the course the lesson belongs to
     * @param {string} lessonId - the ID of the lesson to be marked as completed
     * @returns {Promise<Enrollment>} - the updated enrollment object
     * @throws {forbidden} if the student is not enrolled in the course
     */
    async markLessonCompleted(studentId, courseId, lessonId) {
        const enrollment = await this.lessonRepository.findEnrollment(studentId, courseId);
        if (!enrollment) {
            throw ApiError.forbidden("Not enrolled");
        }

        const alreadyCompleted = enrollment.progress.completedLessons.some(id => id.toString() === lessonId.toString());
        if (alreadyCompleted) return enrollment;

        enrollment.progress.completedLessons.push(lessonId);

        const totalLessons = await this.lessonRepository.countLessonsInCourse(courseId);
        const completedCount = enrollment.progress.completedLessons.length;

        enrollment.progress.percentage = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

        if (enrollment.progress.percentage >= 100) {
            enrollment.status = "completed";
            enrollment.completedAt = new Date();
        }

        return this.lessonRepository.save(enrollment);
    }

    //.........................Helper Methods...............................
    async recalculateCourseProgress(courseId) {
        return this.lessonRepository.updateEnrollmentProgress(courseId);
    }

    // methods for file handling
    async _handleFileUploads(data) {
        let finalDuration = 0;
        let videoData, documentData;
        let resourceList = [];

        if (data.videoFile) {
            const videoUpload = await uploadToCloudinary(data.videoFile.buffer, 'lessons', 'video');
            videoData = { url: videoUpload.secure_url, publicId: videoUpload.publicId, duration: videoUpload.duration || 0 };
            finalDuration = videoUpload.duration || 0;
        }

        if (data.doc) {
            const originalName = data.doc.originalname.replace(/\s+/g, '_');
            const documentUpload = await uploadToCloudinary(data.doc.buffer, 'lessons', 'auto', { use_filename: true, unique_filename: true, filename_override: originalName, format: originalName.split('.').pop() });
            documentData = { name: data.doc.originalname, url: documentUpload.secure_url, publicId: documentUpload.publicId, type: 'document' };
            finalDuration = 300;
        }

        if (data.resourceFiles && data.resourceFiles.length > 0) {
            const uploadPromises = data.resourceFiles.map(file => {
                const sanitizedName = file.originalname.replace(/\s+/g, '_');
                return uploadToCloudinary(file.buffer, 'resources', 'auto', { use_filename: true, unique_filename: true, filename_override: sanitizedName, format: sanitizedName.split('.').pop() });
            });
            const results = await Promise.all(uploadPromises);
            resourceList = results.map((res, index) => ({ name: data.resourceFiles[index].originalname, url: res.secure_url, publicId: res.publicId, type: 'file' }));
        }

        return { videoData, documentData, resourceList, finalDuration };
    }

    async _handleFileUpdates(lesson, data) {
        if (data.videoFile) {
            if (lesson.video && lesson.video.publicId) {
                await cloudinary.uploader.destroy(lesson.video.publicId, { resource_type: 'video' }).catch(() => { });
            }
            const videoUpload = await uploadToCloudinary(data.videoFile.buffer, 'lessons', 'video');
            lesson.video = { url: videoUpload.secure_url, publicId: videoUpload.publicId, duration: videoUpload.duration, type: "video" };
            lesson.duration = videoUpload.duration || 0;
        }

        if (data.doc) {
            if (lesson.documents && lesson.documents.publicId) {
                await cloudinary.uploader.destroy(lesson.documents.publicId, { resource_type: 'image' }).catch(() => { });
            }
            const originalName = data.doc.originalname.replace(/\s+/g, '_');
            const docUpload = await uploadToCloudinary(data.doc.buffer, 'lessons', 'auto', { use_filename: true, unique_filename: true, filename_override: originalName, format: originalName.split('.').pop() });
            lesson.documents = { name: data.doc.originalname, url: docUpload.secure_url, publicId: docUpload.publicId, type: 'document' };
            if (!lesson.video) lesson.duration = 300;
        }

        if (data.resourceFiles && data.resourceFiles.length > 0) {
            let newResources = [];
            const uploadPromises = data.resourceFiles.map(file => {
                const sanitizedName = file.originalname.replace(/\s+/g, '_');
                return uploadToCloudinary(file.buffer, 'resources', 'auto', { use_filename: true, unique_filename: true, filename_override: sanitizedName, format: sanitizedName.split('.').pop() });
            });
            const results = await Promise.all(uploadPromises);
            newResources = results.map((res, index) => ({ name: data.resourceFiles[index].originalname, url: res.secure_url, publicId: res.publicId, type: 'file' }));
            const keptResources = Array.isArray(data.resources) ? data.resources : lesson.resources;
            lesson.resources = [...keptResources, ...newResources];
        }
    }
}

module.exports = LessonService;