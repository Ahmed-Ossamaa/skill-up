const mongoose = require('mongoose');


class InstructorService {
    constructor(CourseModel, EnrollmentModel) {
        this.Course = CourseModel;
        this.Enrollment = EnrollmentModel;
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
     * Retrieves instructor statistics.
     * @param {ObjectId} instructorId
     * @returns {Promise<Object>}
     * @fulfill {Object} with the following properties:
     *   - courses {number}: Total number of courses created by the instructor
     *   - rating {number}: Average rating of the instructor's courses
     *   - students {number}: Total number of students enrolled in the instructor's courses
     *   - revenue {number}: Total revenue earned by the instructor
     *   - revenueTrend {string}: Trend of revenue (in %) compared to the previous month
     *   - revenueTrendDir {string}: Direction of revenue trend (up or down)
     *   - studentTrend {string}: Trend of students (in %) compared to the previous month
     *   - studentTrendDir {string}: Direction of student trend (up or down)
     */
async getInstructorStats(instructorId) {
    const id = new mongoose.Types.ObjectId(String(instructorId));
    const now = new Date();
    
    // We only need the start of the CURRENT month to calculate growth "This Month"
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const courseIds = await this.Course.find({ instructor: id }).distinct('_id');

    const [courseData, lifetimeStats, currentMonthStats] = await Promise.all([
        // 1. Course Stats (Average Rating)
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
        
        // 2. Lifetime Totals (The "Big Numbers" on your card)
        this.Enrollment.aggregate([
            { $match: { course: { $in: courseIds } } },
            { $group: { _id: null, count: { $sum: 1 }, amount: { $sum: "$amountPaid" } } }
        ]),

        // 3. Current Month Activity (To calculate how much we grew this month)
        this.Enrollment.aggregate([
            { $match: { course: { $in: courseIds }, enrolledAt: { $gte: startOfCurrentMonth } } },
            { $group: { _id: null, count: { $sum: 1 }, amount: { $sum: "$amountPaid" } } }
        ])
    ]);

    // --- Data Extraction ---
    const total = lifetimeStats[0] || { count: 0, amount: 0 };
    const current = currentMonthStats[0] || { count: 0, amount: 0 };

    // --- The "Real World" Math ---
    
    // 1. Reconstruct the state at the start of the month
    // If Total is 4 and we gained 3 this month, then Start was 1.
    const startStudents = total.count - current.count;
    const startRevenue = total.amount - current.amount;

    // 2. Helper for Cumulative Growth Trend
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
        
        // Trend: "How much bigger is my total now compared to the start of the month?"
        revenueTrend: `${calculateGrowth(total.amount, startRevenue)}%`,
        revenueTrendDir: current.amount > 0 ? 'up' : 'down', // Simple logic: if we made money this month, the total went up.
        
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
}


module.exports = InstructorService;


