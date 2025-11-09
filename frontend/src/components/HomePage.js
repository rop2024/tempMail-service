import { getNotionPosts, getNotionHealth } from '../utils/api.js';

export class HomePage {
    constructor() {
        this.articles = [];
        this.isLoading = false;
        this.error = null;
        this.isConfigured = false;
    }

    async init() {
        await this.loadData();
    }

    async loadData() {
        this.isLoading = true;
        
        try {
            // Check Notion configuration first
            const healthResult = await getNotionHealth();
            this.isConfigured = healthResult.configured;

            if (this.isConfigured) {
                // Load all articles if configured
                const result = await getNotionPosts({ 
                    pageSize: 100, // Get all articles
                    sortBy: 'created_time',
                    sortDirection: 'descending'
                });

                if (result.success) {
                    this.articles = result.data.posts || [];
                    this.error = null;
                } else {
                    this.error = result.error || 'Failed to load articles';
                    this.articles = [];
                }
            }
        } catch (error) {
            console.error('Error loading Notion data:', error);
            this.error = 'Failed to load Notion data';
            this.articles = [];
        }

        this.isLoading = false;
    }

    render() {
        return `
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8 transition-colors duration-200">
                <div class="flex justify-between items-center mb-6">
                    <div>
                        <h2 class="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center">
                            <svg class="w-7 h-7 mr-2 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                            </svg>
                            Home - Notion Blog Data
                        </h2>
                        <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            ${this.isConfigured ? 'All articles from your Notion database' : 'Notion integration status'}
                        </p>
                    </div>
                    <button 
                        id="refresh-home-data"
                        class="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors duration-200 flex items-center text-sm font-medium"
                        ${this.isLoading ? 'disabled' : ''}
                    >
                        <svg class="w-4 h-4 mr-2 ${this.isLoading ? 'animate-spin' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                        </svg>
                        Refresh
                    </button>
                </div>

                <div id="home-content">
                    ${this.renderContent()}
                </div>
            </div>
        `;
    }

    renderContent() {
        if (this.isLoading) {
            return this.renderLoading();
        }

        if (!this.isConfigured) {
            return this.renderNotConfigured();
        }

        if (this.error) {
            return this.renderError();
        }

        if (this.articles.length === 0) {
            return this.renderNoData();
        }

        return this.renderArticlesList();
    }

    renderLoading() {
        return `
            <div class="flex items-center justify-center py-12">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <span class="ml-3 text-gray-600 dark:text-gray-400">Loading Notion data...</span>
            </div>
        `;
    }

    renderNotConfigured() {
        return `
            <div class="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                <svg class="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
                <h3 class="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">Notion Not Configured</h3>
                <p class="text-gray-600 dark:text-gray-400 mb-4 max-w-md mx-auto">
                    The Notion API integration is not configured. Please set up your Notion credentials in the backend.
                </p>
                <div class="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 max-w-lg mx-auto text-left">
                    <p class="text-sm text-gray-700 dark:text-gray-300 mb-2 font-medium">Setup Instructions:</p>
                    <ol class="text-sm text-gray-600 dark:text-gray-400 space-y-1 list-decimal list-inside">
                        <li>Create a Notion integration at notion.so/my-integrations</li>
                        <li>Get your Integration Token</li>
                        <li>Create a database and get the Database ID</li>
                        <li>Add NOTION_TOKEN and NOTION_DATABASE_ID to backend/.env</li>
                        <li>Restart the backend server</li>
                    </ol>
                </div>
            </div>
        `;
    }

    renderError() {
        return `
            <div class="text-center py-12">
                <svg class="w-16 h-16 mx-auto text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <h3 class="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">Error Loading Data</h3>
                <p class="text-gray-600 dark:text-gray-400 mb-4">${this.escapeHtml(this.error)}</p>
                <button 
                    id="retry-home-data"
                    class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
                >
                    Try Again
                </button>
            </div>
        `;
    }

    renderNoData() {
        return `
            <div class="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                <svg class="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
                </svg>
                <h3 class="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">No Data Available Right Now</h3>
                <p class="text-gray-600 dark:text-gray-400 mb-4">
                    There are no articles in your Notion database yet.
                </p>
                <p class="text-sm text-gray-500 dark:text-gray-500">
                    Start creating content in your Notion database to see it here.
                </p>
            </div>
        `;
    }

