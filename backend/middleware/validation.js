const validator = require('validator');

/**
 * Validate email address format
 */
const validateEmail = (email) => {
    return validator.isEmail(email) && email.includes('@');
};

/**
 * Validate password strength
 */
const validatePassword = (password) => {
    return password && password.length >= 6;
};

/**
 * Validate account creation input
 */
const validateAccountCreation = (req, res, next) => {
    const { address, password } = req.body;

    const errors = [];

    if (!address || !validateEmail(address)) {
        errors.push('Valid email address is required');
    }

    if (!password || !validatePassword(password)) {
        errors.push('Password must be at least 6 characters long');
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            error: 'Validation failed',
            details: errors
        });
    }

    next();
};

/**
 * Validate email address parameter
 */
const validateEmailParam = (req, res, next) => {
    const { address } = req.params;

    if (!address || !validateEmail(address)) {
        return res.status(400).json({
            success: false,
            error: 'Valid email address parameter is required'
        });
    }

    next();
};

/**
 * Validate message ID parameter (handles both 'id' and 'messageId' param names)
 */
const validateMessageIdParam = (req, res, next) => {
    const messageId = req.params.id || req.params.messageId;

    if (!messageId || !validator.isMongoId(messageId)) {
        return res.status(400).json({
            success: false,
            error: 'Valid message ID is required'
        });
    }

    next();
};

/**
 * Sanitize input data
 */
const sanitizeInput = (req, res, next) => {
    if (req.body) {
        Object.keys(req.body).forEach(key => {
            if (typeof req.body[key] === 'string') {
                req.body[key] = validator.escape(req.body[key].trim());
            }
        });
    }

    if (req.params) {
        Object.keys(req.params).forEach(key => {
            if (typeof req.params[key] === 'string') {
                req.params[key] = validator.escape(req.params[key].trim());
            }
        });
    }

    next();
};

module.exports = {
    validateEmail,
    validatePassword,
    validateAccountCreation,
    validateEmailParam,
    validateMessageId,
    validateMessageIdParam,
    sanitizeInput
};