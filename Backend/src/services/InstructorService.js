const mongoose = require('mongoose');


class InstructorService {
    constructor(CourseModel, EnrollmentModel, UserModel) {
        this.Course = CourseModel;
        this.Enrollment = EnrollmentModel;
        this.User = UserModel;
    }


    /**
     * Fetches all students enrolled in instructor's courses
     * @param {String} instructorId - The id of the instructor
     * @returns {Promise<Object[]>} - An array of objects containing course title, student count, and an array of enrolled students
     */
    async getAllInstructorStudents(instructorId) {
        // Get all courses owned by this instructor
        const instructorCourses = await this.Course
            .find({ instructor: instructorId })
            .select('_id title');

        const courseIds = instructorCourses.map(c => c._id);

        // Aggregate Enrollments
        const data = await this.Enrollment.aggregate([
            {
                //get enrollments matching this instructor's courses
                $match: { course: { $in: courseIds } }
            },
            {
                // Join with User collection to get student details
                $lookup: {
                    from: 'users',
                    localField: 'student',
                    foreignField: '_id',
                    as: 'studentDetails'
                }
            },
            { $unwind: '$studentDetails' },
            {
                // Group by course to categorize them  by course in Frontend
                $group: {
                    _id: '$course',
                    studentCount: { $sum: 1 },
                    enrolledStudents: {
                        $push: {
                            enrollmentId: '$_id',
                            name: '$studentDetails.name',
                            email: '$studentDetails.email',
                            avatar: '$studentDetails.avatar',
                            progress: '$progress.percentage',
                            enrolledAt: '$enrolledAt'
                        }
                    }
                }
            },
            {
                $lookup: {
                    from: 'courses',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'courseInfo'
                }
            },
            { $unwind: '$courseInfo' },
            {
                $project: {
                    courseTitle: '$courseInfo.title',
                    studentCount: 1,
                    enrolledStudents: 1
                }
            },
            { $sort: { courseTitle: 1 } }
        ]);

        return data;
    }


    /**
     * Get instructor stats, including course stats, lifetime totals, and current month activity
     * @param {ObjectId} instructorId
     * @returns {Promise<Object>} containing course stats, lifetime totals, and current month activity
     */
    async getInstructorStats(instructorId) {
        const id = new mongoose.Types.ObjectId(String(instructorId));
        const now = new Date();

        const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const courseIds = await this.Course.find({ instructor: id }).distinct('_id');

        const [courseData, lifetimeStats, currentMonthStats] = await Promise.all([
            // Course Stats (Average Rating)
            this.Course.aggregate([
                { $match: { instructor: id } },
                {
                    $group: {
                        _id: null,
                        totalCourses: { $sum: 1 },
                        avgRating: {
                            $avg: { $cond: [{ $gt: ["$ratingCount", 0] }, "$rating", "$$REMOVE"] }
                        }
                    }
                }
            ]),

            // Lifetime Totals 
            this.Enrollment.aggregate([
                { $match: { course: { $in: courseIds } } },
                { $group: { _id: null, count: { $sum: 1 }, amount: { $sum: "$amountPaid" } } }
            ]),

            // Current Month Activity 
            this.Enrollment.aggregate([
                { $match: { course: { $in: courseIds }, enrolledAt: { $gte: startOfCurrentMonth } } },
                { $group: { _id: null, count: { $sum: 1 }, amount: { $sum: "$amountPaid" } } }
            ])
        ]);

        // --- Data Extraction ---
        const total = lifetimeStats[0] || { count: 0, amount: 0 };
        const current = currentMonthStats[0] || { count: 0, amount: 0 };

        const startStudents = total.count - current.count;
        const startRevenue = total.amount - current.amount;

        //Cumulative Growth
        const calculateGrowth = (currentTotal, startTotal) => {
            if (startTotal === 0) return currentTotal > 0 ? "100.0" : "0.0";
            return (((currentTotal - startTotal) / startTotal) * 100).toFixed(1);
        };

        return {
            courses: courseData[0]?.totalCourses || 0,
            rating: courseData[0]?.avgRating?.toFixed(1) || "0.0",

            // Displaying Lifetime Totals
            students: total.count,
            revenue: total.amount,

            revenueTrend: `${calculateGrowth(total.amount, startRevenue)}%`,
            revenueTrendDir: current.amount > 0 ? 'up' : 'down',

            studentTrend: `${calculateGrowth(total.count, startStudents)}%`,
            studentTrendDir: current.count > 0 ? 'up' : 'down'
        };
    }


