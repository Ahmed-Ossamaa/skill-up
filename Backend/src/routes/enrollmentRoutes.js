const express = require("express");
const { protect, authorize } = require('../middlewares/AuthMW');
const EnrollmentController = require("../controllers/enrollmentController");
// const isEnrolled = require("../middlewares/isEnrolled.middleware");

const router = express.Router();
router.use(protect);

// Enroll in a course
router.post("/courses/:courseId/enroll", authorize("student"), EnrollmentController.enrollStudent);

// List student's enrolled courses
router.get( "/my-enrollments", authorize("student", "admin"), EnrollmentController.getMyEnrollments);


module.exports = router;
