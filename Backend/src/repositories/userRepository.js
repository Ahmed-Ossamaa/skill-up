
class UserRepository {
    constructor(userModel) {
        this.User = userModel;
    }

    async findByEmail(email) {
        return this.User.findOne({ email });
    }

    async findByEmailWithPassword(email) {
        return this.User.findOne({ email }).select('+password');
    }
    
    async findById(id) {
        return this.User.findById(id);
    }

    async findByIdWithRefreshToken(id) {
        return this.User.findById(id).select('+refreshToken');
    }

    async findByIdWithPassword(id) {
        return this.User.findById(id).select('+password');
    }

    async findByResetToken(hashedToken) {
        return this.User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() },
        }).select('+resetPasswordToken');
    }
    
    async findAndCountAll(query, sort, skip, limit) {
        const [users, total] = await Promise.all([
            this.User.find(query).sort(sort).skip(skip).limit(limit),
            this.User.countDocuments(query)
        ]);
        return { users, total };
    }

    async findExistingByEmail(userId, email) {
        return this.User.findOne({ email, _id: { $ne: userId } });
    }

    async countAll() {
        return this.User.countDocuments();
    }
    
    async countActiveStudents() {
        return this.User.countDocuments({ role: 'student', status: 'active' });
    }

    async findRecent() {
        return this.User.find()
            .select('name email role createdAt status')
            .sort({ createdAt: -1 })
            .limit(5);
    }

    async create(userData) {
        return this.User.create(userData);
    }
    
    async save(user) {
        return user.save();
    }

    async findByIdAndUpdate(id, data, options = { new: true, runValidators: true }) {
        return this.User.findByIdAndUpdate(id, data, options);
    }
    
    async delete(user) {
        return user.deleteOne();
    }
}

module.exports =  UserRepository;
