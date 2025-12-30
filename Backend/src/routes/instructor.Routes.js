const express = require('express');
const router = express.Router();
const InstructorController = require('../controllers/instructor.controller');
const { protect, authorize } = require('../middlewares/AuthMW');

//--------------------------Public routes--------------------------
// get public profile of the instructor
router.get('/profile/:instructorId', InstructorController.getPublicProfile);

//--------------------------Protected routes--------------------------
router.use(protect);
router.use(authorize('instructor'));

// get all students enrolled in the courses of the instructor
router.get('/students', InstructorController.getAllInstructorStudents);
// get dashboard data (stats)
router.get('/stats', InstructorController.getDashboardData);

module.exports = router;