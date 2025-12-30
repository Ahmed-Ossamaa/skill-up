const LessonService = require('../services/LessonService');
const asyncHandler = require('express-async-handler');

class LessonController {
    constructor() {
        this.lessonService = new LessonService();
    }

    createLesson = asyncHandler(async (req, res) => {
        const videoFile = req.files?.video ? req.files.video[0] : undefined;
        const doc = req.files?.document ? req.files.document[0] : undefined;
        const resourceFiles = req.files?.resourceFiles ? req.files.resourceFiles : [];

        const lesson = await this.lessonService.createLesson(
            {
                ...req.body,
                videoFile,
                doc,
                resourceFiles
            },
            req.user.id
        );
        res.status(201).json({ message: 'Lesson created', data: lesson });
    });

    updateLesson = asyncHandler(async (req, res) => {
        const videoFile = req.files?.video ? req.files.video[0] : undefined;
        const doc = req.files?.document ? req.files.document[0] : undefined;
        const resourceFiles = req.files?.resourceFiles ? req.files.resourceFiles : [];

        const lesson = await this.lessonService.updateLesson(
            req.params.id,
            {
                ...req.body,
                videoFile,
                doc,
                resourceFiles
            },
            req.user.id
        );
        res.status(200).json({ message: 'Lesson updated', data: lesson });
    });


    deleteLesson = asyncHandler(async (req, res) => {
        await this.lessonService.deleteLesson(
            req.params.id,
            req.user.id
        );
        res.status(200).json({ message: 'Lesson deleted' });
    });


    getSectionLessons = asyncHandler(async (req, res) => {
        const lessons = await this.lessonService.getSectionLessons(
            req.params.sectionId
        );
        res.status(200).json({ data: lessons });
    });

    getLessonById = asyncHandler(async (req, res) => {
        const lesson = await this.lessonService.getLessonById(
            req.params.id,
            req.user.id,
            req.user.role,
        );
        res.status(200).json({ data: lesson });
    });

    markLessonComplete = asyncHandler(async (req, res) => {
        const studentId = req.user._id;
        const courseId = req.params.courseId;
        const lessonId = req.params.lessonId;

        const result = await this.lessonService.markLessonCompleted(
            studentId,
            courseId,
            lessonId,
        );

        res.status(200).json({
            success: true,
            message: "Lesson marked as completed",
            data: result
        });
    });
}

module.exports = new LessonController();