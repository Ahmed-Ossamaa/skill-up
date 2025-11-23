const log = require('../utils/logger');
const ApiError = require('../utils/ApiError');
const { deleteMediaFromCloudinary } = require('../utils/cloudinaryCelanUp');


class UserService {
    constructor(UserModel) {
        this.User = UserModel;
    }

    async getAllUsers() {
        return await this.User.find();
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

        // Delete avatar from Cloudinary if exists
        if (user.avatarPublicId) {
            await deleteMediaFromCloudinary({ thumbnailPublicId: user.avatarPublicId });;
        }
        await user.deleteOne();

        log.info(`User deleted successfully: ${user.email}`);
        return user;
    }
}

module.exports = UserService;
