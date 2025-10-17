const express = require('express');
const router = express.Router();
const feedback = require('../controllers/feedbackController');
const { protect, isAdmin } = require('../middlewares/authMW');  
const validate= require('../middlewares/reqValidation');
const { feedbackSchema } = require('../Validation/feedbackValidation');
const { valid } = require('joi');

router.use(protect);

router.post('/', validate(feedbackSchema),feedback.createFeedback);

router.use(isAdmin);
router.get('/', feedback.getAllFeedbacks);
router.get('/:id', feedback.getFeedbackById);
router.delete('/:id', feedback.deleteFeedback);

module.exports = router;