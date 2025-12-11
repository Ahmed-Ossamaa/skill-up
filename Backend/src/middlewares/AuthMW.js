const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');

class AuthMW {
    //only logged in user with token can access
    protect = asyncHandler(async (req, res, next) => {
        let token;

        //cookkies
        if (req.cookies && req.cookies.token) {
            token = req.cookies.token;
        }
        // Fallback to Authorization header
        else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            res.status(401);
            throw ApiError.unauthorized('Not authorized, no token');
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password');
            next();
        } catch (error) {
            res.status(401);
            throw ApiError.unauthorized('Not authorized, token failed');
        }
    })

    optionalAuth = asyncHandler(async (req, res, next) => {
        let token;

        if (req.cookies && req.cookies.token) {
            token = req.cookies.token;
        } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                req.user = await User.findById(decoded.id).select('-password');
            } catch (error) {
                console.warn('Optional auth: token invalid, continuing as guest');
            }
        }

        // If no token or invalid token, req.user remains undefined (guest)
        next();
    });

    //only admin can access 
    isAdmin = asyncHandler(async (req, res, next) => {
        if (req.user.role !== 'admin') {
            res.status(403);
            throw ApiError.forbidden('Access denied, only admin can access this route');
        }
        next();
    })

    //checks user role "takes multiple roles" ('admin' , 'moderator' ,'...etc')
    authorize = (...roles) => {
        return (req, res, next) => {
            if (!roles.includes(req.user.role)) {
                res.status(403);
                throw ApiError.forbidden(`Access denied: Requires ${roles.join(' or ')} role`);
            }
            next();
        };
    };
}

module.exports = new AuthMW();