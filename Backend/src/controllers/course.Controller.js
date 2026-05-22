const asyncHandler = require('express-async-handler');
const ApiError = require('../utils/ApiError');

class CourseController {
    constructor(courseService) {
        this.courseService = courseService;
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
            isFree: req.query.isFree, 
            instructor: req.query.instructor,
            search: req.query.search, 
            rating: req.query.rating, 
            sort: req.query.sort     
        };
        const courses = await this.courseService.getPublishedCourses(page, limit, filters);
        res.status(200).json({ data: courses });
    });

    getCoursePublicDetails = asyncHandler(async (req, res) => {
        const user = req.user || null;
        const course = await this.courseService.getCourseForUser(req.params.id, user);

        if (course.status !== 'published' && !(user && (user.role === 'admin' || course.instructor._id.toString() === user.id))) {
            throw ApiError.notFound('Course not found');
        }

        res.status(200).json({ data: course });
    });

    getCourseContent = asyncHandler(async (req, res) => {
        const course = await this.courseService.getCourseForUser(req.params.id, req.user);
        res.status(200).json({ data: course });
    });

    // ---------------- Instructor/Admin ----------------

        createCourse = asyncHandler(async (req, res) => {
        const file = req.file ? req.file : undefined;
        const course = await this.courseService.createCourse(req.user.id, { ...req.body, file });
        res.status(201).json({ message: 'Course created', data: course });
    });


    getInstructorCourses = asyncHandler(async (req, res) => {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const courses = await this.courseService.getInstructorCourses(req.user.id, page, limit);
        res.status(200).json({ data: courses });
    });


    updateCourse = asyncHandler(async (req, res) => {
        const course = await this.courseService.updateCourse(req.params.id, req.body, req.user.id, req.user.role);
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


    getAllCourses = asyncHandler(async (req, res) => {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const filters = {
            status: req.query.status,
            level: req.query.level,
            // category: req.query.category,
            instructor: req.query.instructor,
            minStudents: req.query.minStudents
        };
        const courses = await this.courseService.getAllCourses(page, limit, filters);
        res.status(200).json({ data: courses });
    });


    //checkEnrollment 
    checkEnrollment = asyncHandler(async (req, res) => {
        const courseId = req.params.id;
        const isEnrolled = await this.courseService.checkEnrollment(courseId, req.user?._id);
        res.status(200).json({
            success: true,
            data: { isEnrolled }
        });
    });
}

module.exports = CourseController;
