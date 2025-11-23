const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const { protect, authorize, isAdmin } = require('../middlewares/authMW');
const validate = require('../middlewares/reqValidation');
const { courseSchema, updateCourseSchema, courseFilterSchema } = require('../Validation/courseValidation');
const { objIdSchema } = require('../Validation/objectIdValidation');


// =============================== Public Routes ===============================
router.get('/', validate(courseFilterSchema, 'query'), courseController.getPublishedCourses);
router.get('/:id', validate(objIdSchema, 'params'), courseController.getCoursePublicDetails);

// =============================== Protected Routes =============================
router.use(protect);

// ------------------------ Enrolled Students ------------------------
router.get('/:id/content', validate(objIdSchema, 'params'), authorize('student', 'admin'), courseController.getCourseContent);

// ------------------------ Instructor/Admin ------------------------
router.get('/instructor/my-courses', authorize('instructor', 'admin'), courseController.getInstructorCourses);
router.post('/', authorize('instructor', 'admin'), validate(courseSchema), courseController.createCourse);
router.patch('/:id', validate(objIdSchema, 'params'), authorize('instructor', 'admin'), validate(updateCourseSchema), courseController.updateCourse);
router.delete('/:id', validate(objIdSchema, 'params'), authorize('instructor', 'admin'), courseController.deleteCourse);
router.patch('/:id/status', validate(objIdSchema, 'params'), authorize('instructor', 'admin'), courseController.publishCourse);

// ------------------------- Admin Only ---------------------------
router.get('/admin/all', isAdmin, courseController.getAllCourses);

module.exports = router;
