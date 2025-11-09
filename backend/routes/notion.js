const express = require('express');
const router = express.Router();
const notionService = require('../services/notion');
const { sanitizeInput } = require('../middleware/validation');
const { generalLimiter } = require('../middleware/rateLimit');

/**
 * @route   GET /api/notion/health
 * @desc    Check Notion API configuration status
 * @access  Public
 */
router.get('/health', async (req, res) => {
    try {
        const configCheck = notionService.checkConfiguration();
        
        if (!configCheck.success) {
            return res.status(503).json({
                success: false,
                configured: false,
                error: configCheck.error
            });
        }

        const dbInfo = await notionService.getDatabaseInfo();
        
        if (dbInfo.success) {
            res.json({
                success: true,
                configured: true,
                database: dbInfo.data
            });
        } else {
            res.status(503).json({
                success: false,
                configured: true,
                error: dbInfo.error,
                details: dbInfo.details
            });
        }

    } catch (error) {
        console.error('Error in /health endpoint:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

/**
 * @route   POST /api/notion/posts
 * @desc    Create a new post in Notion
 * @access  Public
 */
router.post('/posts',
    generalLimiter,
    sanitizeInput,
    async (req, res) => {
        try {
            const { title, content, status, tags, author } = req.body;

            if (!title) {
                return res.status(400).json({
                    success: false,
                    error: 'Title is required'
                });
            }

            const result = await notionService.createPost({
                title,
                content,
                status,
                tags,
                author
            });

            if (result.success) {
                res.status(201).json({
                    success: true,
                    data: result.data,
                    message: 'Post created successfully'
                });
            } else {
                res.status(400).json({
                    success: false,
                    error: result.error,
                    details: result.details
                });
            }

        } catch (error) {
            console.error('Error in POST /posts endpoint:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error while creating post'
            });
        }
    }
);

/**
 * @route   GET /api/notion/posts
 * @desc    List all posts from Notion
 * @access  Public
 */
router.get('/posts',
    generalLimiter,
    async (req, res) => {
        try {
            const { 
                pageSize = 10, 
                cursor, 
                status,
                sortBy = 'created_time',
                sortDirection = 'descending'
            } = req.query;

            // Build filter if status is provided
            let filter = null;
            if (status) {
                filter = {
                    property: 'Status',
                    select: {
                        equals: status
                    }
                };
            }

            // Build sort
            const sorts = [{
                timestamp: sortBy,
                direction: sortDirection
            }];

            const result = await notionService.listPosts({
                pageSize: parseInt(pageSize),
                startCursor: cursor,
                filter,
                sorts
            });

            if (result.success) {
                res.json({
                    success: true,
                    data: result.data,
                    pagination: {
                        hasMore: result.data.hasMore,
                        nextCursor: result.data.nextCursor
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
            console.error('Error in GET /posts endpoint:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error while fetching posts'
            });
        }
    }
);

/**
 * @route   GET /api/notion/posts/:pageId
 * @desc    Get a specific post by ID
 * @access  Public
 */
router.get('/posts/:pageId',
    generalLimiter,
    async (req, res) => {
        try {
            const { pageId } = req.params;

            const result = await notionService.getPost(pageId);

            if (result.success) {
                res.json({
                    success: true,
                    data: result.data
                });
            } else {
                res.status(404).json({
                    success: false,
                    error: result.error,
                    details: result.details
                });
            }

        } catch (error) {
            console.error('Error in GET /posts/:pageId endpoint:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error while fetching post'
            });
        }
    }
);

/**
 * @route   PUT /api/notion/posts/:pageId
 * @desc    Update an existing post
 * @access  Public
 */
router.put('/posts/:pageId',
    generalLimiter,
    sanitizeInput,
    async (req, res) => {
        try {
            const { pageId } = req.params;
            const updates = req.body;

            const result = await notionService.updatePost(pageId, updates);

            if (result.success) {
                res.json({
                    success: true,
                    data: result.data,
                    message: 'Post updated successfully'
                });
            } else {
                res.status(400).json({
                    success: false,
                    error: result.error,
                    details: result.details
                });
            }

        } catch (error) {
            console.error('Error in PUT /posts/:pageId endpoint:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error while updating post'
            });
        }
    }
);

/**
 * @route   DELETE /api/notion/posts/:pageId
 * @desc    Delete (archive) a post
 * @access  Public
 */
router.delete('/posts/:pageId',
    generalLimiter,
    async (req, res) => {
        try {
            const { pageId } = req.params;

            const result = await notionService.deletePost(pageId);

            if (result.success) {
                res.json({
                    success: true,
                    data: result.data,
                    message: 'Post deleted successfully'
                });
            } else {
                res.status(400).json({
                    success: false,
                    error: result.error,
                    details: result.details
                });
            }

        } catch (error) {
            console.error('Error in DELETE /posts/:pageId endpoint:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error while deleting post'
            });
        }
    }
);

/**
 * @route   GET /api/notion/database
 * @desc    Get database information
 * @access  Public
 */
router.get('/database',
    generalLimiter,
    async (req, res) => {
        try {
            const result = await notionService.getDatabaseInfo();

            if (result.success) {
                res.json({
                    success: true,
                    data: result.data
                });
            } else {
                res.status(400).json({
                    success: false,
                    error: result.error,
                    details: result.details
                });
            }

        } catch (error) {
            console.error('Error in GET /database endpoint:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error while fetching database info'
            });
        }
    }
);

module.exports = router;