    /**
     * Retrieves revenue analytics for an instructor.
     * @param {ObjectId} instructorId
     * @returns {Promise<Object[]>} with the following properties:
     *   - _id {string}: Year and month of the analytics
     *   - revenue {number}: Total revenue earned by the instructor in the given month
     *   - students {number}: Total students enrolled in the instructor's courses in the given month
     */
    async getRevenueAnalytics(instructorId) {
        const courseIds = await this.Course.find({ instructor: instructorId }).distinct('_id');

        const analytics = await this.Enrollment.aggregate([
            {
                $match: { course: { $in: courseIds } }
            },
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
                    month: {
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

        return analytics;
    }


    /**
     * Retrieves the performance of the courses created by the instructor with the given id.
     * The performance metrics include the title, thumbnail, number of students, revenue, and last enrollment date.
     * The results are sorted by the number of students in descending order.
     * @param {string} instructorId - The id of the instructor
     * @returns {Promise<Object[]>} - An array of objects containing the performance metrics of the courses
     */
    async getCoursePerformance(instructorId) {
        const id = new mongoose.Types.ObjectId(String(instructorId));

        return await this.Course.aggregate([
            { $match: { instructor: id } },
            {
                $lookup: {
                    from: 'enrollments',
                    localField: '_id',
                    foreignField: 'course',
                    as: 'enrollments'
                }
            },
            {
                $project: {
                    title: 1,
                    thumbnail: 1,
                    studentCount: { $size: "$enrollments" },
                    revenue: { $sum: "$enrollments.amountPaid" },
                    lastEnrollment: { $max: "$enrollments.enrolledAt" }
                }
            },
            { $sort: { studentCount: -1 } } // Sort by most popular
        ]);
    }


    /**
     * Retrieves the public profile of an instructor with the given id.
     * The public profile includes the instructor's basic information, stats, and published courses.
     * @param {string} instructorId - The id of the instructor
     * @returns {Promise<Object>} - An object containing the instructor's public profile
     */
    async getPublicProfile(instructorId) {
        const id = new mongoose.Types.ObjectId(String(instructorId));

        // all course _IDs 
        const courseIds = await this.Course.find({ instructor: id }).distinct('_id');

        const [instructor, stats, courses] = await Promise.all([
            // Basic Public Info
            this.User.findById(id).select('name avatar bio headline website linkedin github twitter'),

            // stats 
            (async () => {
                const [courseStats, studentCount] = await Promise.all([
                    this.Course.aggregate([
                        { $match: { _id: { $in: courseIds }, status: 'published' } },
                        {
                            $group: {
                                _id: null,
                                totalReviews: { $sum: "$ratingCount" },
                                avgRating: {
                                    $avg: { $cond: [{ $gt: ["$ratingCount", 0] }, "$rating", "$$REMOVE"] }
                                }
                            }
                        }
                    ]),
                    // Live count of students from the Enrollment
                    this.Enrollment.countDocuments({ course: { $in: courseIds } })
                ]);

                return {
                    totalStudents: studentCount || 0,
                    totalReviews: courseStats[0]?.totalReviews || 0,
                    avgRating: courseStats[0]?.avgRating?.toFixed(1) || 0
                };
            })(),

            //instructor published courses
            this.Course.find({ instructor: id, status: 'published' })
                .select('title thumbnail price rating ratingCount level slug category instructor')
                .populate('instructor', 'name')
                .populate('category', 'name')
                .sort({ createdAt: -1 })
        ]);

        if (!instructor) throw new Error('Instructor not found');

        return {
            instructor,
            stats: stats || { totalStudents: 0, totalReviews: 0, avgRating: 0 },
            courses
        };
    }
}


module.exports = InstructorService;


