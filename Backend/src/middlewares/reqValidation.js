const ApiError = require('../utils/ApiError');

const validate = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            const details = error.details.map((detail) => detail.message).join(', ');
            return next(ApiError.badRequest(details));
        }
        next();
    };
};

module.exports = validate;