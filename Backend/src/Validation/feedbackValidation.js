const joi = require('joi');

const feedbackSchema = joi.object({
    name: joi.string().min(3).max(50),
    email: joi.string().email(),
    subject: joi.string().min(3).max(50).default('General Feedback'),
    message: joi.string().required().min(10).max(1000).messages({
        'string.empty': 'message Cannot be empty',
        'any.required': 'message is required',
        'string.min': 'message must be between 10 and 1000 characters',
        'string.max': 'message must be between 10 and 1000 characters',
    }),
    status: joi.string().valid('new', 'read', 'replied').default('new'),

});

module.exports = { feedbackSchema };