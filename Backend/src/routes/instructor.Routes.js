const express = require('express');
const router = express.Router();
const { instructorController } = require('../container');
const { protect, authorize } = require('../middlewares/AuthMW');

//--------------------------Public routes--------------------------
// get public profile of the instructor
router.get('/profile/:instructorId', instructorController.getPublicProfile);

//--------------------------Protected routes--------------------------
router.use(protect);
router.use(authorize('instructor'));

// get all students enrolled in the courses of the instructor
router.get('/students', instructorController.getAllInstructorStudents);
// get dashboard data (stats)
router.get('/stats', instructorController.getDashboardData);

module.exports = router;