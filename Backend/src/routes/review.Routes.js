const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/review.Controller');
const { protect, authorize } = require('../middlewares/AuthMW');
const  validate  = require('../middlewares/reqValidation');
const { createReviewSchema, updateReviewSchema } = require('../Validation/reviewValidation');
const {objIdSchema} = require('../Validation/objectIdValidation');

//============================= Public ==============================
router.get('/', reviewController.getAllReviews);

// //========================= Protected=============================
router.use(protect);

router.get('/instructor', reviewController.getReviewsByInstructor); // for teacher (owner)
router.get('/instructor/:instructorId', reviewController.getReviewsByInstructor); // for admin or whatever (later)

router.post('/:courseId', validate(createReviewSchema), authorize('student'), reviewController.createReview);
router.patch('/:reviewId', validate(updateReviewSchema), authorize('student'), reviewController.updateReview);
router.delete('/:id',authorize('student', 'admin'), reviewController.deleteReview);

module.exports = router;
