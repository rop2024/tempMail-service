// API configuration
const API_BASE_URL = '/api';

// Cache for requests to avoid duplicates
const requestCache = new Map();
const CACHE_DURATION = 5000; // 5 seconds

/**
 * Generic fetch wrapper with enhanced error handling and caching
 * @param {string} endpoint - API endpoint
 * @param {Object} options - Fetch options
 * @param {boolean} useCache - Whether to use request caching
 * @returns {Promise<Object>} Response data
 */
async function fetchAPI(endpoint, options = {}, useCache = false) {
    const url = `${API_BASE_URL}${endpoint}`;
    const cacheKey = `${options.method || 'GET'}:${url}`;

    // Check cache for GET requests
    if (useCache && (options.method === 'GET' || !options.method)) {
        const cached = requestCache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
            return cached.data;
        }
    }

    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        ...options,
    };

    // Add timeout to fetch requests
    const timeout = 30000; // 30 seconds
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    config.signal = controller.signal;

    try {
        const response = await fetch(url, config);
        clearTimeout(timeoutId);

        // Handle HTTP errors
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({
                error: `HTTP ${response.status}: ${response.statusText}`
            }));
            
            throw new Error(errorData.error || `HTTP ${response.status}`);
        }

        const data = await response.json();
        
        // Handle API-level errors
        if (!data.success) {
            throw new Error(data.error || 'API request failed');
        }

        // Cache successful GET responses
        if (useCache && (options.method === 'GET' || !options.method)) {
            requestCache.set(cacheKey, {
                data,
                timestamp: Date.now()
            });
        }

        return data;

    } catch (error) {
        clearTimeout(timeoutId);
        
        // Handle specific error types
        if (error.name === 'AbortError') {
            throw new Error('Request timeout - please try again');
        } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
            throw new Error('Network error - please check your connection');
        }
        
        throw error;
    }
}

/**
 * Generate a new temporary email account
 * @param {string} address - Email address
 * @param {string} password - Account password
 * @returns {Promise<Object>} Account data
 */
export async function generateEmail(address, password) {
    try {
        const data = await fetchAPI('/email/generate', {
            method: 'POST',
            body: JSON.stringify({ address, password }),
        });

        return {
            success: true,
            data: data.data,
            message: data.message || 'Email account created successfully'
        };

    } catch (error) {
        console.error('Error generating email:', error);
        return {
            success: false,
            error: error.message,
            data: null
        };
    }
}

/**
 * Get inbox messages for a specific email address
 * @param {string} address - Email address
 * @param {boolean} forceRefresh - Bypass cache
 * @returns {Promise<Object>} Inbox data with messages
 */
export async function getInbox(address, forceRefresh = false) {
    try {
        if (!address || !address.includes('@')) {
            throw new Error('Valid email address is required');
        }

        const data = await fetchAPI(
            `/email/${encodeURIComponent(address)}/inbox`,
            {},
            !forceRefresh
        );

        return {
            success: true,
            data: data.data,
            messages: data.data?.messages || [],
            total: data.data?.total || 0,
            unread: data.data?.unread || 0,
            lastUpdated: new Date().toISOString()
        };

    } catch (error) {
        console.error('Error fetching inbox:', error);
        return {
            success: false,
            error: error.message,
            messages: [],
            total: 0,
            unread: 0,
            lastUpdated: new Date().toISOString()
        };
    }
}

/**
 * Get a specific message by ID
 * @param {string} address - Email address
 * @param {string} messageId - Message ID
 * @returns {Promise<Object>} Message data
 */
export async function getMessage(address, messageId) {
    try {
        if (!address || !address.includes('@')) {
            throw new Error('Valid email address is required');
        }

        if (!messageId) {
            throw new Error('Message ID is required');
        }

        const data = await fetchAPI(`/email/${encodeURIComponent(address)}/message/${encodeURIComponent(messageId)}`);

        return {
            success: true,
            data: data.data,
            message: data.data?.message
        };

    } catch (error) {
        console.error('Error fetching message:', error);
        return {
            success: false,
            error: error.message,
            message: null
        };
    }
}

