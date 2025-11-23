const User = require('../models/User');
const AuthService = require('../services/AuthService');
const asyncHandler = require('express-async-handler');
const ApiError = require('../utils/ApiError');

class AuthController {
    constructor() {
        this.AuthService = new AuthService(User);
    }

    register = asyncHandler(async (req, res) => {
        const { name, email, password, role } = req.body;
        if (!name || !email || !password) {
            res.status(400);
            throw ApiError.badRequest('Name, Email and Password are required');
        }

        const { user, accessToken, refreshToken } = await this.AuthService.register(name, email, password, role);
        res.cookie('token', accessToken, {
            httpOnly: true,
            secure: process.env.COOKIE_SECURE === 'true',
            sameSite: 'strict',
            maxAge: 15 * 60 * 1000 // 15 min
        });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.COOKIE_SECURE === 'true',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });


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
        const { user, accessToken, refreshToken } = await this.AuthService.login({ email, password });
        res.cookie('token', accessToken, {
            httpOnly: true,// prevent JavaScript access (XSS protection)
            secure: process.env.COOKIE_SECURE === 'true', // send only over HTTPS in production (true in dev)
            sameSite: 'strict',
            maxAge: 15 * 60 * 1000 // 15 min
        });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.COOKIE_SECURE === 'true',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
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

    refresh = asyncHandler(async (req, res) => {
        const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
        if (!refreshToken) throw ApiError.badRequest('No refresh token provided');

        const tokens = await this.AuthService.refreshTokens(refreshToken);

        res.cookie('token', tokens.accessToken, {
            httpOnly: true,
            secure: process.env.COOKIE_SECURE === 'true',
            sameSite: 'strict',
            maxAge: 15 * 60 * 1000
        });

        res.cookie('refreshToken', tokens.refreshToken, {
            httpOnly: true,
            secure: process.env.COOKIE_SECURE === 'true',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.status(200).json({ message: 'Token refreshed successfully' });
    });

    logout = asyncHandler(async (req, res) => {
        const userId = req.user.id;
        if (userId) await this.AuthService.logout(userId);
        // clear token from cookies
        res.clearCookie('token');
        res.clearCookie('refreshToken')

        res.status(200).json({
            message: 'Logged out successfully',
        });
    });

    forgotPassword = asyncHandler(async (req, res) => {
        const { email } = req.body;
        if (!email) throw ApiError.badRequest( 'Email is required');
        await this.AuthService.forgotPassword(email);
        res.status(200).json({ message: `Password reset link sent to ${email}` });
    });

    resetPassword = asyncHandler(async (req, res) => {
        const { token, password } = req.body;
        if (!token || !password) throw ApiError.badRequest( 'Token and new password are required');
        await this.AuthService.resetPassword(token, password);
        res.status(200).json({ message: 'Password reset successful'});
    });

}

module.exports = new AuthController();


