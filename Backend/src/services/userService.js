const log = require('../utils/logger');
const ApiError = require('../utils/ApiError');
const { deleteMediaFromCloudinary } = require('../utils/cloudinaryCelanUp');
const { uploadToCloudinary } = require('../utils/cloudinaryHelpers');


class UserService {
    constructor(UserModel, CourseModel, EnrollmentModel, InstructorRequestModel) {
        this.User = UserModel;
        this.Course = CourseModel;
        this.Enrollment = EnrollmentModel;
        this.InstructorRequest = InstructorRequestModel
    }

    async getAllUsers(page = 1, limit = 10, filters = {}) {
        const skip = (page - 1) * limit;
        const query = {};
        //filters
        if (filters.status) query.status = filters.status;
        if (filters.role) query.role = filters.role;

        //search
        if (filters.search) {
            query.$or = [
                { name: { $regex: filters.search, $options: 'i' } },
                { email: { $regex: filters.search, $options: 'i' } }
            ];
        }
        //sort
        let sort = { createdAt: -1 };
        if (filters.sort === 'asc') sort = { createdAt: 1 };
        if (filters.sort === 'desc') sort = { createdAt: -1 };

        const [users, total] = await Promise.all([
            this.User.find(query).sort(sort).skip(skip).limit(limit),
            this.User.countDocuments(query)
        ]);

        return {
            total,
            page, pages: Math.ceil(total / limit),
            count: users.length,
            data: users
        };

    }

    async getUserById(id) {
        const user = await this.User.findById(id);
        return user;
    }

    async updateUser(userId, data) {
        const { password, email, ...updateData } = data;
        const updates = { ...updateData };// exclude pwd and email

        if (email) {
            const existing = await this.User.findOne({ email, _id: { $ne: userId } });
            if (existing) throw ApiError.conflict('Email already in use');
            updates.email = email;
        }

        const user = await this.User.findByIdAndUpdate(
            userId,
            updates,
            { new: true, runValidators: true }
        );

        return user;
    }

    async deleteUser(id) {
        const user = await this.User.findById(id);
        if (!user) return null;

        const userEnrollments = await this.Enrollment.find({ student: id });

        if (userEnrollments.length > 0) {
            await Promise.all(userEnrollments.map(async (enrollment) => {
                await this.Course.findByIdAndUpdate(enrollment.course, {
                    $inc: { studentCount: -1 }, //dec student count
                    $pull: { students: id } //from student []
                });
            }));

            //nullishing the student field (deleting it will decrease the revenue which is already calculated)
            await this.Enrollment.updateMany(
                { student: id },
                { student: null } //to keep the student field empty but the revenue is still there
            );
        }

        // Delete avatar from Cloudinary if exists
        if (user.avatar.publicId) {
            await deleteMediaFromCloudinary({ thumbnailPublicId: user.avatar.publicId });;
        }
        await user.deleteOne();

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
            // Total Users
            this.User.countDocuments(),

            // Total Courses
            this.Course.countDocuments(),

            // Active Students
            this.User.countDocuments({ role: 'student', status: 'active' }),

            //Total Revenue
            this.Enrollment.aggregate([
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
            ]),

            // Recent Users (Limit 5)
            this.User.find()
                .select('name email role createdAt status')
                .sort({ createdAt: -1 })
                .limit(5),

            // Recent Courses
            this.Course.find()
                .select('title price studentsCount createdAt instructor studentStats instructorStats')
                .populate('instructor', 'name')
                .sort({ createdAt: -1 })
                .limit(5)
        ]);

        // Extract revenue []
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

    //creat request to become an instructor
    async createRequest(userId, data, files) {

        const existing = await this.InstructorRequest.findOne({ user: userId });
        if (existing && existing.status === 'pending') {
            throw ApiError.conflict('You already have a pending instructor request.');
        }
        const nationalIdFile = files.nationalId ? files.nationalId[0] : null;
        const certificateFile = files.certificate ? files.certificate[0] : null;
        const resumeFile = files.resume ? files.resume[0] : null;
        if (!nationalIdFile || !certificateFile || !resumeFile) {
            throw ApiError.badRequest("All documents (National ID, Certificate, Resume) are required.");
        }
        const uploadPromises = [
            uploadToCloudinary(nationalIdFile.buffer, 'instructorDocs/nationalId', 'auto'),
            uploadToCloudinary(certificateFile.buffer, 'instructorDocs/certificates', 'auto'),
            uploadToCloudinary(resumeFile.buffer, 'instructorDocs/resumes', 'auto')
        ];

        const [nationalIdResult, certificateResult, resumeResult] = await Promise.all(uploadPromises);
        const requestData = {
            user: userId,
            experience: data.experience,
            documents: {
                nationalId: {
                    url: nationalIdResult.secure_url,
                    publicId: nationalIdResult.publicId
                },
                certificate: {
                    url: certificateResult.secure_url,
                    publicId: certificateResult.publicId
                },
                resume: {
                    url: resumeResult.secure_url,
                    publicId: resumeResult.publicId
                }
            }
        };

        const newRequest = await this.InstructorRequest.create(requestData);
        return newRequest;
    }

    //get all  requests (admin)
    async getAllRequests() {
        return await this.InstructorRequest.find()
            .populate('user', 'name email status role avatar')
            .sort({ createdAt: -1 });
    }

    async reviewRequest(requestId, status, feedback) {
        const request = await this.InstructorRequest.findById(requestId)
        .populate('user', 'name email status role avatar');

        if (!request) {
            throw ApiError.notFound('Request not found');
        }

        if (request.status !== 'pending') {
            throw ApiError.badRequest(`Request is already ${request.status}`);
        }

        // Update Request Status
        request.status = status;
        request.adminFeedback = feedback || '';
        await request.save();

        //when Approved >> Upgrade the User to Instructor
        if (status === 'approved') {
            await this.User.findByIdAndUpdate(request.user._id, {
                role: 'instructor',
            });
        }

        return request; 
    }
}

module.exports = UserService;
