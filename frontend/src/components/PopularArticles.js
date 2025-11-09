import { getNotionPosts } from '../utils/api.js';

export class PopularArticles {
    constructor(container) {
        this.container = container;
        this.articles = [];
        this.isLoading = false;
        this.error = null;
    }

    async init() {
        await this.loadArticles();
        this.render();
    }

    async loadArticles() {
        this.isLoading = true;
        this.render();

        try {
            const result = await getNotionPosts({ 
                pageSize: 6, 
                status: 'Published',
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
        } catch (error) {
            console.error('Error loading articles:', error);
            this.error = 'Failed to load articles';
            this.articles = [];
        }

        this.isLoading = false;
        this.render();
    }

    render() {
        if (!this.container) return;

        this.container.innerHTML = `
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8 transition-colors duration-200">
                <div class="flex justify-between items-center mb-6">
                    <div>
                        <h2 class="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center">
                            <svg class="w-7 h-7 mr-2 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"></path>
                            </svg>
                            Popular Articles
                        </h2>
                        <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Latest blog posts and tutorials
                        </p>
                    </div>
                    <button 
                        id="refresh-articles"
                        class="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors duration-200 flex items-center text-sm font-medium"
                        ${this.isLoading ? 'disabled' : ''}
                    >
                        <svg class="w-4 h-4 mr-2 ${this.isLoading ? 'animate-spin' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                        </svg>
                        Refresh
                    </button>
                </div>

                <div id="articles-content">
                    ${this.renderContent()}
                </div>
            </div>
        `;

        this.attachEventListeners();
    }

    renderContent() {
        if (this.isLoading) {
            return this.renderLoading();
        }

        if (this.error) {
            return this.renderError();
        }

        if (this.articles.length === 0) {
            return this.renderEmpty();
        }

        return this.renderArticles();
    }

    renderLoading() {
        return `
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                ${Array(6).fill(0).map(() => `
                    <div class="animate-pulse">
                        <div class="bg-gray-200 dark:bg-gray-700 h-48 rounded-t-lg"></div>
                        <div class="p-4 space-y-3">
                            <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                            <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                            <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderError() {
        return `
            <div class="text-center py-12">
                <svg class="w-16 h-16 mx-auto text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <p class="text-gray-600 dark:text-gray-400 text-lg mb-2">Unable to load articles</p>
                <p class="text-gray-500 dark:text-gray-500 text-sm mb-4">${this.escapeHtml(this.error)}</p>
                <button 
                    id="retry-articles"
                    class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
                >
                    Try Again
                </button>
            </div>
        `;
    }

    renderEmpty() {
        return `
            <div class="text-center py-12">
                <svg class="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                <p class="text-gray-600 dark:text-gray-400 text-lg mb-2">No articles available</p>
                <p class="text-gray-500 dark:text-gray-500 text-sm">
                    Articles will appear here once they are published in Notion.
                </p>
            </div>
        `;
    }

    renderArticles() {
        return `
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                ${this.articles.map(article => this.renderArticleCard(article)).join('')}
            </div>
        `;
    }

    renderArticleCard(article) {
        const statusColors = {
            'Published': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
            'Draft': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
            'In Progress': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
            'Archived': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
        };

        const statusColor = statusColors[article.status] || statusColors['Draft'];
        const formattedDate = this.formatDate(article.createdTime);
        const tags = article.tags || [];
        const author = article.author || 'Anonymous';

        return `
            <div class="article-card bg-white dark:bg-gray-700 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer border border-gray-200 dark:border-gray-600 group"
                 data-article-id="${article.id}">
                <!-- Article Header/Image Placeholder -->
                <div class="h-48 bg-gradient-to-br from-blue-500 to-purple-600 relative overflow-hidden">
                    <div class="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                    <div class="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
                        <div class="flex items-center space-x-2">
                            ${article.status ? `<span class="text-xs px-2 py-1 rounded-full ${statusColor} font-medium">${this.escapeHtml(article.status)}</span>` : ''}
                        </div>
                    </div>
                    <div class="absolute top-4 right-4">
                        <svg class="w-12 h-12 text-white opacity-20" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"></path>
                        </svg>
                    </div>
                </div>

                <!-- Article Content -->
                <div class="p-5">
                    <!-- Title -->
                    <h3 class="text-lg font-bold text-gray-800 dark:text-gray-100 mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                        ${this.escapeHtml(article.title || 'Untitled')}
                    </h3>

                    <!-- Metadata -->
                    <div class="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-3 space-x-3">
                        <div class="flex items-center">
                            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                            </svg>
                            ${this.escapeHtml(author)}
                        </div>
                        <div class="flex items-center">
                            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                            </svg>
                            ${formattedDate}
                        </div>
                    </div>

                    <!-- Tags -->
                    ${tags.length > 0 ? `
                        <div class="flex flex-wrap gap-2 mb-3">
                            ${tags.slice(0, 3).map(tag => `
                                <span class="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                                    ${this.escapeHtml(tag)}
                                </span>
                            `).join('')}
                            ${tags.length > 3 ? `<span class="text-xs text-gray-500 dark:text-gray-400">+${tags.length - 3} more</span>` : ''}
                        </div>
                    ` : ''}

                    <!-- Read More Link -->
                    <div class="flex items-center text-blue-600 dark:text-blue-400 text-sm font-medium group-hover:translate-x-1 transition-transform duration-200">
                        <span>Read article</span>
                        <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                        </svg>
                    </div>
                </div>
            </div>
        `;
    }

    attachEventListeners() {
        const refreshBtn = document.getElementById('refresh-articles');
        const retryBtn = document.getElementById('retry-articles');
        const articleCards = document.querySelectorAll('.article-card');

        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.loadArticles();
            });
        }

        if (retryBtn) {
            retryBtn.addEventListener('click', () => {
                this.loadArticles();
            });
        }

        articleCards.forEach(card => {
            card.addEventListener('click', () => {
                const articleId = card.dataset.articleId;
                this.viewArticle(articleId);
            });
        });
    }

