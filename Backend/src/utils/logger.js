const { createLogger, format, transports } = require('winston');

const logFormat = format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.printf(({ level, message, timestamp }) => `${timestamp} [${level.toUpperCase()}]: ${message}`)
);

const logger = createLogger({
    level: 'info',
    format: logFormat,
    transports: [
        new transports.File({ filename: 'logs/logs.log'}),
    ],
});

// Show logs in console during development
if (process.env.NODE_ENV === 'dev') {
    logger.add(
        new transports.Console({
            format: format.combine(format.colorize(), format.simple()),
        })
    );
}

module.exports = logger;
