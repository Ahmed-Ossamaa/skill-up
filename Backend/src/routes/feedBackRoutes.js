const express = require('express');
const router = express.Router();
const feedback = require('../controllers/feedbackController');
const { protect, isAdmin } = require('../middlewares/authMW');  

router.use(protect);

router.post('/', feedback.createFeedback);

router.use(isAdmin);
router.get('/', feedback.getAllFeedbacks);
router.get('/:id', feedback.getFeedbackById);
router.delete('/:id', feedback.deleteFeedback);

module.exports = router;