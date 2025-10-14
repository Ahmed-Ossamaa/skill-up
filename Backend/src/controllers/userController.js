const User = require('../models/User');
const UserService = require('../services/userService');
const asyncHandler = require('express-async-handler');

class UserController {
    constructor() {
        this.userService = new UserService(User);
    }
    // user/all
    getAllUsers = asyncHandler(async (req, res) => {
        const users = await this.userService.getAllUsers();
        res.status(200).json({data:users});
    })
    //get user/:id
    getUserById = asyncHandler(async (req, res) => {
        const { id } = req.params;

        if (req.user.role !== 'admin' && req.user.id !== id) {
            res.status(403);
            throw new Error('Not authorized to access this user');
        }
        const user = await this.userService.getUserById(id);
        res.status(200).json({data: user});
    })
    //patch user/:id
    updateUser = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const user = await this.userService.updateUser(id, req.body);
        res.status(200).json({data: user});
    })
    //delete user/:id
    deleteUser = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const user = await this.userService.deleteUser(id);
        res.status(200).json({data: user});
    })
}

module.exports = new UserController();