const Joi = require('joi');

const createCategorySchema = Joi.object({
    name: Joi.string().required().min(3).max(50).messages({
        'string.empty': 'Category name cannot be empty',
        'any.required': 'Category name is required',
        'string.min': 'Category name must be at least 3 characters',
        'string.max': 'Category name cannot be more than 50 characters'
    }),
    description: Joi.string().min(3).max(200).allow('').messages({
        'string.min': 'Description must be at least 3 characters',
        'string.max': 'Description cannot be more than 200 characters'
    }),
    parent: Joi.string().allow(null, '')
});

const updateCategorySchema = Joi.object({
    name: Joi.string().min(3).max(50).messages({
        'string.min': 'Category name must be at least 3 characters',
        'string.max': 'Category name cannot be more than 50 characters'
    }),
    parent: Joi.string().allow(null, ''),
    description: Joi.string().min(3).max(200).allow('').messages({
        'string.min': 'Description must be at least 3 characters',
        'string.max': 'Description cannot be more than 200 characters'
    })
}).min(1); // require at least one field to update

module.exports = { createCategorySchema, updateCategorySchema };
