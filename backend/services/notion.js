const { Client } = require('@notionhq/client');

class NotionService {
    constructor() {
        this.notionToken = process.env.NOTION_TOKEN;
        this.databaseId = process.env.NOTION_DATABASE_ID;
        
        if (!this.notionToken || this.notionToken === 'your_secret_token_here') {
            console.warn('⚠️  NOTION_TOKEN not configured. Notion features will be disabled.');
            this.isConfigured = false;
            return;
        }

        if (!this.databaseId || this.databaseId === 'your_blog_database_id_here') {
            console.warn('⚠️  NOTION_DATABASE_ID not configured. Notion features will be disabled.');
            this.isConfigured = false;
            return;
        }

        this.notion = new Client({
            auth: this.notionToken,
        });

        this.isConfigured = true;
        console.log('✅ Notion API initialized successfully');
    }

    /**
     * Check if Notion is properly configured
     */
    checkConfiguration() {
        if (!this.isConfigured) {
            return {
                success: false,
                error: 'Notion API is not configured. Please set NOTION_TOKEN and NOTION_DATABASE_ID in .env file.'
            };
        }
        return { success: true };
    }

    /**
     * Create a new page/post in Notion database
     * @param {Object} postData - Post data
     * @param {string} postData.title - Post title
     * @param {string} postData.content - Post content (optional)
     * @param {string} postData.status - Post status (Draft, In Progress, Published)
     * @param {Array} postData.tags - Array of tags (optional)
     * @param {string} postData.author - Author name (optional)
     * @returns {Promise<Object>} Created page data
     */
    async createPost(postData) {
        const configCheck = this.checkConfiguration();
        if (!configCheck.success) {
            return configCheck;
        }

        try {
            const { title, content, status = 'Draft', tags = [], author } = postData;

            if (!title) {
                return {
                    success: false,
                    error: 'Title is required to create a post'
                };
            }

            // Prepare properties for the new page
            const properties = {
                // Title property (assuming the database has a "Name" or "Title" property)
                'Name': {
                    title: [
                        {
                            text: {
                                content: title
                            }
                        }
                    ]
                }
            };

            // Add status if the database has a Status property
            if (status) {
                properties['Status'] = {
                    select: {
                        name: status
                    }
                };
            }

            // Add tags if the database has a Tags property
            if (tags && tags.length > 0) {
                properties['Tags'] = {
                    multi_select: tags.map(tag => ({ name: tag }))
                };
            }

            // Add author if provided
            if (author) {
                properties['Author'] = {
                    rich_text: [
                        {
                            text: {
                                content: author
                            }
                        }
                    ]
                };
            }

            // Prepare children (content blocks)
            const children = [];
            
            if (content) {
                // Split content by newlines and create paragraph blocks
                const paragraphs = content.split('\n').filter(p => p.trim());
                
                paragraphs.forEach(paragraph => {
                    children.push({
                        object: 'block',
                        type: 'paragraph',
                        paragraph: {
                            rich_text: [
                                {
                                    type: 'text',
                                    text: {
                                        content: paragraph
                                    }
                                }
                            ]
                        }
                    });
                });
            }

            // Create the page
            const response = await this.notion.pages.create({
                parent: {
                    database_id: this.databaseId
                },
                properties: properties,
                children: children.length > 0 ? children : undefined
            });

            console.log(`✅ Notion post created: ${title}`);

            return {
                success: true,
                data: {
                    id: response.id,
                    url: response.url,
                    title: title,
                    createdTime: response.created_time,
                    lastEditedTime: response.last_edited_time
                }
            };

        } catch (error) {
            console.error('❌ Error creating Notion post:', error.message);
            
            return {
                success: false,
                error: this.normalizeError(error),
                details: error.message
            };
        }
    }

    /**
     * List/Read existing posts from Notion database
     * @param {Object} options - Query options
     * @param {number} options.pageSize - Number of results per page (max 100)
     * @param {string} options.startCursor - Pagination cursor
     * @param {Object} options.filter - Notion filter object
     * @param {Array} options.sorts - Notion sort array
     * @returns {Promise<Object>} List of posts
     */
    async listPosts(options = {}) {
        const configCheck = this.checkConfiguration();
        if (!configCheck.success) {
            return configCheck;
        }

        try {
            const {
                pageSize = 10,
                startCursor,
                filter,
                sorts = [{ timestamp: 'created_time', direction: 'descending' }]
            } = options;

            const queryOptions = {
                database_id: this.databaseId,
                page_size: Math.min(pageSize, 100),
                sorts: sorts
            };

            if (startCursor) {
                queryOptions.start_cursor = startCursor;
            }

            if (filter) {
                queryOptions.filter = filter;
            }

            const response = await this.notion.databases.query(queryOptions);

            // Parse the results to extract relevant information
            const posts = response.results.map(page => {
                const properties = page.properties;
                
                return {
                    id: page.id,
                    url: page.url,
                    createdTime: page.created_time,
                    lastEditedTime: page.last_edited_time,
                    title: this.extractTitle(properties),
                    status: this.extractSelect(properties, 'Status'),
                    tags: this.extractMultiSelect(properties, 'Tags'),
                    author: this.extractRichText(properties, 'Author'),
                    properties: properties
                };
            });

            return {
                success: true,
                data: {
                    posts: posts,
                    hasMore: response.has_more,
                    nextCursor: response.next_cursor,
                    total: posts.length
                }
            };

        } catch (error) {
            console.error('❌ Error listing Notion posts:', error.message);
            
            return {
                success: false,
                error: this.normalizeError(error),
                details: error.message
            };
        }
    }

