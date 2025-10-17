const log = require('../utils/logger');
class UserService{
    constructor(UserModel){
        this.User = UserModel;
    }

    async getAllUsers(){
        const users = await this.User.find();
        return users;
    }

    async getUserById(id){
        const user = await this.User.findById(id);
        return user;
    }

    async updateUser(userId, data){
        const {passowrd, ...updateData} = data; //pw excluded
        const user = await this.User.findByIdAndUpdate(userId, 
            updateData, 
            {new: true} , 
            {runValidators: true});
        return user;
    }

    async deleteUser(id){
        const user = await this.User.findByIdAndDelete(id);
        log.info(`User deleted successfully: ${user.email}`);
        return user;
    }


}

module.exports = UserService;