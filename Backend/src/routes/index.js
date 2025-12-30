const router = require('express').Router();

router.use('/auth', require('./auth.Routes'));
router.use('/users', require('./user.Routes'));
router.use('/courses', require('./course.Routes'));
router.use('/enrollments', require('./enrollment.Routes'));
router.use('/certificate', require('./certificate.Routes'));
router.use('/instructors', require('./instructor.Routes'));
router.use('/categories', require('./category.Routes'));
router.use('/lessons', require('./lesson.Routes'));
router.use('/reviews', require('./review.Routes'));
router.use('/sections', require('./section.Routes'));
router.use('/feedback', require('./feedBack.Routes'));
router.use('/payments', require('./payment.Routes'));
router.use('/uploads', require('./upload.Routes'));

module.exports = router;
