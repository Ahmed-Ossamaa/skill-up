const Lesson = require('../models/Lesson');
const Section = require('../models/Section');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const LessonService = require('../services/LessonService');
const asyncHandler = require('express-async-handler');
const { deleteFromCloudinary } = require('../utils/cloudinaryHelpers');

class LessonController {
    constructor() {

        this.lessonService = new LessonService(Lesson, Section, Course);
    }

    createLesson = asyncHandler(async (req, res) => {

        const lesson = await this.lessonService.createLesson(
            req.body,
            req.user.id,
            req.user.role
        );
        res.status(201).json({ message: 'Lesson created', data: lesson });
    });

    updateLesson = asyncHandler(async (req, res) => {

        const lesson = await this.lessonService.updateLesson(
            req.params.id,
            req.body,
            req.user.id,
            req.user.role
        );
        res.status(200).json({ message: 'Lesson updated', data: lesson });
    });

    deleteLesson = asyncHandler(async (req, res) => {

        await this.lessonService.deleteLesson(
            req.params.id,
            req.user.id,
            req.user.role
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
            Enrollment
        );
        res.status(200).json({ data: lesson });
    });
}

module.exports = new LessonController();