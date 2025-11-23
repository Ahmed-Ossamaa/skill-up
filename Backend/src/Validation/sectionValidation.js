const Joi = require('joi');
const { objectIdValidator } = require('./objectIdValidation');

const createSectionSchema = Joi.object({
    title: Joi.string().required().messages({
        'string.empty': 'Section title is required',
        'any.required': 'Section title is required'
    }),
    description: Joi.string().allow(''),
    order: Joi.number().min(0).default(0),
    course: objectIdValidator.required().messages({
        'string.empty': 'CourseId is required'
    }),
    lessons: Joi.array().items(objectIdValidator)
});

const updateSectionSchema = Joi.object({
    title: Joi.string().messages({ 'string.empty': 'Section title cannot be empty' }),
    description: Joi.string().allow(''),
    order: Joi.number().min(0),
    lessons: Joi.array().items(objectIdValidator),
    course: Joi.forbidden()
}).min(1);

module.exports = { createSectionSchema, updateSectionSchema };
