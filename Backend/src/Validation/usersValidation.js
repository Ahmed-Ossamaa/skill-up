const joi = require('joi');

const registerSchema = joi.object({
    name: joi.string().required().messages({
        'string.empty': 'Name Cannot be empty',
        'any.required': 'Name is required'
    }),
    email: joi.string().email().required().messages({
        'string.empty': 'Email Cannot be empty',
        'any.required': 'Email is required'
    }),
    password: joi.string().min(8).required().messages({
        'string.empty': 'Password Cannot be empty',
        'any.required': 'Password is required',
        'string.min': 'Password must be at least 8 characters'
    }),
    role: joi.string().valid('user', 'admin', 'moderator').default('user'),
    status: joi.string().valid('active', 'banned').default('active')
});

const loginSchema = joi.object({
    email: joi.string().email().required().messages({
        'string.empty': 'Email Cannot be empty',
        'any.required': 'Email is required'
    }),
    password: joi.string().min(8).required().messages({
        'string.empty': 'Password Cannot be empty',
        'any.required': 'Password is required',
        'string.min': 'Password must be at least 8 characters'
    })
});

const updateUserSchema = joi.object({
    name: joi.string().messages({
        'string.empty': 'Name cannot be empty'
    }),
    email: joi.string().email().messages({
        'string.email': 'Invalid email format'
    }),
    password: joi.string().min(8).messages({
        'string.min': 'Password must be at least 8 characters'
    }),
    role: joi.string().valid('user', 'admin', 'moderator'),
    status: joi.string().valid('active', 'banned')
}).min(1); // require at least one field to be updated


module.exports = { registerSchema, loginSchema, updateUserSchema };