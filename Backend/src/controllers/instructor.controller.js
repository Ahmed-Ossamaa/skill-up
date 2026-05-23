const asyncHandler = require('express-async-handler');



class InstructorController {
    constructor(instructorService) {
        this.instructorService = instructorService;
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


    getPublicProfile = asyncHandler(async (req, res) => {
        const instructorId = req.params.instructorId;
        const profile = await this.instructorService.getPublicProfile(instructorId);
        res.status(200).json({ data: profile });
    });

}

module.exports =  InstructorController;