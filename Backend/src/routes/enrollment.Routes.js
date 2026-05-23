const express = require("express");
const { protect, authorize } = require('../middlewares/AuthMW');
const { enrollmentController } = require('../container');


const router = express.Router();
router.use(protect);

// Enroll in a course
router.post("/courses/:courseId/enroll", authorize("student"), enrollmentController.enrollStudent);

// List student's enrolled courses
router.get( "/my-enrollments", authorize("student", "admin"), enrollmentController.getMyEnrollments);


module.exports = router;
