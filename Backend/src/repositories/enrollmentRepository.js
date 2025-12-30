const Enrollment = require('../models/Enrollment');

class EnrollmentRepository {
    constructor() {
        this.Enrollment = Enrollment;
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

    async find(query) {
        return this.Enrollment.find(query);
    }

    async updateMany(query, update) {
        return this.Enrollment.updateMany(query, update);
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

    async getRevenueAnalyticsByInstructor(instructorId) {
        const monthlyRevenue = await this.Enrollment.aggregate([
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
                    'course.instructor': instructorId
                }
            },
            {
                $group: {
                    _id: {
                        month: { $month: "$createdAt" },
                        year: { $year: "$createdAt" }
                    },
                    totalRevenue: { $sum: "$amountPaid" }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]);
        return monthlyRevenue;
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
}

module.exports = new EnrollmentRepository();