    renderArticlesList() {
        const stats = this.calculateStats();
        
        return `
            <!-- Stats Cards -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm text-blue-600 dark:text-blue-400 font-medium">Total Articles</p>
                            <p class="text-2xl font-bold text-blue-700 dark:text-blue-300">${stats.total}</p>
                        </div>
                        <svg class="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                        </svg>
                    </div>
                </div>

                <div class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm text-green-600 dark:text-green-400 font-medium">Published</p>
                            <p class="text-2xl font-bold text-green-700 dark:text-green-300">${stats.published}</p>
                        </div>
                        <svg class="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                    </div>
                </div>

                <div class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm text-yellow-600 dark:text-yellow-400 font-medium">Draft</p>
                            <p class="text-2xl font-bold text-yellow-700 dark:text-yellow-300">${stats.draft}</p>
                        </div>
                        <svg class="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                        </svg>
                    </div>
                </div>

                <div class="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm text-purple-600 dark:text-purple-400 font-medium">Total Tags</p>
                            <p class="text-2xl font-bold text-purple-700 dark:text-purple-300">${stats.tags}</p>
                        </div>
                        <svg class="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
                        </svg>
                    </div>
                </div>
            </div>

            <!-- Articles Table -->
            <div class="bg-white dark:bg-gray-750 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead class="bg-gray-50 dark:bg-gray-800">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Title
                                </th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Author
                                </th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Status
                                </th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Tags
                                </th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Created
                                </th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody class="bg-white dark:bg-gray-750 divide-y divide-gray-200 dark:divide-gray-700">
                            ${this.articles.map(article => this.renderArticleRow(article)).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    renderArticleRow(article) {
        const statusColor = this.getStatusColor(article.status);
        const formattedDate = this.formatDate(article.createdTime);
        const tags = article.tags || [];
        const author = article.author || 'Anonymous';

        return `
            <tr class="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150">
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                        <div>
                            <div class="text-sm font-medium text-gray-900 dark:text-gray-100">
                                ${this.escapeHtml(article.title || 'Untitled')}
                            </div>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-700 dark:text-gray-300">${this.escapeHtml(author)}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    ${article.status ? `
                        <span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColor}">
                            ${this.escapeHtml(article.status)}
                        </span>
                    ` : '<span class="text-sm text-gray-500">-</span>'}
                </td>
                <td class="px-6 py-4">
                    <div class="flex flex-wrap gap-1">
                        ${tags.slice(0, 2).map(tag => `
                            <span class="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                                ${this.escapeHtml(tag)}
                            </span>
                        `).join('')}
                        ${tags.length > 2 ? `<span class="text-xs text-gray-500">+${tags.length - 2}</span>` : ''}
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                    ${formattedDate}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <a href="${article.url}" target="_blank" rel="noopener noreferrer" 
                       class="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
                        View
                    </a>
                </td>
            </tr>
        `;
    }

    calculateStats() {
        const stats = {
            total: this.articles.length,
            published: 0,
            draft: 0,
            tags: new Set()
        };

        this.articles.forEach(article => {
            if (article.status === 'Published') {
                stats.published++;
            } else if (article.status === 'Draft') {
                stats.draft++;
            }

            if (article.tags) {
                article.tags.forEach(tag => stats.tags.add(tag));
            }
        });

        stats.tags = stats.tags.size;

        return stats;
    }

    getStatusColor(status) {
        const colors = {
            'Published': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
            'Draft': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
            'In Progress': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
            'Archived': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
        };
        return colors[status] || colors['Draft'];
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    }

    escapeHtml(unsafe) {
        if (!unsafe) return '';
        return unsafe
            .toString()
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    attachEventListeners() {
        const refreshBtn = document.getElementById('refresh-home-data');
        const retryBtn = document.getElementById('retry-home-data');

        if (refreshBtn) {
            refreshBtn.addEventListener('click', async () => {
                await this.loadData();
                this.updateContent();
            });
        }

        if (retryBtn) {
            retryBtn.addEventListener('click', async () => {
                await this.loadData();
                this.updateContent();
            });
        }
    }

    updateContent() {
        const contentDiv = document.getElementById('home-content');
        if (contentDiv) {
            contentDiv.innerHTML = this.renderContent();
            this.attachEventListeners();
        }
    }

    destroy() {
        // Cleanup if needed
    }
}
