const Joi = require('joi');

const createCategorySchema = Joi.object({
    name: Joi.string().required().messages({
        'string.empty': 'Category name is required'
    }),
    description: Joi.string().allow('')
});

const updateCategorySchema = Joi.object({
    name: Joi.string().messages({ 'string.empty': 'Category name cannot be empty' }),
    description: Joi.string().allow('')
}).min(1); // require at least one field to update

module.exports = { createCategorySchema, updateCategorySchema };