    /**
     * Get a specific post by ID
     * @param {string} pageId - Notion page ID
     * @returns {Promise<Object>} Post data with content
     */
    async getPost(pageId) {
        const configCheck = this.checkConfiguration();
        if (!configCheck.success) {
            return configCheck;
        }

        try {
            // Get page properties
            const page = await this.notion.pages.retrieve({ page_id: pageId });

            // Get page content blocks
            const blocks = await this.notion.blocks.children.list({
                block_id: pageId,
                page_size: 100
            });

            const properties = page.properties;

            return {
                success: true,
                data: {
                    id: page.id,
                    url: page.url,
                    createdTime: page.created_time,
                    lastEditedTime: page.last_edited_time,
                    title: this.extractTitle(properties),
                    status: this.extractSelect(properties, 'Status'),
                    tags: this.extractMultiSelect(properties, 'Tags'),
                    author: this.extractRichText(properties, 'Author'),
                    content: this.extractBlockContent(blocks.results),
                    blocks: blocks.results
                }
            };

        } catch (error) {
            console.error('❌ Error getting Notion post:', error.message);
            
            return {
                success: false,
                error: this.normalizeError(error),
                details: error.message
            };
        }
    }

    /**
     * Update an existing post
     * @param {string} pageId - Notion page ID
     * @param {Object} updates - Updates to apply
     * @returns {Promise<Object>} Updated page data
     */
    async updatePost(pageId, updates) {
        const configCheck = this.checkConfiguration();
        if (!configCheck.success) {
            return configCheck;
        }

        try {
            const properties = {};

            if (updates.title) {
                properties['Name'] = {
                    title: [{ text: { content: updates.title } }]
                };
            }

            if (updates.status) {
                properties['Status'] = {
                    select: { name: updates.status }
                };
            }

            if (updates.tags) {
                properties['Tags'] = {
                    multi_select: updates.tags.map(tag => ({ name: tag }))
                };
            }

            if (updates.author) {
                properties['Author'] = {
                    rich_text: [{ text: { content: updates.author } }]
                };
            }

            const response = await this.notion.pages.update({
                page_id: pageId,
                properties: properties
            });

            console.log(`✅ Notion post updated: ${pageId}`);

            return {
                success: true,
                data: {
                    id: response.id,
                    url: response.url,
                    lastEditedTime: response.last_edited_time
                }
            };

        } catch (error) {
            console.error('❌ Error updating Notion post:', error.message);
            
            return {
                success: false,
                error: this.normalizeError(error),
                details: error.message
            };
        }
    }

    /**
     * Delete a post (archive it in Notion)
     * @param {string} pageId - Notion page ID
     * @returns {Promise<Object>} Result
     */
    async deletePost(pageId) {
        const configCheck = this.checkConfiguration();
        if (!configCheck.success) {
            return configCheck;
        }

        try {
            const response = await this.notion.pages.update({
                page_id: pageId,
                archived: true
            });

            console.log(`✅ Notion post archived: ${pageId}`);

            return {
                success: true,
                data: {
                    id: response.id,
                    archived: response.archived
                }
            };

        } catch (error) {
            console.error('❌ Error deleting Notion post:', error.message);
            
            return {
                success: false,
                error: this.normalizeError(error),
                details: error.message
            };
        }
    }

    /**
     * Get database information
     * @returns {Promise<Object>} Database metadata
     */
    async getDatabaseInfo() {
        const configCheck = this.checkConfiguration();
        if (!configCheck.success) {
            return configCheck;
        }

        try {
            const database = await this.notion.databases.retrieve({
                database_id: this.databaseId
            });

            return {
                success: true,
                data: {
                    id: database.id,
                    title: database.title[0]?.plain_text || 'Untitled',
                    url: database.url,
                    createdTime: database.created_time,
                    lastEditedTime: database.last_edited_time,
                    properties: Object.keys(database.properties)
                }
            };

        } catch (error) {
            console.error('❌ Error getting database info:', error.message);
            
            return {
                success: false,
                error: this.normalizeError(error),
                details: error.message
            };
        }
    }

    // Helper methods for extracting data from Notion properties

    extractTitle(properties) {
        const titleProp = properties.Name || properties.Title || properties.title;
        if (titleProp && titleProp.title && titleProp.title[0]) {
            return titleProp.title[0].plain_text;
        }
        return 'Untitled';
    }

    extractRichText(properties, propertyName) {
        const prop = properties[propertyName];
        if (prop && prop.rich_text && prop.rich_text[0]) {
            return prop.rich_text[0].plain_text;
        }
        return '';
    }

    extractSelect(properties, propertyName) {
        const prop = properties[propertyName];
        if (prop && prop.select) {
            return prop.select.name;
        }
        return null;
    }

    extractMultiSelect(properties, propertyName) {
        const prop = properties[propertyName];
        if (prop && prop.multi_select) {
            return prop.multi_select.map(item => item.name);
        }
        return [];
    }

    extractBlockContent(blocks) {
        return blocks.map(block => {
            const type = block.type;
            const content = block[type];
            
            if (content.rich_text) {
                return content.rich_text.map(rt => rt.plain_text).join('');
            }
            
            return '';
        }).filter(text => text).join('\n');
    }

    /**
     * Normalize API errors
     * @param {Error} error - Error object
     * @returns {string} Normalized error message
     */
    normalizeError(error) {
        if (error.code === 'unauthorized') {
            return 'Unauthorized - Invalid Notion token';
        } else if (error.code === 'object_not_found') {
            return 'Database or page not found - Check your NOTION_DATABASE_ID';
        } else if (error.code === 'validation_error') {
            return 'Validation error - Check your data format';
        } else if (error.code === 'rate_limited') {
            return 'Rate limited - Too many requests';
        }
        
        return error.message || 'Unknown error occurred';
    }
}

// Create and export singleton instance
module.exports = new NotionService();