    async viewArticle(articleId) {
        // Find the article
        const article = this.articles.find(a => a.id === articleId);
        if (!article) return;

        // Show article modal
        this.showArticleModal(article);
    }

    showArticleModal(article) {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto';
        modal.innerHTML = `
            <div class="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                <!-- Modal Header -->
                <div class="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex justify-between items-start z-10">
                    <div class="flex-1">
                        <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                            ${this.escapeHtml(article.title || 'Untitled')}
                        </h2>
                        <div class="flex items-center text-sm text-gray-600 dark:text-gray-400 space-x-4">
                            <span class="flex items-center">
                                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                                </svg>
                                ${this.escapeHtml(article.author || 'Anonymous')}
                            </span>
                            <span class="flex items-center">
                                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                </svg>
                                ${this.formatDate(article.createdTime)}
                            </span>
                        </div>
                    </div>
                    <button id="closeArticleModal" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl ml-4">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>

                <!-- Modal Body -->
                <div class="p-6">
                    <!-- Tags -->
                    ${article.tags && article.tags.length > 0 ? `
                        <div class="flex flex-wrap gap-2 mb-6">
                            ${article.tags.map(tag => `
                                <span class="text-sm px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                                    ${this.escapeHtml(tag)}
                                </span>
                            `).join('')}
                        </div>
                    ` : ''}

                    <!-- Status Badge -->
                    ${article.status ? `
                        <div class="mb-6">
                            <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${this.getStatusColor(article.status)}">
                                <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                                </svg>
                                Status: ${this.escapeHtml(article.status)}
                            </span>
                        </div>
                    ` : ''}

                    <!-- Article Content -->
                    <div class="prose dark:prose-invert max-w-none">
                        <div class="text-gray-600 dark:text-gray-400 leading-relaxed" id="article-content-${article.id}">
                            <p class="text-center text-gray-500 dark:text-gray-400">Loading content...</p>
                        </div>
                    </div>

                    <!-- Article Link -->
                    <div class="mt-8 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                        <div class="flex items-center justify-between">
                            <span class="text-sm text-gray-600 dark:text-gray-400">View in Notion</span>
                            <a href="${article.url}" target="_blank" rel="noopener noreferrer" 
                               class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 flex items-center text-sm">
                                <span>Open in Notion</span>
                                <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                                </svg>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Load full article content
        this.loadArticleContent(article.id);

        // Event listeners
        modal.querySelector('#closeArticleModal').addEventListener('click', () => {
            modal.remove();
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });

        document.body.appendChild(modal);
    }

    async loadArticleContent(articleId) {
        try {
            const contentDiv = document.getElementById(`article-content-${articleId}`);
            if (!contentDiv) return;

            const result = await fetch(`http://localhost:3000/api/notion/posts/${articleId}`)
                .then(res => res.json());

            if (result.success && result.data.content) {
                contentDiv.innerHTML = `
                    <div class="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        ${this.escapeHtml(result.data.content)}
                    </div>
                `;
            } else {
                contentDiv.innerHTML = `
                    <p class="text-gray-500 dark:text-gray-400">
                        No content available. Click "Open in Notion" to view the full article.
                    </p>
                `;
            }
        } catch (error) {
            console.error('Error loading article content:', error);
            const contentDiv = document.getElementById(`article-content-${articleId}`);
            if (contentDiv) {
                contentDiv.innerHTML = `
                    <p class="text-red-500">Failed to load content. Please try again.</p>
                `;
            }
        }
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
        const now = new Date();
        const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

        if (diffInDays === 0) {
            return 'Today';
        } else if (diffInDays === 1) {
            return 'Yesterday';
        } else if (diffInDays < 7) {
            return `${diffInDays} days ago`;
        } else if (diffInDays < 30) {
            const weeks = Math.floor(diffInDays / 7);
            return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
        } else {
            return date.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
            });
        }
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

    destroy() {
        // Cleanup if needed
    }
}
