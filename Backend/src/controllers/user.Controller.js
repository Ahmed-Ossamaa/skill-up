const asyncHandler = require('express-async-handler');
const ApiError = require('../utils/ApiError');
const sendEmail = require('../utils/sendEmail');


class UserController {
    constructor(userService,instructorService) {
        this.userService = userService;
        this.instructorService = instructorService;
    }

    // GET /users
    getAllUsers = asyncHandler(async (req, res) => {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const filters = {
            status: req.query.status,
            role: req.query.role,
            search: req.query.search,
            sort: req.query.sort
        };
        const users = await this.userService.getAllUsers(page, limit, filters);
        res.status(200).json({ data: users });
    });

    // GET /users/:id
    getUserById = asyncHandler(async (req, res) => {
        const id = req.params.id || req.user.id;

        if (req.user.role !== 'admin' && req.user.id !== id) {
            throw ApiError.forbidden('Access denied');
        }

        const user = await this.userService.getUserById(id);
        if (!user) throw ApiError.notFound('User not found');

        res.status(200).json({ data: user });
    });

    // PATCH /users/:id
    updateUser = asyncHandler(async (req, res) => {
        const id = req.params.id || req.user.id;

        if (req.user.role !== 'admin' && req.user.id.toString() !== id.toString()) {
            throw ApiError.forbidden('Access denied');
        }
        const updateData = { ...req.body };

        if (req.user.role !== 'admin') {
            delete updateData.role;
            delete updateData.isVerified;
        }

        const user = await this.userService.updateUser(id, updateData);
        if (!user) throw ApiError.notFound('User not found');

        res.status(200).json({ data: user });
    });

    // DELETE /users/:id
    deleteUser = asyncHandler(async (req, res) => {
        const { id } = req.params;

        if (req.user.role !== 'admin') {
            throw ApiError.forbidden('Only admin can delete users');
        }

        const user = await this.userService.deleteUser(id);
        if (!user) throw ApiError.notFound('User not found');

        res.status(200).json({ message: `User deleted successfully: ${user.email}` });
    });

    getDashboardStats = asyncHandler(async (req, res) => {
        const stats = await this.userService.getDashboardStats();

        res.status(200).json({
            success: true,
            data: stats
        });
    });


    requestInstructor = asyncHandler(async (req, res) => {
        const { id } = req.user;
        const files = req.files;

        await this.instructorService.createRequest(id, req.body, files);

        res.status(200).json({ message: "Request submitted! Waiting for admin approval." });
    });

    getAllRequests = asyncHandler(async (req, res) => {
        const requests = await this.instructorService.getAllRequests();
        res.status(200).json({ data: requests });
    })


    reviewRequest = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const { status, feedback } = req.body;

        if (!['approved', 'rejected'].includes(status)) {
            throw ApiError.badRequest("Status must be 'approved' or 'rejected'");
        }

        const request = await this.instructorService.reviewRequest(id, status, feedback);

        // ...........Send Email ..............
        const userEmail = request.user.email;
        const subject = status === 'approved'
            ? 'Your Instructor Application is Approved!'
            : 'Update on your Instructor Application';

        const instructorName = request.user.name;
        const message = status === 'approved'
            ? `Hello ${instructorName},\n\nCongratulations! Your application to become an instructor on Skill-Up has been approved. You can now access your Instructor Dashboard and start creating courses.\n\nPlease log out and log back in to refresh your permissions.`
            : `Hello ${instructorName},\n\nThank you for your interest in teaching on Skill-Up. Unfortunately, your application was not approved at this time.\n\nFeedback: ${feedback}\n\nYou may re-apply after addressing these points.`;


            await sendEmail({
                to: userEmail,
                subject: subject,
                html: message
            });

        res.status(200).json({
            message: `Request ${status}`,
            data: request
        });
    });
}

module.exports =  UserController;
