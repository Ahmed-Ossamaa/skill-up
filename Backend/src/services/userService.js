const log = require('../utils/logger');
const ApiError = require('../utils/ApiError');
const { deleteMediaFromCloudinary } = require('../utils/cloudinaryCelanUp');
const userRepository = require('../repositories/userRepository');
const courseRepository = require('../repositories/courseRepository');
const enrollmentRepository = require('../repositories/enrollmentRepository');


class UserService {
    constructor() {
        this.userRepository = userRepository;
        this.courseRepository = courseRepository;
        this.enrollmentRepository = enrollmentRepository;
    }

    async getAllUsers(page = 1, limit = 10, filters = {}) {
        const skip = (page - 1) * limit;
        const query = {};
        if (filters.status) query.status = filters.status;
        if (filters.role) query.role = filters.role;

        if (filters.search) {
            query.$or = [
                { name: { $regex: filters.search, $options: 'i' } },
                { email: { $regex: filters.search, $options: 'i' } }
            ];
        }

        let sort = { createdAt: -1 };
        if (filters.sort === 'asc') sort = { createdAt: 1 };
        if (filters.sort === 'desc') sort = { createdAt: -1 };

        const { users, total } = await this.userRepository.findAndCountAll(query, sort, skip, limit);

        return {
            total,
            page,
            pages: Math.ceil(total / limit),
            count: users.length,
            data: users
        };
    }

    async getUserById(id) {
        return this.userRepository.findById(id);
    }

    async updateUser(userId, data) {
        const { password, email, ...updateData } = data;
        const updates = { ...updateData };

        if (email) {
            const existing = await this.userRepository.findExistingByEmail(userId, email);
            if (existing) throw ApiError.conflict('Email already in use');
            updates.email = email;
        }

        return this.userRepository.findByIdAndUpdate(userId, updates);
    }

    async deleteUser(id) {
        const user = await this.userRepository.findById(id);
        if (!user) return null;

        const userEnrollments = await this.enrollmentRepository.find({ student: id });

        if (userEnrollments.length > 0) {
            await Promise.all(userEnrollments.map(async (enrollment) => {
                await this.courseRepository.findByIdAndUpdate(enrollment.course, {
                    $inc: { studentCount: -1 },
                    $pull: { students: id }
                });
            }));

            await this.enrollmentRepository.updateMany({ student: id }, { student: null });
        }

        if (user.avatar.publicId) {
            await deleteMediaFromCloudinary({ thumbnailPublicId: user.avatar.publicId });
        }

        await this.userRepository.delete(user);

        log.info(`User deleted successfully: ${user.email}`);
        return user;
    }

    async getDashboardStats() {
        const [
            totalUsers,
            totalCourses,
            activeStudents,
            revenueData,
            recentUsers,
            recentCourses
        ] = await Promise.all([
            this.userRepository.countAll(),
            this.courseRepository.countAll(),
            this.userRepository.countActiveStudents(),
            this.enrollmentRepository.getTotalRevenue(),
            this.userRepository.findRecent(),
            this.courseRepository.findRecent()
        ]);

        const totalRevenue = revenueData.length > 0 ? revenueData[0].total : 0;

        return {
            stats: {
                totalUsers,
                totalCourses,
                totalRevenue,
                activeStudents
            },
            recentUsers,
            recentCourses
        };
    }
}

module.exports =  UserService;
