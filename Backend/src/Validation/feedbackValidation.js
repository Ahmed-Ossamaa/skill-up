const joi = require('joi');

const feedbackSchema = joi.object({
    subject: joi.string().required().min(3).max(50).messages({
        'string.empty': 'subject Cannot be empty',
        'any.required': 'subject is required',
        'string.min': 'subject must be at least 3 characters',
        'string.max': 'subject must be at most 50 characters'
    }),
    message: joi.string().required().min(10).max(200).messages({
        'string.empty': 'message Cannot be empty',
        'any.required': 'message is required',
        'string.min': 'message must be at least 10 characters',
        'string.max': 'message must be at most 200 characters'
    }),

    userEmail: joi.string().email().required().messages({
        'string.empty': 'Email Cannot be empty',
        'any.required': 'Email is required'
    })

});

module.exports = { feedbackSchema };