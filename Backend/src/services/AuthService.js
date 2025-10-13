const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

class AuthService {
    constructor(UserModel) {
        this.User = UserModel;
    }

    async register(name, email, password) {
            const hashedPw = await bcrypt.hash(password, 10);
            const newUSer =await this.User.create({ name, email, password: hashedPw });
            return newUSer;
    }
    async login({ email, password }) {
            const user = await this.User.findOne({email});
            if (!user){
                throw new Error('User not found');
            }
            const matched = await bcrypt.compare (password, user.password);
            if (!matched){
                throw new Error('Invalid password');
            }
            const token = jwt.sign({id: user._id, role: user.role}, process.env.JWT_SECRET, {expiresIn: '7d'});
            return { user, token};
    }
}

module.exports = AuthService;