const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const log = require('../utils/logger');
const ApiError = require('../utils/ApiError');
const sendEmail = require('../utils/sendEmail');
const User = require('../models/User');

class AuthService {
    constructor(UserModel) {
        this.User = UserModel;
    }

    async register(name, email, password, role = 'student') {
        const existingUser = await this.User.findOne({ email });
        if (existingUser) {
            throw ApiError.conflict('User already exists');
        }
        const hashedPw = await bcrypt.hash(password, 10);
        const newUser = await this.User.create({ name, email, password: hashedPw, role });

        const accessToken = jwt.sign(
            { id: newUser._id, role: newUser.role, email: newUser.email },
            process.env.JWT_SECRET,
            { expiresIn: '15m' }
        );

        const refreshToken = jwt.sign(
            { id: newUser._id, role: newUser.role, email: newUser.email },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: '7d' }
        );

        newUser.refreshToken = refreshToken;
        await newUser.save();

        const userObj = newUser.toObject();
        delete userObj.password;
        delete userObj.refreshToken;

        log.info(`User created successfully: ${email}`);
        return { user: userObj, accessToken, refreshToken };
    }

    async login({ email, password }) {
        const user = await this.User.findOne({ email }).select('+password');
        if (!user) {
            throw ApiError.notFound('Invalid email or password');
        }
        const matched = await bcrypt.compare(password, user.password);
        if (!matched) {
            throw ApiError.notFound('Invalid email or password');
        }

        const accessToken = jwt.sign(
            { id: user._id, role: user.role, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '15m' }
        );

        const refreshToken = jwt.sign(
            { id: user._id, role: user.role, email: user.email },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: '7d' }
        );

        user.refreshToken = refreshToken;
        await user.save();

        const userObj = user.toObject();
        delete userObj.password;
        delete userObj.refreshToken;

        return { user: userObj, accessToken, refreshToken };
    }

    async refreshTokens(refreshToken) {
        try {
            const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
            const user = await this.User.findById(payload.id).select('+refreshToken');

            if (!user || user.refreshToken !== refreshToken) {
                throw ApiError.unauthorized('Invalid refresh token');
            }

            const accessToken = jwt.sign(
                { id: user._id, role: user.role, email: user.email },
                process.env.JWT_SECRET,
                { expiresIn: '15m' }
            );

            const newRefreshToken = jwt.sign(
                { id: user._id, role: user.role, email: user.email },
                process.env.JWT_REFRESH_SECRET,
                { expiresIn: '7d' }
            );

            user.refreshToken = newRefreshToken;
            await user.save();

            return { accessToken, refreshToken: newRefreshToken };
        } catch (err) {
            throw ApiError.unauthorized('Could not refresh token');
        }
    }

    async logout(userId) {
        const user = await this.User.findById(userId);
        if (!user) return;
        user.refreshToken = null;
        await user.save();
    }

    // Generate random token, hash itthen  store hash
    async forgotPassword(email) {
        const user = await this.User.findOne({ email });
        if (!user) throw ApiError.notFound('No user with that email');

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');

        // Hash before saving
        const hashedToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');

        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
        await user.save();

        // Reset link
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

        await sendEmail({
            to: email,
            subject: 'Reset Your Password - SkillUp',
            html: `
            <p>You requested to reset your password.</p>
            <p>Click the link below to reset it. This link will expire in 1 hour:</p>
            <a href="${resetUrl}">${resetUrl}</a>
            <br />
            <hr />
            <p>If you didn't request this, ignore this email.</p>
            `,
        });

        return true;
    }

    //Hash received token and compare with DB
    async resetPassword(token, newPassword) {
        // Hash the token we received
        const hashedToken = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');

        // Find user with matching hashed token and is not expired
        const user = await this.User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() }
        }).select('+resetPasswordToken +resetPasswordExpires');

        if (!user) throw ApiError.badRequest('Invalid or expired password resettoken');

        // Update password
        const newHashedPw = await bcrypt.hash(newPassword, 10);
        user.password = newHashedPw;
        //Clear reset token fields in db
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        return true;
    }
}

module.exports = AuthService;