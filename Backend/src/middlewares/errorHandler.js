const ApiError = require('../utils/ApiError');
const log = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
    if (!(err instanceof ApiError)) {
        err = ApiError.internal(err.message || 'Internal server error');
    }

    log.error(`Error on ${req.method} ${req.originalUrl}: ${err.message}`);
    if (process.env.NODE_ENV === 'dev') {
        log.error(err.stack);
    }

    res.status(err.status||500).json({
        success: false,
        status: err.status||500,
        message: err.message || 'Something went wrong',
        ...(process.env.NODE_ENV === 'dev' && { stack: err.stack }),
    });
};

module.exports = errorHandler;
