const axios = require('axios');

class MailTMService {
    constructor() {
        this.baseURL = process.env.MAILTM_BASE_URL || 'https://api.mail.tm';
        this.axiosInstance = axios.create({
            baseURL: this.baseURL,
            timeout: 10000,
        });
        
        // In-memory storage for accounts (in production, use Redis or database)
        this.accounts = new Map();
        
        // Clean up old accounts every hour
        setInterval(() => this.cleanupOldAccounts(), 60 * 60 * 1000);
    }

    /**
     * Create a new temporary email account
     * @param {string} address - Email address
     * @param {string} password - Password for the account
     * @returns {Promise<Object>} Account data
     */
    async createAccount(address, password) {
        try {
            // Step 1: Create the account
            const accountResponse = await this.axiosInstance.post('/accounts', {
                address,
                password
            });

            const accountData = accountResponse.data;

            // Step 2: Get token for the account
            const tokenResponse = await this.axiosInstance.post('/token', {
                address,
                password
            });

            const tokenData = tokenResponse.data;

            // Store account data in memory
            const accountInfo = {
                id: accountData.id,
                address: accountData.address,
                token: tokenData.token,
                createdAt: new Date(),
                lastAccessed: new Date()
            };

            this.accounts.set(accountData.id, accountInfo);

            return {
                success: true,
                data: {
                    id: accountData.id,
                    address: accountData.address,
                    token: tokenData.token,
                    quota: accountData.quota
                }
            };

        } catch (error) {
            console.error('Error creating account:', error.response?.data || error.message);
            
            return {
                success: false,
                error: this.normalizeError(error),
                details: error.response?.data || { message: error.message }
            };
        }
    }

    /**
     * Fetch messages for an email address
     * @param {string} accountId - Account ID
     * @returns {Promise<Object>} List of messages
     */
    async fetchMessagesForAddress(accountId) {
        try {
            const account = this.accounts.get(accountId);
            if (!account) {
                throw new Error('Account not found');
            }

            // Update last accessed time
            account.lastAccessed = new Date();

            const response = await this.axiosInstance.get('/messages', {
                headers: {
                    'Authorization': `Bearer ${account.token}`
                }
            });

            return {
                success: true,
                data: response.data['hydra:member'] || [],
                pagination: {
                    total: response.data['hydra:totalItems'] || 0
                }
            };

        } catch (error) {
            console.error('Error fetching messages:', error.response?.data || error.message);
            
            return {
                success: false,
                error: this.normalizeError(error),
                details: error.response?.data || { message: error.message }
            };
        }
    }

    /**
     * Fetch a specific message by ID
     * @param {string} accountId - Account ID
     * @param {string} messageId - Message ID
     * @returns {Promise<Object>} Message data
     */
    async fetchMessageById(accountId, messageId) {
        try {
            const account = this.accounts.get(accountId);
            if (!account) {
                throw new Error('Account not found');
            }

            // Update last accessed time
            account.lastAccessed = new Date();

            const response = await this.axiosInstance.get(`/messages/${messageId}`, {
                headers: {
                    'Authorization': `Bearer ${account.token}`
                }
            });

            return {
                success: true,
                data: response.data
            };

        } catch (error) {
            console.error('Error fetching message:', error.response?.data || error.message);
            
            return {
                success: false,
                error: this.normalizeError(error),
                details: error.response?.data || { message: error.message }
            };
        }
    }

    /**
     * Delete an email account
     * @param {string} accountId - Account ID
     * @returns {Promise<Object>} Deletion result
     */
    async deleteAccount(accountId) {
        try {
            const account = this.accounts.get(accountId);
            if (!account) {
                throw new Error('Account not found');
            }

            const response = await this.axiosInstance.delete(`/accounts/${accountId}`, {
                headers: {
                    'Authorization': `Bearer ${account.token}`
                }
            });

            // Remove from memory storage
            this.accounts.delete(accountId);

            return {
                success: true,
                data: { message: 'Account deleted successfully' }
            };

        } catch (error) {
            console.error('Error deleting account:', error.response?.data || error.message);
            
            // Remove from memory even if API deletion fails
            this.accounts.delete(accountId);
            
            return {
                success: false,
                error: this.normalizeError(error),
                details: error.response?.data || { message: error.message }
            };
        }
    }

    /**
     * Get account information
     * @param {string} accountId - Account ID
     * @returns {Promise<Object>} Account info
     */
    async getAccountInfo(accountId) {
        try {
            const account = this.accounts.get(accountId);
            if (!account) {
                throw new Error('Account not found');
            }

            const response = await this.axiosInstance.get(`/accounts/${accountId}`, {
                headers: {
                    'Authorization': `Bearer ${account.token}`
                }
            });

            // Update last accessed time
            account.lastAccessed = new Date();

            return {
                success: true,
                data: response.data
            };

        } catch (error) {
            console.error('Error fetching account info:', error.response?.data || error.message);
            
            return {
                success: false,
                error: this.normalizeError(error),
                details: error.response?.data || { message: error.message }
            };
        }
    }

    /**
     * Normalize API errors
     * @param {Error} error - Axios error
     * @returns {string} Normalized error message
     */
    normalizeError(error) {
        if (error.response) {
            const status = error.response.status;
            const data = error.response.data;
            
            switch (status) {
                case 400:
                    return 'Bad request - invalid data provided';
                case 401:
                    return 'Authentication failed - invalid credentials';
                case 404:
                    return 'Resource not found';
                case 409:
                    return 'Account already exists';
                case 429:
                    return 'Too many requests - please try again later';
                case 500:
                    return 'Internal server error';
                default:
                    return data.message || `HTTP error ${status}`;
            }
        } else if (error.request) {
            return 'Network error - unable to reach Mail.tm API';
        } else {
            return error.message || 'Unknown error occurred';
        }
    }

    /**
     * Clean up accounts older than 24 hours
     */
    cleanupOldAccounts() {
        const now = new Date();
        const twentyFourHoursAgo = new Date(now.getTime() - (24 * 60 * 60 * 1000));

        for (const [accountId, account] of this.accounts.entries()) {
            if (account.lastAccessed < twentyFourHoursAgo) {
                console.log(`Cleaning up old account: ${account.address}`);
                this.accounts.delete(accountId);
            }
        }
    }

    /**
     * Download an attachment from a message
     * @param {string} accountId - Account ID
     * @param {string} messageId - Message ID
     * @param {string} attachmentId - Attachment ID
     * @returns {Promise<Object>} Attachment stream data
     */
    async downloadAttachment(accountId, messageId, attachmentId) {
        try {
            const account = this.accounts.get(accountId);
            if (!account) {
                throw new Error('Account not found');
            }

            // Update last accessed time
            account.lastAccessed = new Date();

            const response = await this.axiosInstance.get(`/messages/${messageId}/attachment/${attachmentId}`, {
                headers: {
                    'Authorization': `Bearer ${account.token}`
                },
                responseType: 'stream'
            });

            return {
                success: true,
                data: {
                    stream: response.data,
                    headers: response.headers
                }
            };

        } catch (error) {
            console.error('Error downloading attachment:', error.response?.data || error.message);
            
            return {
                success: false,
                error: this.normalizeError(error),
                details: error.response?.data || { message: error.message }
            };
        }
    }
}

// Create and export singleton instance
module.exports = new MailTMService();