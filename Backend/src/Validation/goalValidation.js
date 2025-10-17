const joi = require('joi');

const goalSchema = joi.object({
    title: joi.string().required().messages({
        'string.empty': 'Title Cannot be empty',
        'any.required': 'Title is required'
    }),
    progress : joi.number().min(0).max(100).messages({
        'number.min': 'Progress connot be a negative number',
        'number.max': 'Progress cannot be greater than 100'
    }),
    notes: joi.string().allow('')
});

const updateGoalSchema = joi.object({
    title: joi.string().messages({
        'string.empty': 'Title cannot be empty'
    }),
    progress : joi.number().min(0).max(100).messages({
        'number.min': 'Progress connot be a negative number',
        'number.max': 'Progress cannot be greater than 100'
    }),
    notes: joi.string().allow('')
})
module.exports = { goalSchema, updateGoalSchema };