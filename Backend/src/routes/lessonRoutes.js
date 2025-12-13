const express = require('express');
const router = express.Router();
const lessonController = require('../controllers/lessonController');
const { protect, authorize } = require('../middlewares/AuthMW');
const validate = require('../middlewares/reqValidation');
const { createLessonSchema, updateLessonSchema } = require('../Validation/lessonValidation');
// const { objIdSchema } = require('../Validation/objectIdValidation');
const { uploadVideo } = require('../middlewares/upload');
const isEnrolled = require('../middlewares/isEnrolled.middleware');

router.use(protect);

// Instructor/Admin routes
router.post('/', authorize('instructor', 'admin'), uploadVideo.single('video'),
    validate(createLessonSchema),
    lessonController.createLesson);

router.patch(
    '/:id',
    authorize('instructor', 'admin'), validate(updateLessonSchema),
    uploadVideo.single('video'),
    lessonController.updateLesson);

router.delete(
    '/:id',
    authorize('instructor', 'admin')
    , lessonController.deleteLesson);

// Students / Enrolled
router.get(
    '/section/:sectionId',
    isEnrolled,
    lessonController.getSectionLessons);

router.get(
    '/:id',
    isEnrolled,
    lessonController.getLessonById);

// Mark lesson completed
router.post("/courses/:courseId/lessons/:lessonId/complete", authorize("student"), isEnrolled, lessonController.markLessonComplete);


module.exports = router;
