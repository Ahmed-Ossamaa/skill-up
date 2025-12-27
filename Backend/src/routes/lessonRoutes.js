const express = require('express');
const router = express.Router();
const lessonController = require('../controllers/lessonController');
const { protect, authorize } = require('../middlewares/AuthMW');
const validate = require('../middlewares/reqValidation');
const { createLessonSchema, updateLessonSchema } = require('../Validation/lessonValidation');
const { upload } = require('../middlewares/upload');
const isEnrolled = require('../middlewares/isEnrolled.middleware');
const parseFormDataArrays = require('../middlewares/FormDataParser');
router.use(protect);

// Instructor/Admin routes
router.post('/', authorize('instructor', 'admin'), upload.fields([
    { name: 'video', maxCount: 1 },
    { name: 'document', maxCount: 1 },
    { name: 'resourceFiles', maxCount: 5 }
]),
    parseFormDataArrays,
    validate(createLessonSchema),
    lessonController.createLesson);

router.patch(
    '/:id',
    authorize('instructor', 'admin'),
    upload.fields([
        { name: 'video', maxCount: 1 },
        { name: 'document', maxCount: 1 },
        { name: 'resourceFiles', maxCount: 5 }
    ]),
    parseFormDataArrays,
    validate(updateLessonSchema),
    lessonController.updateLesson);

router.delete('/:id',authorize('instructor', 'admin'), lessonController.deleteLesson);

// Students / Enrolled -> (handled in service)
router.get('/section/:sectionId',lessonController.getSectionLessons);

router.get( '/:id',isEnrolled, lessonController.getLessonById);

// Mark lesson completed
router.post("/courses/:courseId/lessons/:lessonId/complete", authorize("student"), isEnrolled, lessonController.markLessonComplete);


module.exports = router;