/**
 * Delete an email account
 * @param {string} address - Email address
 * @returns {Promise<Object>} Deletion result
 */
export async function deleteAddress(address) {
    try {
        if (!address || !address.includes('@')) {
            throw new Error('Valid email address is required');
        }

        const data = await fetchAPI(`/email/${encodeURIComponent(address)}`, {
            method: 'DELETE',
        });

        return {
            success: true,
            data: data.data,
            message: data.message || 'Email account deleted successfully'
        };

    } catch (error) {
        console.error('Error deleting address:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Get available domains from Mail.tm
 * @returns {Promise<Object>} List of domains
 */
export async function getDomains() {
    try {
        const data = await fetchAPI('/email/domains', {}, true); // Cache domains

        return {
            success: true,
            domains: data.domains || [],
            total: data.total || 0
        };

    } catch (error) {
        console.error('Error fetching domains:', error);
        return {
            success: false,
            error: error.message,
            domains: [],
            total: 0
        };
    }
}

/**
 * Get account information
 * @param {string} address - Email address
 * @returns {Promise<Object>} Account information
 */
export async function getAccountInfo(address) {
    try {
        if (!address || !address.includes('@')) {
            throw new Error('Valid email address is required');
        }

        const data = await fetchAPI(`/email/${encodeURIComponent(address)}/info`);

        return {
            success: true,
            data: data.data,
            account: data.data?.info,
            createdAt: data.data?.createdAt,
            lastAccessed: data.data?.lastAccessed
        };

    } catch (error) {
        console.error('Error fetching account info:', error);
        return {
            success: false,
            error: error.message,
            account: null
        };
    }
}

/**
 * Download an attachment from a specific message
 * @param {string} address - Email address
 * @param {string} messageId - Message ID
 * @param {string} attachmentId - Attachment ID
 * @param {string} filename - Suggested filename
 * @returns {Promise<Object>} Download result
 */
export async function downloadAttachment(address, messageId, attachmentId, filename = 'attachment') {
    try {
        if (!address || !address.includes('@')) {
            throw new Error('Valid email address is required');
        }

        if (!messageId) {
            throw new Error('Message ID is required');
        }

        if (!attachmentId) {
            throw new Error('Attachment ID is required');
        }

        const response = await fetch(`${API_BASE_URL}/email/${encodeURIComponent(address)}/message/${encodeURIComponent(messageId)}/attachment/${encodeURIComponent(attachmentId)}`);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
            throw new Error(errorData.error || `Download failed: ${response.status}`);
        }

        // Create blob from response
        const blob = await response.blob();

        // Create download link
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        return {
            success: true,
            message: 'Attachment downloaded successfully'
        };

    } catch (error) {
        console.error('Error downloading attachment:', error);
        return {
            success: false,
            error: error.message
        };
    }
}
export async function checkAccountStatus(address) {
    try {
        if (!address || !address.includes('@')) {
            throw new Error('Valid email address is required');
        }

        const data = await fetchAPI(`/email/${encodeURIComponent(address)}/info`);

        return {
            success: true,
            data: data.data,
            isValid: true
        };

    } catch (error) {
        // Check for specific error codes
        if (error.message.includes('deleted') || error.message.includes('not found')) {
            return {
                success: false,
                error: error.message,
                isValid: false,
                code: 'ACCOUNT_INVALID'
            };
        }

        return {
            success: false,
            error: error.message,
            isValid: false
        };
    }
}

// Clear cache utility
export function clearAPICache() {
    requestCache.clear();
}

// ===============================
// NOTION API FUNCTIONS
// ===============================

/**
 * Get Notion API health status
 * @returns {Promise<Object>} Health status
 */
export async function getNotionHealth() {
    try {
        const data = await fetchAPI('/notion/health');
        return {
            success: true,
            data: data.data,
            configured: data.data?.configured || false
        };
    } catch (error) {
        console.error('Error checking Notion health:', error);
        return {
            success: false,
            error: error.message,
            configured: false
        };
    }
}

/**
 * Get Notion database information
 * @returns {Promise<Object>} Database info
 */
export async function getNotionDatabaseInfo() {
    try {
        const data = await fetchAPI('/notion/database');
        return {
            success: true,
            data: data.data
        };
    } catch (error) {
        console.error('Error fetching Notion database info:', error);
        return {
            success: false,
            error: error.message,
            data: null
        };
    }
}

/**
 * Get list of Notion blog posts
 * @param {Object} options - Query options
 * @param {number} options.pageSize - Number of posts per page
 * @param {string} options.status - Filter by status (Published, Draft, etc.)
 * @param {string} options.sortBy - Sort field (created_time, last_edited_time, title)
 * @param {string} options.sortDirection - Sort direction (ascending, descending)
 * @returns {Promise<Object>} List of posts
 */
export async function getNotionPosts(options = {}) {
    try {
        const params = new URLSearchParams();
        
        if (options.pageSize) params.append('pageSize', options.pageSize);
        if (options.status) params.append('status', options.status);
        if (options.sortBy) params.append('sortBy', options.sortBy);
        if (options.sortDirection) params.append('sortDirection', options.sortDirection);

        const queryString = params.toString();
        const endpoint = `/notion/posts${queryString ? '?' + queryString : ''}`;
        
        const data = await fetchAPI(endpoint);
        return {
            success: true,
            data: data.data
        };
    } catch (error) {
        console.error('Error fetching Notion posts:', error);
        return {
            success: false,
            error: error.message,
            data: { posts: [], total: 0 }
        };
    }
}

/**
 * Get a specific Notion post by ID
 * @param {string} pageId - Notion page ID
 * @returns {Promise<Object>} Post data
 */
export async function getNotionPost(pageId) {
    try {
        if (!pageId) {
            throw new Error('Page ID is required');
        }

        const data = await fetchAPI(`/notion/posts/${encodeURIComponent(pageId)}`);
        return {
            success: true,
            data: data.data
        };
    } catch (error) {
        console.error('Error fetching Notion post:', error);
        return {
            success: false,
            error: error.message,
            data: null
        };
    }
}

/**
 * Create a new Notion blog post
 * @param {Object} postData - Post data
 * @param {string} postData.title - Post title
 * @param {string} postData.content - Post content
 * @param {string} postData.status - Post status
 * @param {Array} postData.tags - Post tags
 * @param {string} postData.author - Author name
 * @returns {Promise<Object>} Created post data
 */
export async function createNotionPost(postData) {
    try {
        if (!postData.title) {
            throw new Error('Post title is required');
        }

        const data = await fetchAPI('/notion/posts', {
            method: 'POST',
            body: JSON.stringify(postData)
        });

        return {
            success: true,
            data: data.data,
            message: data.message || 'Post created successfully'
        };
    } catch (error) {
        console.error('Error creating Notion post:', error);
        return {
            success: false,
            error: error.message,
            data: null
        };
    }
}

/**
 * Update a Notion blog post
 * @param {string} pageId - Notion page ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated post data
 */
export async function updateNotionPost(pageId, updates) {
    try {
        if (!pageId) {
            throw new Error('Page ID is required');
        }

        const data = await fetchAPI(`/notion/posts/${encodeURIComponent(pageId)}`, {
            method: 'PUT',
            body: JSON.stringify(updates)
        });

        return {
            success: true,
            data: data.data,
            message: data.message || 'Post updated successfully'
        };
    } catch (error) {
        console.error('Error updating Notion post:', error);
        return {
            success: false,
            error: error.message,
            data: null
        };
    }
}

/**
 * Delete a Notion blog post (archives it)
 * @param {string} pageId - Notion page ID
 * @returns {Promise<Object>} Deletion result
 */
export async function deleteNotionPost(pageId) {
    try {
        if (!pageId) {
            throw new Error('Page ID is required');
        }

        const data = await fetchAPI(`/notion/posts/${encodeURIComponent(pageId)}`, {
            method: 'DELETE'
        });

        return {
            success: true,
            data: data.data,
            message: data.message || 'Post deleted successfully'
        };
    } catch (error) {
        console.error('Error deleting Notion post:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// Export the base fetch function for custom requests
export { fetchAPI };