const User = require('../models/User');
const AuthService = require('../services/AuthService');
const asyncHandler = require('express-async-handler');

class AuthController {
    constructor() {
        this.AuthService = new AuthService(User);
    }

    register= asyncHandler(async(req, res)=> {
        const { name, email, password } = req.body;
        if(!name || !email || !password) {
            res.status(400);
            throw new Error('Name, Email and Password are required');
        }
        const user = await this.AuthService.register(name, email, password);
        res.status(201).json({
            message: 'User registered successfully',
            data: user
        });
    })

    login = asyncHandler(async (req, res) => {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400);
            throw new Error('Please provide email and password');
        }
        const user = await this.AuthService.login({ email, password });
        res.status(200).json({
            message: `${user.name} logged in successfully`,
            data: user
        });
    })
}

module.exports = new AuthController();


