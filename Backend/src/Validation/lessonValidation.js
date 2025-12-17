const Joi = require('joi');
const {objectIdValidator} = require('./objectIdValidation');

const createLessonSchema = Joi.object({
    title: Joi.string().required().messages({
        'string.empty': 'Title is required'
    }),
    description: Joi.string().allow(''),
    type: Joi.string().valid('video', 'raw').default('video'),
    video: Joi.object({ url: Joi.string().uri(), publicId: Joi.string() }),
    duration: Joi.number().min(1).messages({
        'number.base': 'Duration must be a number',
        'number.min': 'Duration must be positive'
    }),
    isPreview: Joi.boolean().default(false),
    resources: Joi.string().allow(''),
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
    videoUrl: Joi.string().uri().messages({
        'string.uri': 'Video URL must be valid'
    }),
    duration: Joi.number().min(1).messages({
        'number.min': 'Duration must be positive'
    }),
    content: Joi.string().allow(''),
    course:Joi.forbidden(),
    section:objectIdValidator.optional()
}).min(1); // at least one field required

module.exports = { createLessonSchema, updateLessonSchema };
