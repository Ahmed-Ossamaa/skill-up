const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { protect, authorize } = require('../middlewares/AuthMW');
const  validate  = require('../middlewares/reqValidation');
const { createReviewSchema, updateReviewSchema } = require('../Validation/reviewValidation');
const {objIdSchema} = require('../Validation/objectIdValidation');

//============================= Public ==============================
router.get('/', reviewController.getAllReviews);

// //========================= Protected=============================
router.use(protect);

router.post('/:courseId', validate(createReviewSchema), authorize('student'), reviewController.createReview);
router.patch('/:reviewId', validate(objIdSchema, 'params'), validate(updateReviewSchema), reviewController.updateReview);
router.delete('/:id', validate(objIdSchema, 'params'), reviewController.deleteReview);

module.exports = router;
