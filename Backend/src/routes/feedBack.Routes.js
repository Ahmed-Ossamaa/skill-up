const express = require('express');
const router = express.Router();
const {feedBackController} = require('../container');
const { protect, isAdmin, optionalAuth } = require('../middlewares/AuthMW');  
const validate= require('../middlewares/reqValidation');
const { feedbackSchema } = require('../Validation/feedbackValidation');


router.post('/',optionalAuth, validate(feedbackSchema),feedBackController.createFeedback);

router.use(protect);
router.use(isAdmin);
router.get('/', feedBackController.getAllFeedbacks);
router.get('/:id', feedBackController.getFeedbackById);
router.patch('/:id', feedBackController.updateFeedback);
router.delete('/:id', feedBackController.deleteFeedback);

module.exports = router;