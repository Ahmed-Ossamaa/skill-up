const User = require('../models/User');
const AuthService = require('../services/AuthService');
const asyncHandler = require('express-async-handler');
const ApiError = require('../utils/ApiError');

class AuthController {
    constructor() {
        this.AuthService = new AuthService(User);
    }

    register = asyncHandler(async (req, res) => {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            res.status(400);
            throw ApiError.badRequest('Name, Email and Password are required');
        }
        const user = await this.AuthService.register(name, email, password);
        res.status(201).json({
            message: 'User registered successfully',
            data: user
        });
    })

    login = asyncHandler(async (req, res) => {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400);
            throw ApiError.badRequest('Please provide email and password');
        }
        const user = await this.AuthService.login({ email, password });

        res.cookie('token', user.token, {
            httpOnly: true, // prevent JavaScript access (XSS protection)
            secure: process.env.NODE_ENV === 'production', // send only over HTTPS in production
            sameSite: 'strict', // prevent CSRF
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });
        res.status(200).json({
            message: `${user.name} logged in successfully`,
            data: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    })

    logout = asyncHandler(async (req, res) => {
        // clear token from cookies
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict', 
            path: '/',
        });

        res.status(200).json({
            message: 'Logged out successfully',
        });
    });

}

module.exports = new AuthController();


