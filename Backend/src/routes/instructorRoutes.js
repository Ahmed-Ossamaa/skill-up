const express = require('express');
const router = express.Router();
const InstructorController = require('../controllers/instructor.controller');
const { protect, authorize } = require('../middlewares/AuthMW');


router.use(protect);
router.use(authorize('instructor'));

router.get('/students', InstructorController.getAllInstructorStudents);
router.get('/stats', InstructorController.getDashboardData);

module.exports = router;