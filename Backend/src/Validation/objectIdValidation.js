const joi = require('joi');
// :id validator for params in routes
const objIdSchema = joi.object({
    id: joi.string().hex().length(24).required().messages({
        'string.length': 'Invalid ID length',
        'string.hex': 'ID must be a valid hexadecimal',
        'any.required': 'ID is required'
    })
});


//id validator for joi schema
const objectIdValidator = joi.string().hex().length(24).messages({
    'string.length': 'Invalid ID length',
    'string.hex': 'ID must be a valid hexadecimal',
    'any.required': 'ID is required'
});
module.exports = { objIdSchema, objectIdValidator };