const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const log = require('../utils/logger');

class AuthService {
    constructor(UserModel) {
        this.User = UserModel;
    }

    async register(name, email, password) {

        const existingUser = await this.User.findOne({ email });
        if (existingUser) {
            throw new Error('User already exists');
        }
        const hashedPw = await bcrypt.hash(password, 10);
        const newUser = await this.User.create({ name, email, password: hashedPw });

        const userObj = newUser.toObject();
        delete userObj.password;
        const token = jwt.sign({ id: newUser._id, role: newUser.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
        
        log.info(`User created successfully: ${email}`);
        return {...userObj, token};
    }
    async login({ email, password }) {
        const user = await this.User.findOne({ email }).select('+password');
        if (!user) {
            throw new Error('invalid email or password');
        }
        const matched = await bcrypt.compare(password, user.password);
        if (!matched) {
            throw new Error('Invalid email or password');
        }

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
        const userObj = user.toObject();
        delete userObj.password;

        return { ...userObj, token };
    }
    passwordResetToken(userId) {
        return jwt.sign(
            { id: userId, type: 'password-reset' },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );
    }
}

module.exports = AuthService;