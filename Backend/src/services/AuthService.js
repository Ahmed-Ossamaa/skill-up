const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const ApiError = require('../utils/ApiError');
const sendEmail = require('../utils/sendEmail');
const userRepository = require('../repositories/userRepository');

class AuthService {
    constructor() { }

    /**
     * Generates an access token for a user
     * @param {object} user - the user to generate an access token for
     * @returns {string} the generated access token
     */
    signAccess(user) {
        return jwt.sign(
            { id: user._id, role: user.role, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '15m' }
        );
    }

    
    /**
     * Generates a refresh token for a user
     * @param {object} user - the user to generate a refresh token for
     * @returns {string} the generated refresh token
     * @description The refresh token is used to obtain a new access token when the current one expires.
     * The refresh token is valid for 7 days.
     */
    signRefresh(user) {
        return jwt.sign(
            { id: user._id, role: user.role, email: user.email },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: '7d' }
        );
    }

    /**
     * Registers a new user with the provided details
     * @param {string} name - the name of the user to register
     * @param {string} email - the email of the user to register
     * @param {string} password - the password of the user to register
     * @param {string} role - the role of the user to register (default: 'student')
     * @returns {Promise<{user: object, accessToken: string, refreshToken: string}>} a promise that resolves with the registered user and tokens
     * @throws {conflict} if a user with the same email already exists
     */
    async register(name, email, password, role = 'student') {
        const existing = await userRepository.findByEmail(email);
        if (existing) throw ApiError.conflict('User already exists');

        const hashedPw = await bcrypt.hash(password, 10);

        const user = await userRepository.create({
            name,
            email,
            password: hashedPw,
            role,
        });

        const accessToken = this.signAccess(user);
        const refreshToken = this.signRefresh(user);

        user.refreshToken = refreshToken;
        await userRepository.save(user);

        const userObj = user.toObject();
        delete userObj.password;
        delete userObj.refreshToken;

        return { user: userObj, accessToken, refreshToken };
    }


    /**
     * Logs in a user with the provided email and password
     * @param {{email: string, password: string}} data - the data to login with
     * @returns {Promise<{user: object, accessToken: string, refreshToken: string}>} a promise that resolves with the logged in user and tokens
     * @throws {notFound} if the user does not exist or the password is incorrect
     */
    async login({ email, password }) {
        const user = await userRepository.findByEmailWithPassword(email);
        if (!user) throw ApiError.notFound('Invalid email or password');

        const matched = await bcrypt.compare(password, user.password);
        if (!matched) throw ApiError.notFound('Invalid email or password');

        const accessToken = this.signAccess(user);
        const refreshToken = this.signRefresh(user);

        user.refreshToken = refreshToken;
        await userRepository.save(user);

        const userObj = user.toObject();
        delete userObj.password;
        delete userObj.refreshToken;

        return { user: userObj, accessToken, refreshToken };
    }


    /**
     * Refreshes access and refresh tokens for a user
     * @param {string} refreshToken - refresh token to be verified
     * @returns {Promise<{user: object, accessToken: string, refreshToken: string}>}
     * @throws {ApiError} - if refresh token is invalid or expired
     */
    async refreshTokens(refreshToken) {
        let payload;
        try {
            payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        } catch (e) {
            throw ApiError.unauthorized('Invalid refresh token');
        }

        const user = await userRepository.findByIdWithRefreshToken(payload.id);
        if (!user || user.refreshToken !== refreshToken)
            throw ApiError.unauthorized('Token expired or invalid');

        const accessToken = this.signAccess(user);
        const newRefreshToken = this.signRefresh(user);

        user.refreshToken = newRefreshToken;
        await userRepository.save(user);

        const userObj = user.toObject();
        delete userObj.refreshToken;

        return { user: userObj, accessToken, refreshToken: newRefreshToken };
    }


    /**
     * Logout a user by clearing their refresh token
     * @param {string} userId - The id of the user to logout
     */
    async logout(userId) {
        await userRepository.findByIdAndUpdate(userId, { refreshToken: null });
    }


    /**
     * Send a password reset link to the user's email
     * @param {string} email - user's email
     * @return {boolean} true if the email was sent successfully
     */
    async forgotPassword(email) {
        const user = await userRepository.findByEmail(email);
        if (!user) throw ApiError.notFound('User not found');

        const rawToken = crypto.randomBytes(32).toString('hex');
        const hashed = crypto.createHash('sha256').update(rawToken).digest('hex');

        user.resetPasswordToken = hashed;
        user.resetPasswordExpires = Date.now() + 60 * 60 * 1000;
        await userRepository.save(user);

        const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${rawToken}`;

        await sendEmail({
            to: email,
            subject: 'Password Reset',
            html: `<p>Click to reset password:</p><a href="${resetUrl}">${resetUrl}</a>`,
        });

        return true;
    }

    /**
     * Resets password for user with given token
     * @param {string} token - hashed token from forgot password
     * @param {string} newPassword - new password for user
     * @throws {badRequest} - if token is invalid or expired
     * @returns {boolean} - true if password is successfully reset
     */
    async resetPassword(token, newPassword) {
        const hashed = crypto.createHash('sha256').update(token).digest('hex');

        const user = await userRepository.findByResetToken(hashed);

        if (!user) throw ApiError.badRequest('Invalid or expired token');

        user.password = await bcrypt.hash(newPassword, 10);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await userRepository.save(user);

        return true;
    }


    /**
     * Change password for logged in user
     * @param {string} userId 
     * @param {string} currentPassword 
     * @param {string} newPassword 
     */
    async changePassword(userId, currentPassword, newPassword) {
        const user = await userRepository.findByIdWithPassword(userId);
        if (!user) {
            throw ApiError.notFound('User not found');
        }
        const matched = await bcrypt.compare(currentPassword, user.password);
        if (!matched) {
            throw ApiError.badRequest('Incorrect current password');
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        user.password = hashedNewPassword;
        await userRepository.save(user);

        return user;
    }

}

module.exports = AuthService;
