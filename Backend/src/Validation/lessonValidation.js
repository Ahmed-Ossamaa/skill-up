const Joi = require('joi');
const {objectIdValidator} = require('./objectIdValidation');

const createLessonSchema = Joi.object({
    title: Joi.string().required().messages({
        'string.empty': 'Title is required'
    }),
    description: Joi.string().allow(''),
    type: Joi.string().valid('video', 'raw', 'document').default('video'),
    video: Joi.object({ url: Joi.string().uri(), publicId: Joi.string() }),
    duration: Joi.number().min(1).messages({
        'number.base': 'Duration must be a number',
        'number.min': 'Duration must be positive'
    }),
    isPreview: Joi.boolean().default(false),
    resources: Joi.array().items(Joi.object({ url: Joi.string().uri(), publicId: Joi.string() })),
    duration: Joi.number().min(1).messages({
        'number.min': 'Duration must be positive'
    }),
    content: Joi.string().allow(''),
    createdBy: Joi.string().required().messages({
        'string.empty': 'InstructorId is required'
    }),
    section: Joi.string().required().messages({
        'string.empty':'CourseId is required'
    }),
    course: Joi.string().required().messages({
        'string.empty':'CourseId is required'
    })
});

const updateLessonSchema = Joi.object({
    title: Joi.string().messages({ 'string.empty': 'Title cannot be empty' }),
    description: Joi.string().allow(''),
    type: Joi.string().valid('video', 'raw', 'document'),
    video: Joi.object({ url: Joi.string().uri(), publicId: Joi.string() }).optional(),
    resources: Joi.array().items(Joi.object({ url: Joi.string().uri(), publicId: Joi.string() })).optional(),
    resourceFiles: Joi.any().optional(),
    isPreview: Joi.boolean(),
    duration: Joi.number().min(1).messages({
        'number.min': 'Duration must be positive'
    }),
    content: Joi.string().allow(''),
    course: Joi.string().optional(),
    createdBy: Joi.string().optional(),
    section:objectIdValidator.optional()
}).min(1); // at least one field required

module.exports = { createLessonSchema, updateLessonSchema };
