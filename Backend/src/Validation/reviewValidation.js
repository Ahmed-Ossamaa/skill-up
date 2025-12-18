const Joi = require('joi');
const {objectIdValidator} = require('./objectIdValidation');

const createReviewSchema = Joi.object({
    rating: Joi.number().min(1).max(5).required()
        .messages({
            'number.base': 'Rating must be a number',
            'number.min': 'Rating must be at least 1',
            'number.max': 'Rating cannot be more than 5',
            'any.required': 'Rating is required'
        }),
    comment: Joi.string().max(300).allow('')
});

const updateReviewSchema = Joi.object({
    rating: Joi.number().min(1).max(5)
        .messages({
            'number.base': 'Rating must be a number',
            'number.min': 'Rating must be at least 1',
            'number.max': 'Rating cannot be more than 5'
        }),
    comment: Joi.string().max(300).allow('')
}).min(1); // require at least one field to update

module.exports = { createReviewSchema, updateReviewSchema };
