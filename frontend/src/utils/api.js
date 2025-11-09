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
        const data = await fetchAPI('/domains', {}, true); // Cache domains

        return {
            success: true,
            domains: data['hydra:member'] || [],
            total: data['hydra:totalItems'] || 0
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

// Export the base fetch function for custom requests
export { fetchAPI };