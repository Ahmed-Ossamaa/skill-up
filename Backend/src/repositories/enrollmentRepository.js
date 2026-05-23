
class EnrollmentRepository {
    constructor(enrollmentModel, courseModel) {
        this.Enrollment = enrollmentModel;
        this.Course = courseModel;
    }

    async findOne(query) {
        return this.Enrollment.findOne(query);
    }

    async findByStudent(studentId) {
        return this.Enrollment.find({ student: studentId });
    }

    async findStudentEnrollmentsWithDetails(studentId) {
        return this.Enrollment.find({ student: studentId })
            .populate({
                path: "course",
                select: "title thumbnail instructor slug rating price",
                populate: {
                    path: "instructor",
                    select: "name email"
                }
            });
    }

    async findEnrollmentForCertificate(studentId, courseId) {
        return this.Enrollment.findOne({
            student: studentId,
            course: courseId
        }).populate({
            path: 'course',
            select: 'title instructor thumbnail',
            populate: {
                path: 'instructor',
                select: 'name'
            }
        })
            .populate('student', 'name');
    }

    async create(enrollmentData) {
        return this.Enrollment.create(enrollmentData);
    }

    async nullifyStudent(studentId) {
        return this.Enrollment.updateMany({ student: studentId }, { student: null });
    }

    async getTotalRevenue() {
        const revenueData = await this.Enrollment.aggregate([
            {
                $match: {
                    status: { $in: ['enrolled', 'completed'] }
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: "$amountPaid" }
                }
            }
        ]);
        return revenueData;
    }

    async save(enrollment) {
        return enrollment.save();
    }

    async count(query) {
        return this.Enrollment.countDocuments(query);
    }

    find(query) {
        return this.Enrollment.find(query);
    }

    async updateMany(query, update) {
        return this.Enrollment.updateMany(query, update);
    }

    async deleteMany(query) {
        return this.Enrollment.deleteMany(query);
    }

    async getTotalRevenueByInstructor(instructorId) {
        const revenueData = await this.Enrollment.aggregate([
            {
                $lookup: {
                    from: 'courses',
                    localField: 'course',
                    foreignField: '_id',
                    as: 'course'
                }
            },
            {
                $unwind: '$course'
            },
            {
                $match: {
                    'course.instructor': instructorId,
                    status: { $in: ['enrolled', 'completed'] }
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: "$amountPaid" }
                }
            }
        ]);
        return revenueData;
    }



    async getCoursePerformanceStats(instructorId) {
        const mongoose = require('mongoose');
        const id = new mongoose.Types.ObjectId(String(instructorId));
        return this.Enrollment.aggregate([
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
    }

    /**
 * Get all students enrolled in instructor's courses, grouped by course
 * @param {ObjectId} instructorId - The instructor's ID
 * @returns {Promise<Array>} Array of courses with enrolled students
 */
    async getInstructorStudentsGroupedByCourse(instructorId) {
        const mongoose = require('mongoose');
        const id = new mongoose.Types.ObjectId(String(instructorId));

        // course IDs 
        const courseIds = await this.Course.find({ instructor: id }).distinct('_id');

        return this.Enrollment.aggregate([
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
     * Get revenue analytics by instructor (with formatted labels and student count)
     * @param {ObjectId} instructorId - The instructor's ID
     * @returns {Promise<Array>} Array of monthly revenue data
     */
    async getRevenueAnalyticsByInstructor(instructorId) {
        const mongoose = require('mongoose');
        const id = new mongoose.Types.ObjectId(String(instructorId));

        // course IDs
        const courseIds = await this.Course.find({ instructor: id }).distinct('_id');

        return this.Enrollment.aggregate([
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


}

module.exports = EnrollmentRepository;
