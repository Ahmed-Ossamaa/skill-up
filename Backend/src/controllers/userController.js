const User = require('../models/User');
const UserService = require('../services/userService');
const asyncHandler = require('express-async-handler');
const ApiError = require('../utils/ApiError');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');

class UserController {
    constructor() {
        this.userService = new UserService(User, Course, Enrollment);

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

        if (req.user.role !== 'admin' && req.user.id !== id) {
            throw ApiError.forbidden('Access denied');
        }

        const user = await this.userService.updateUser(id, req.body);
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
}

module.exports = new UserController();
