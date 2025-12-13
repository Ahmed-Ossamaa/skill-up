const Joi = require('joi');
const {objectIdValidator} = require('./objectIdValidation');

const createLessonSchema = Joi.object({
    title: Joi.string().required().messages({
        'string.empty': 'Title is required'
    }),

    duration: Joi.number().min(1).messages({
        'number.base': 'Duration must be a number',
        'number.min': 'Duration must be positive'
    }),
    resources: Joi.array().items(Joi.object({ fileUrl: Joi.string().uri(), filePublicId: Joi.string() })),
    content: Joi.string().allow(''),
    // course: objectIdValidator.required(),
    section: objectIdValidator.required().messages({
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
