const express = require('express');
const router = express.Router();
const mailTMService = require('../services/mailtm');
const {
    validateAccountCreation,
    validateEmailParam,
    validateMessageId,
    sanitizeInput
} = require('../middleware/validation');
const {
    accountCreationLimiter,
    messageLimiter
} = require('../middleware/rateLimit');

/**
 * @route   POST /api/email/generate
 * @desc    Generate a new temporary email account
 * @access  Public
 */
router.post('/generate', 
    accountCreationLimiter,
    validateAccountCreation,
    sanitizeInput,
    async (req, res) => {
        try {
            const { address, password } = req.body;

            const result = await mailTMService.createAccount(address, password);

            if (result.success) {
                res.status(201).json({
                    success: true,
                    data: result.data,
                    message: 'Email account created successfully'
                });
            } else {
                res.status(400).json({
                    success: false,
                    error: result.error,
                    details: result.details
                });
            }

        } catch (error) {
            console.error('Error in /generate endpoint:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error during account creation'
            });
        }
    }
);

/**
 * @route   GET /api/email/:address/inbox
 * @desc    Get inbox messages for a specific email address
 * @access  Public
 */
router.get('/:address/inbox',
    messageLimiter,
    validateEmailParam,
    sanitizeInput,
    async (req, res) => {
        try {
            const { address } = req.params;
            
            // Find account by address
            const accounts = Array.from(mailTMService.accounts.values());
            const account = accounts.find(acc => acc.address === address);
            
            if (!account) {
                return res.status(404).json({
                    success: false,
                    error: 'Email account not found. Please create an account first.'
                });
            }

            const result = await mailTMService.fetchMessagesForAddress(account.id);

            if (result.success) {
                res.json({
                    success: true,
                    data: {
                        address: account.address,
                        messages: result.data,
                        total: result.pagination.total,
                        unread: result.data.filter(msg => !msg.seen).length
                    }
                });
            } else {
                res.status(400).json({
                    success: false,
                    error: result.error,
                    details: result.details
                });
            }

        } catch (error) {
            console.error('Error in /inbox endpoint:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error while fetching inbox'
            });
        }
    }
);

/**
 * @route   GET /api/email/:address/message/:id
 * @desc    Get a specific message by ID
 * @access  Public
 */
router.get('/:address/message/:id',
    messageLimiter,
    validateEmailParam,
    sanitizeInput,
    async (req, res) => {
        try {
            const { address, id } = req.params;
            
            // Find account by address
            const accounts = Array.from(mailTMService.accounts.values());
            const account = accounts.find(acc => acc.address === address);
            
            if (!account) {
                return res.status(404).json({
                    success: false,
                    error: 'Email account not found'
                });
            }

            const result = await mailTMService.fetchMessageById(account.id, id);

            if (result.success) {
                res.json({
                    success: true,
                    data: {
                        address: account.address,
                        message: result.data
                    }
                });
            } else {
                res.status(404).json({
                    success: false,
                    error: result.error,
                    details: result.details
                });
            }

        } catch (error) {
            console.error('Error in /message endpoint:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error while fetching message'
            });
        }
    }
);

/**
 * @route   DELETE /api/email/:address
 * @desc    Delete an email account
 * @access  Public
 */
router.delete('/:address',
    validateEmailParam,
    sanitizeInput,
    async (req, res) => {
        try {
            const { address } = req.params;
            
            // Find account by address
            const accounts = Array.from(mailTMService.accounts.values());
            const account = accounts.find(acc => acc.address === address);
            
            if (!account) {
                return res.status(404).json({
                    success: false,
                    error: 'Email account not found'
                });
            }

            const result = await mailTMService.deleteAccount(account.id);

            if (result.success) {
                res.json({
                    success: true,
                    data: result.data,
                    message: 'Email account deleted successfully'
                });
            } else {
                res.status(400).json({
                    success: false,
                    error: result.error,
                    details: result.details
                });
            }

        } catch (error) {
            console.error('Error in DELETE endpoint:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error while deleting account'
            });
        }
    }
);

/**
 * @route   GET /api/email/:address/info
 * @desc    Get account information
 * @access  Public
 */
router.get('/:address/info',
    validateEmailParam,
    sanitizeInput,
    async (req, res) => {
        try {
            const { address } = req.params;
            
            // Find account by address
            const accounts = Array.from(mailTMService.accounts.values());
            const account = accounts.find(acc => acc.address === address);
            
            if (!account) {
                return res.status(404).json({
                    success: false,
                    error: 'Email account not found'
                });
            }

            const result = await mailTMService.getAccountInfo(account.id);

            if (result.success) {
                res.json({
                    success: true,
                    data: {
                        address: account.address,
                        info: result.data,
                        createdAt: account.createdAt,
                        lastAccessed: account.lastAccessed
                    }
                });
            } else {
                res.status(400).json({
                    success: false,
                    error: result.error,
                    details: result.details
                });
            }

        } catch (error) {
            console.error('Error in /info endpoint:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error while fetching account info'
            });
        }
    }
);

module.exports = router;