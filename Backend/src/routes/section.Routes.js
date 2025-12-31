const express = require('express');
const router = express.Router();
const { sectionController } = require('../container');
const validate = require('../middlewares/reqValidation');
const { protect, authorize } = require('../middlewares/AuthMW');
const { createSectionSchema, updateSectionSchema } = require('../Validation/sectionValidation');
const { objIdSchema } = require('../Validation/objectIdValidation');

router.use(protect);

// Instructor/Admin routes
router.post('/', authorize('instructor', 'admin'), validate(createSectionSchema), sectionController.createSection);
router.get('/:id', 
    validate(objIdSchema, 'params'), 
    sectionController.getSection
);
router.patch('/:id', validate(objIdSchema, 'params'), authorize('instructor', 'admin'), validate(updateSectionSchema), sectionController.updateSection);
router.delete('/:id', validate(objIdSchema, 'params'), authorize('instructor', 'admin'), sectionController.deleteSection);

// Public route: get sections by course
router.get('/course/:courseId', validate(objIdSchema, 'params'), sectionController.getSectionsByCourse);

module.exports = router;
