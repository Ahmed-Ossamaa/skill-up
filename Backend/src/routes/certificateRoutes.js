const express = require('express');
const { protect } = require('../middlewares/AuthMW');
const enrollmentController = require('../controllers/enrollmentController');
const router = express.Router();

router.use(protect);

router.get('/:courseId', enrollmentController.getCertificate);

module.exports = router;