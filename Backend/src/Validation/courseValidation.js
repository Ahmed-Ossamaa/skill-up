const Joi = require('joi');

const courseSchema = Joi.object({
    title: Joi.string().required().messages({
        'string.empty': 'Title cannot be empty',
        'any.required': 'Title is required'
    }),
    description: Joi.string().required().messages({
        'string.empty': 'Description cannot be empty',
        'any.required': 'Description is required'
    }),
    thumbnail: Joi.string().uri().optional().messages({
        'string.uri': 'Thumbnail must be a valid URL'
    }),
    price: Joi.number().min(0).optional().messages({
        'number.min': 'Price cannot be negative'
    }),
    discount: Joi.number().min(0).optional().messages({
        'number.min': 'Discount cannot be negative'
    }),
    requirements: Joi.array().items(Joi.string()).optional(),
    learningOutcomes: Joi.array().items(Joi.string()).optional(),
    targetAudience: Joi.array().items(Joi.string()).optional(),
    language: Joi.string().optional(),
    level: Joi.string().valid('beginner', 'intermediate', 'advanced, all levels').optional(),
    status: Joi.string().valid('draft', 'published', 'archived').optional(),
    category: Joi.string().optional()
});

const updateCourseSchema = Joi.object({
    title: Joi.string().optional(),
    description: Joi.string().optional(),
    thumbnail: Joi.string().uri().optional(),
    price: Joi.number().min(0).optional(),
    discount: Joi.number().min(0).optional(),
    requirements: Joi.array().items(Joi.string()).optional(),
    learningOutcomes: Joi.array().items(Joi.string()).optional(),
    targetAudience: Joi.array().items(Joi.string()).optional(),
    language: Joi.string().optional(),
    level: Joi.string().valid('beginner', 'intermediate', 'advanced, all levels').optional(),
    status: Joi.string().valid('draft', 'published').optional(),
    category: Joi.string().optional()
});


const courseFilterSchema = Joi.object({
    page: Joi.number().min(1).default(1),
    limit: Joi.number().min(1).default(10),
    level: Joi.string().valid('beginner', 'intermediate', 'advanced, all levels'),
    category: Joi.string().hex().length(24), // ObjectId
    priceMin: Joi.number().min(0),
    priceMax: Joi.number().min(0),
    instructor: Joi.string().hex().length(24) // ObjectId
});
module.exports = { courseSchema, updateCourseSchema, courseFilterSchema };
