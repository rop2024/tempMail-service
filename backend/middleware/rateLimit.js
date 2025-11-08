const rateLimit = require('express-rate-limit');

/**
 * General API rate limiter
 */
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
        success: false,
        error: 'Too many requests from this IP, please try again after 15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * Strict rate limiter for account creation
 */
const accountCreationLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // Limit each IP to 5 account creations per hour
    message: {
        success: false,
        error: 'Too many accounts created from this IP, please try again after an hour'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * Rate limiter for message fetching
 */
const messageLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 30, // Limit each IP to 30 message requests per minute
    message: {
        success: false,
        error: 'Too many message requests, please slow down'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = {
    generalLimiter,
    accountCreationLimiter,
    messageLimiter
};