const mongoose = require('mongoose');

class InstructorService {
    constructor(CourseModel, EnrollmentModel, UserModel) {
        this.Course = CourseModel;
        this.Enrollment = EnrollmentModel;
        this.User = UserModel;
    }

    /**
     * Returns all students enrolled in instructor's courses
     * @param {string} instructorId - The instructor's MongoDB ObjectId
     * @returns {Promise<object[]>} - A promise that resolves with an array of objects containing course information and student details
     */
    async getAllInstructorStudents(instructorId) {
        const id = new mongoose.Types.ObjectId(String(instructorId));

        // Get courses to filter enrollments
        const courseIds = await this.Course.find({ instructor: id }).distinct('_id');

        return await this.Enrollment.aggregate([
            { $match: { course: { $in: courseIds } } },
            // Join Student Info
            {
                $lookup: {
                    from: 'users',
                    localField: 'student',
                    foreignField: '_id',
                    as: 'studentDetails'
                }
            },
            { $unwind: '$studentDetails' },
            // Join Course Info
            {
                $lookup: {
                    from: 'courses',
                    localField: 'course',
                    foreignField: '_id',
                    as: 'courseInfo'
                }
            },
            { $unwind: '$courseInfo' },
            // Group By Course
            {
                $group: {
                    _id: '$course',
                    courseTitle: { $first: '$courseInfo.title' },
                    studentsCount: { $sum: 1 },
                    enrolledStudents: {
                        $push: {
                            enrollmentId: '$_id',
                            studentId: '$studentDetails._id',
                            name: '$studentDetails.name',
                            email: '$studentDetails.email',
                            avatar: '$studentDetails.avatar',
                            progress: '$progress.percentage',
                            enrolledAt: '$enrolledAt'
                        }
                    }
                }
            },
            { $sort: { courseTitle: 1 } }
        ]);
    }


    /**
     * Get instructor stats (lifetime and current month)
     * @param {ObjectId} instructorId
     * @returns {Promise<Object>}
     */
    async getInstructorStats(instructorId) {
        const id = new mongoose.Types.ObjectId(String(instructorId));
        const now = new Date();
        const startCurrent = new Date(now.getFullYear(), now.getMonth(), 1);
        const startPrev = new Date(now.getFullYear(), now.getMonth() - 1, 1);

        // Get Course IDs for filtering
        const courseIds = await this.Course.find({ instructor: id }).distinct('_id');

        const [instructor, currentMonthStats, prevMonthStats, ratingData,totalCoursesCount, activeCoursesCount] = await Promise.all([
            // Lifetime Totals 
            this.User.findById(id).select('instructorStats'),

            // Current Month Activity
            this.Enrollment.aggregate([
                { $match: { course: { $in: courseIds }, enrolledAt: { $gte: startCurrent } } },
                { $group: { _id: null, count: { $sum: 1 }, amount: { $sum: "$amountPaid" } } }
            ]),

            //Previous Month Activity (For Trend)
            this.Enrollment.aggregate([
                { $match: { course: { $in: courseIds }, enrolledAt: { $gte: startPrev, $lt: startCurrent } } },
                { $group: { _id: null, count: { $sum: 1 }, amount: { $sum: "$amountPaid" } } }
            ]),

            // Rating 
            this.Course.aggregate([
                { $match: { instructor: id } },
                {
                    $group: {
                        _id: null,
                        avg: {
                            $avg: { $cond: [{ $gt: ["$ratingCount", 0] }, "$rating", "$$REMOVE"] }
                        }
                    }
                }
            ]),
            this.Course.countDocuments({ instructor: id }),
            this.Course.countDocuments({ instructor: id, status: 'published' }),
        ]);

        // Data Preparation
        const stats = instructor.instructorStats || {};
        const cur = currentMonthStats[0] || { count: 0, amount: 0 };
        const prev = prevMonthStats[0] || { count: 0, amount: 0 };
        const avgRating = ratingData[0]?.avg || 0;

        // Trend Calculation
        const calculateGrowth = (current, previous) => {
            if (previous === 0) return current > 0 ? "100" : "0";
            return (((current - previous) / previous) * 100).toFixed(1);
        };

        return {
            courses:totalCoursesCount || 0,
            activeCourses: activeCoursesCount,
            students: stats.totalStudentsTaught || 0,
            revenue: stats.totalEarnings || 0,
            rating: avgRating.toFixed(1),

            revenueTrend: calculateGrowth(cur.amount, prev.amount),
            revenueTrendDir: cur.amount >= prev.amount ? 'up' : 'down',

            studentTrend: calculateGrowth(cur.count, prev.count),
            studentTrendDir: cur.count >= prev.count ? 'up' : 'down'
        };
    }



