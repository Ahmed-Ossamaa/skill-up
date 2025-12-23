const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const ApiError = require('../utils/ApiError');
const sendEmail = require('../utils/sendEmail');

class AuthService {
    constructor(UserModel) {
        this.User = UserModel;
    }

    signAccess(user) {
        return jwt.sign(
            { id: user._id, role: user.role, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '15m' }
        );
    }

    signRefresh(user) {
        return jwt.sign(
            { id: user._id, role: user.role, email: user.email },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: '7d' }
        );
    }

    async register(name, email, password, role = 'student') {
        const existing = await this.User.findOne({ email });
        if (existing) throw ApiError.conflict('User already exists');

        const hashedPw = await bcrypt.hash(password, 10);

        const user = await this.User.create({
            name,
            email,
            password: hashedPw,
            role,
        });

        const accessToken = this.signAccess(user);
        const refreshToken = this.signRefresh(user);

        user.refreshToken = refreshToken;
        await user.save();

        const userObj = user.toObject();
        delete userObj.password;
        delete userObj.refreshToken;

        return { user: userObj, accessToken, refreshToken };
    }

    async login({ email, password }) {
        const user = await this.User.findOne({ email }).select('+password');
        if (!user) throw ApiError.notFound('Invalid email or password');

        const matched = await bcrypt.compare(password, user.password);
        if (!matched) throw ApiError.notFound('Invalid email or password');

        const accessToken = this.signAccess(user);
        const refreshToken = this.signRefresh(user);

        user.refreshToken = refreshToken;
        await user.save();

        const userObj = user.toObject();
        delete userObj.password;
        delete userObj.refreshToken;

        return { user: userObj, accessToken, refreshToken };
    }

    async refreshTokens(refreshToken) {
        let payload;
        try {
            payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        } catch (e) {
            throw ApiError.unauthorized('Invalid refresh token');
        }

        const user = await this.User.findById(payload.id).select('+refreshToken');
        if (!user || user.refreshToken !== refreshToken)
            throw ApiError.unauthorized('Token expired or invalid');

        const accessToken = this.signAccess(user);
        const newRefreshToken = this.signRefresh(user);

        user.refreshToken = newRefreshToken;
        await user.save();

        const userObj = user.toObject();
        delete userObj.refreshToken;

        return { user: userObj, accessToken, refreshToken: newRefreshToken };
    }

    async logout(userId) {
        await this.User.findByIdAndUpdate(userId, { refreshToken: null });
    }

    async forgotPassword(email) {
        const user = await this.User.findOne({ email });
        if (!user) throw ApiError.notFound('User not found');

        const rawToken = crypto.randomBytes(32).toString('hex');
        const hashed = crypto.createHash('sha256').update(rawToken).digest('hex');

        user.resetPasswordToken = hashed;
        user.resetPasswordExpires = Date.now() + 60 * 60 * 1000;
        await user.save();

        const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${rawToken}`;

        await sendEmail({
            to: email,
            subject: 'Password Reset',
            html: `<p>Click to reset password:</p><a href="${resetUrl}">${resetUrl}</a>`,
        });

        return true;
    }

    async resetPassword(token, newPassword) {
        const hashed = crypto.createHash('sha256').update(token).digest('hex');

        const user = await this.User.findOne({
            resetPasswordToken: hashed,
            resetPasswordExpires: { $gt: Date.now() },
        }).select('+resetPasswordToken');

        if (!user) throw ApiError.badRequest('Invalid or expired token');

        user.password = await bcrypt.hash(newPassword, 10);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        return true;
    }


    /**
     * Change password for logged in user
     * @param {string} userId 
     * @param {string} currentPassword 
     * @param {string} newPassword 
     */
    async changePassword(userId, currentPassword, newPassword) {
        const user = await this.User.findById(userId).select('+password');
        if (!user) {
            throw ApiError.notFound('User not found');
        }
        const matched = await bcrypt.compare(currentPassword, user.password);
        if (!matched) {
            throw ApiError.badRequest('Incorrect current password');
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        user.password = hashedNewPassword;
        await user.save();

        return user;
    }

}

module.exports = AuthService;
