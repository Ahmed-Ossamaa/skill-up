const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const InstructorService = require('../services/InstructorService');
const asyncHandler = require('express-async-handler');
const ApiError = require('../utils/ApiError');



class InstructorController {
    constructor() {
        this.instructorService = new InstructorService(Course, Enrollment,);
    }

    getAllInstructorStudents = asyncHandler(async (req, res) => {
        const instructorId = req.user.id;
        const students = await this.instructorService.getAllInstructorStudents(instructorId);
        res.status(200).json({ data: students });
    });


    getDashboardData = asyncHandler(async (req, res) => {
        const instructorId = req.user.id;

        const [stats, chartData, coursePerformance] = await Promise.all([
            this.instructorService.getInstructorStats(instructorId),
            this.instructorService.getRevenueAnalytics(instructorId),
            this.instructorService.getCoursePerformance(instructorId) 
        ]);

        res.status(200).json({
            success: true,
            data: {
                stats,     // For the Cards
                chartData,  // For charts
                coursePerformance  // table
            }
        });
    });

}

module.exports = new InstructorController();