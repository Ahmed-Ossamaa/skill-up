const User = require('../models/User');
const AuthService = require('../services/AuthService');
const asyncHandler = require('express-async-handler');
const ApiError = require('../utils/ApiError');
const sanitizeUser = require('../utils/sanitizeUser');

class AuthController {
    constructor() {
        this.AuthService = new AuthService(User);
    }

    setRefreshCookie(res, refreshToken) {
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.COOKIE_SECURE === 'true',
            sameSite: 'Lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
    }

    register = asyncHandler(async (req, res) => {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password)
            throw ApiError.badRequest('Name, Email and Password are required');

        const { user, accessToken, refreshToken } =
            await this.AuthService.register(name, email, password, role);

        this.setRefreshCookie(res, refreshToken);

        res.status(201).json({
            message: 'User registered successfully',
            data: { user:sanitizeUser(user), accessToken },
        });
    });

    login = asyncHandler(async (req, res) => {
        const { email, password } = req.body;

        if (!email || !password)
            throw ApiError.badRequest('Please provide email and password');

        const { user, accessToken, refreshToken } =
            await this.AuthService.login({ email, password });

        this.setRefreshCookie(res, refreshToken);

        res.status(200).json({
            message: `${user.name} logged in successfully`,
            data: { user:sanitizeUser(user), accessToken },
        });
    });

    refresh = asyncHandler(async (req, res) => {
        const oldRefreshToken = req.cookies.refreshToken;
        if (!oldRefreshToken) throw ApiError.badRequest('No refresh token provided');

        const { accessToken, refreshToken: newRT, user } =
            await this.AuthService.refreshTokens(oldRefreshToken);

        this.setRefreshCookie(res, newRT);

        res.status(200).json({
            message: 'Token refreshed successfully',
            data: { user, accessToken },
        });
    });

    logout = asyncHandler(async (req, res) => {
        if (req.user?.id) await this.AuthService.logout(req.user.id);

        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: process.env.COOKIE_SECURE === 'true',
            sameSite: 'Lax',
        });

        res.status(200).json({ message: 'Logged out successfully' });
    });

    forgotPassword = asyncHandler(async (req, res) => {
        const { email } = req.body;
        if (!email) throw ApiError.badRequest('Email is required');

        await this.AuthService.forgotPassword(email);
        res.status(200).json({ message: `Password reset link sent to ${email}` });
    });

    resetPassword = asyncHandler(async (req, res) => {
        const { token, password } = req.body;
        if (!token || !password)
            throw ApiError.badRequest('Token and password are required');

        await this.AuthService.resetPassword(token, password);
        res.status(200).json({ message: 'Password reset successful' });
    });

}

module.exports = new AuthController();