    /**
     * Get revenue analytics for an instructor
     * @param {ObjectId} instructorId - The ID of the instructor to get analytics for
     * @returns {Promise<object[]>} - A promise that resolves with an array of objects containing revenue and student data for each month/year
     */
    async getRevenueAnalytics(instructorId) {
        const courseIds = await this.Course.find({ instructor: instructorId }).distinct('_id');

        return await this.Enrollment.aggregate([
            { $match: { course: { $in: courseIds } } },
            {
                $group: {
                    _id: {
                        year: { $year: "$enrolledAt" },
                        month: { $month: "$enrolledAt" }
                    },
                    revenue: { $sum: "$amountPaid" },
                    students: { $sum: 1 }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } },
            {
                $project: {
                    _id: 0,
                    label: {
                        $concat: [
                            { $arrayElemAt: [["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"], "$_id.month"] },
                            " ",
                            { $substr: ["$_id.year", 0, 4] }
                        ]
                    },
                    revenue: 1,
                    students: 1
                }
            }
        ]);
    }


    /**
     * Get course performance data for an instructor
     * @param {ObjectId} instructorId - The ID of the instructor to get course performance data for
     * @returns {Promise<object[]>} - A promise that resolves with an array of objects containing course performance data
     */
    async getCoursePerformance(instructorId) {
        const id = new mongoose.Types.ObjectId(String(instructorId));

        // Get Revenue & Last Enrollment from Enrollments 
        const stats = await this.Enrollment.aggregate([
            {
                $lookup: { from: 'courses', localField: 'course', foreignField: '_id', as: 'c' }
            },
            {
                $match: { 'c.instructor': id }
            },
            {
                $group: {
                    _id: "$course",
                    revenue: { $sum: "$amountPaid" },
                    lastEnrollment: { $max: "$enrolledAt" }
                }
            }
        ]);

        // Get Course Details
        const courses = await this.Course.find({ instructor: id })
            .select('title thumbnail studentsCount rating');

        const statsMap = new Map(stats.map(s => [s._id.toString(), s]));

        const result = courses.map(course => {
            const stat = statsMap.get(course._id.toString());
            return {
                _id: course._id,
                title: course.title,
                thumbnail: course.thumbnail,
                rating: course.rating,
                studentsCount: course.studentsCount || 0,
                revenue: stat ? stat.revenue : 0,
                lastEnrollment: stat ? stat.lastEnrollment : null
            };
        });

        // Sort by Student Count (Descending)
        return result.sort((a, b) => b.studentsCount - a.studentsCount);
    }


    /**
     * Returns the public profile data for an instructor
     * @param {ObjectId} instructorId - The ID of the instructor to get the public profile for
     * @returns {Promise<object>} - A promise that resolves with an object containing the instructor's public profile data and stats
     */
    async getPublicProfile(instructorId) {
        const id = new mongoose.Types.ObjectId(String(instructorId));

        const [instructor, courses] = await Promise.all([

            this.User.findById(id)
                .select('name avatar bio headline website linkedin github twitter instructorStats'),

            // Get Published Courses
            this.Course.find({ instructor: id, status: 'published' })
                .select('title thumbnail price rating ratingCount level slug category instructor')
                .populate('instructor', 'name')
                .populate('category', 'name')
                .sort({ createdAt: -1 })
        ]);

        if (!instructor) throw new Error('Instructor not found');

        // Calculate course stats (Reviews/Ratings)
        const totalReviews = courses.reduce((acc, c) => acc + (c.ratingCount || 0), 0);
        const avgRating = courses.length > 0
            ? (courses.reduce((acc, c) => acc + (c.rating || 0), 0) / courses.length).toFixed(1)
            : "0.0";

        return {
            instructor: {
                ...instructor.toObject(),
                totalStudents: instructor.instructorStats?.totalStudentsTaught || 0
            },
            stats: {
                totalStudents: instructor.instructorStats?.totalStudentsTaught || 0,
                totalReviews,
                avgRating
            },
            courses
        };
    }
}

module.exports = InstructorService;