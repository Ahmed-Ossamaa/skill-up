const express = require('express');
const router = express.Router();
const feedback = require('../controllers/feedbackController');
const { protect, isAdmin, optionalAuth } = require('../middlewares/AuthMW');  
const validate= require('../middlewares/reqValidation');
const { feedbackSchema } = require('../Validation/feedbackValidation');


router.post('/',optionalAuth, validate(feedbackSchema),feedback.createFeedback);

router.use(protect);
router.use(isAdmin);
router.get('/', feedback.getAllFeedbacks);
router.get('/:id', feedback.getFeedbackById);
router.patch('/:id', feedback.updateFeedback);
router.delete('/:id', feedback.deleteFeedback);

module.exports = router;