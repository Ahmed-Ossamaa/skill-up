const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const CourseService = require('../services/CourseService');
const asyncHandler = require('express-async-handler');
const ApiError = require('../utils/ApiError');

class CourseController {
    constructor() {
        this.courseService = new CourseService(Course, Enrollment);
    }

    // ---------------- Public ----------------
    getPublishedCourses = asyncHandler(async (req, res) => {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const filters = {
            level: req.query.level,
            category: req.query.category,
            priceMin: req.query.priceMin ? parseFloat(req.query.priceMin) : undefined,
            priceMax: req.query.priceMax ? parseFloat(req.query.priceMax) : undefined,
            instructor: req.query.instructor
        };
        const courses = await this.courseService.getPublishedCourses(page, limit, filters);
        res.status(200).json({ data: courses });
    });

    getCoursePublicDetails = asyncHandler(async (req, res) => {
        const course = await this.courseService.getCourseById(req.params.id);
        if (course.status !== 'published') throw ApiError.notFound('Course not found');
        res.status(200).json({ data: course });
    });

    // ---------------- enrolled Student & Instructor ----------------
    getCourseContent = asyncHandler(async (req, res) => {
        const course = await this.courseService.getCourseContent(
            req.params.id,
            req.user.id,
            req.user.role
        );
        res.status(200).json({ data: course });
    });

    // ---------------- Instructor/Admin ----------------
    getInstructorCourses = asyncHandler(async (req, res) => {
        const instructorId = req.user.id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const courses = await this.courseService.getInstructorCourses(instructorId, page, limit);
        res.status(200).json({ data: courses });
    });

    createCourse = asyncHandler(async (req, res) => {
        const course = await this.courseService.createCourse(req.user.id, req.body);
        res.status(201).json({ message: 'Course created', data: course });
    });

    updateCourse = asyncHandler(async (req, res) => {
        const course = await this.courseService.updateCourse(
            req.params.id,
            req.body,
            req.user.id,
            req.user.role
        );
        res.status(200).json({ message: 'Course updated', data: course });
    });

    deleteCourse = asyncHandler(async (req, res) => {
        await this.courseService.deleteCourse(req.params.id, req.user.id, req.user.role);
        res.status(200).json({ message: 'Course deleted' });
    });

    publishCourse = asyncHandler(async (req, res) => {
        const status = req.body.status;
        const course = await this.courseService.publishCourse(req.params.id, req.user.id, req.user.role, status);
        res.status(200).json({ message: `Course ${status}`, data: course });
    });

    // ---------------- Admin ----------------
    getAllCourses = asyncHandler(async (req, res) => {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const filters = {
            status: req.query.status,
            level: req.query.level,
            category: req.query.category,
            instructor: req.query.instructor
        };
        const courses = await this.courseService.getAllCourses(page, limit, filters);
        res.status(200).json({ data: courses });
    });
}

module.exports = new CourseController();
