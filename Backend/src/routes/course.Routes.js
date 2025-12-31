const express = require('express');
const router = express.Router();
const { courseController } = require('../container');
const { protect, authorize, isAdmin, optionalAuth } = require('../middlewares/AuthMW');
const validate = require('../middlewares/reqValidation');
const { courseSchema, updateCourseSchema } = require('../Validation/courseValidation');
const { uploadThumbnail } = require('../middlewares/upload');

// =============================== Public / Guest Routes ===============================
// List all published courses
router.get('/', courseController.getPublishedCourses);

// Get course content (sections and lessons)
router.get('/:id/content',optionalAuth, courseController.getCourseContent);

// Get public course details (title, description, instructor, etc.)
router.get('/:id', courseController.getCoursePublicDetails);

// =============================== Protected Routes ===============================
router.get('/:id/enrollment',optionalAuth, courseController.checkEnrollment);


// =============================== Instructor / Admin Routes ===============================
router.use(protect);
// Get courses created by the logged-in instructor
router.get(
    '/instructor/my-courses',
    authorize('instructor', 'admin'),
    courseController.getInstructorCourses
);

// Create a new course
router.post(
    '/',
    authorize('instructor', 'admin'),
    validate(courseSchema),
    uploadThumbnail.single('thumbnail'),
    courseController.createCourse
);

// Update course
router.patch(
    '/:id',
    authorize('instructor', 'admin'),
    validate(updateCourseSchema),
    courseController.updateCourse
);

// Delete course
router.delete('/:id', authorize('instructor', 'admin'), courseController.deleteCourse);

// Publish / unpublish course
router.patch('/:id/status', authorize('instructor', 'admin'), courseController.publishCourse);

// =============================== Admin Only Routes ===============================
// Get all courses (admin)
router.get('/admin/all', isAdmin, courseController.getAllCourses);

module.exports = router;
