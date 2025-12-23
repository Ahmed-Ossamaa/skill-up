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
    role: joi.string().valid('student', 'instructor').default('student'),
    bio: joi.string().max(200),
    headline: joi.string().max(50),
    website: joi.string().max(100),
    github: joi.string().max(100),
    linkedin: joi.string().max(100),
    twitter: joi.string().max(100),
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
    role: joi.string().valid('student', 'instructor', 'admin'),
    bio: joi.string().max(200).allow(''),
    headline: joi.string().max(50).allow(''),
    website: joi.string().max(100).allow(''),
    github: joi.string().max(100).allow(''),
    linkedin: joi.string().max(100).allow(''),
    twitter: joi.string().max(100).allow(''),
    status: joi.string().valid('active', 'banned').default('active')
}).min(1); // require at least one field to be updated

const forgotSchema = joi.object({
    email: joi.string().email().required()
});

const resetSchema = joi.object({
    token: joi.string().required(),
    password: joi.string().min(8).required().messages({
        'string.empty': 'Password Cannot be empty',
        'any.required': 'Password is required',
        'string.min': 'Password must be at least 8 characters'
    })
});

const changePasswordSchema = joi.object({
    currentPassword: joi.string().min(8).required().messages({
        'string.empty': 'Current Password Cannot be empty',
        'any.required': 'Current Password is required',
        'string.min': 'Current Password must be at least 8 characters'
    }),
    newPassword: joi.string().min(8).required().messages({
        'string.empty': 'New Password Cannot be empty',
        'any.required': 'New Password is required',
        'string.min': 'New Password must be at least 8 characters'
    }),

    confirmNewPassword: joi.string().min(8).required().messages({
        'string.empty': 'Confirm New Password Cannot be empty',
        'any.required': 'Confirm New Password is required',
        'string.min': 'Confirm New Password must be at least 8 characters'
    })
});

module.exports = { registerSchema, loginSchema, updateUserSchema, forgotSchema,resetSchema, changePasswordSchema };