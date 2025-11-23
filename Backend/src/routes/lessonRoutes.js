const express = require('express');
const router = express.Router();
const lessonController = require('../controllers/lessonController');
const { protect, authorize } = require('../middlewares/authMW');
const validate = require('../middlewares/reqValidation');
const { createLessonSchema, updateLessonSchema } = require('../Validation/lessonValidation');
const { objIdSchema } = require('../Validation/objectIdValidation');

router.use(protect);

// Instructor/Admin routes
router.post(
    '/', authorize('instructor', 'admin'),
    validate(createLessonSchema),
    lessonController.createLesson);

router.patch(
    '/:id', validate(objIdSchema, 'params'),
    authorize('instructor', 'admin'),validate(updateLessonSchema), 
    lessonController.updateLesson);

router.delete(
    '/:id', validate(objIdSchema, 'params'),
    authorize('instructor', 'admin')
    , lessonController.deleteLesson);

// Students / Enrolled
router.get(
    '/section/:sectionId',
    validate(objIdSchema, 'params'),
    lessonController.getSectionLessons);

router.get(
    '/:id', validate(objIdSchema, 'params'),
    lessonController.getLessonById);

module.exports = router;
