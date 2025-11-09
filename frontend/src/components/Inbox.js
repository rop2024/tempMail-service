import { getInbox, getMessage, deleteAddress } from '../utils/api.js';

export class Inbox {
    constructor(container, account, onAccountDeleted) {
        this.container = container;
        this.account = account;
        this.onAccountDeleted = onAccountDeleted;
        this.messages = [];
        this.currentState = {
            isLoading: false,
            selectedMessage: null,
            autoRefresh: false,
            refreshInterval: null
        };
        
        this.init();
    }

    async init() {
        this.render();
        await this.loadMessages();
        this.attachEventListeners();
        
        // Start auto-refresh if enabled
        if (this.currentState.autoRefresh) {
            this.startAutoRefresh();
        }
    }

    render() {
        this.container.innerHTML = `
            <div class="bg-white rounded-lg shadow-lg p-6">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-2xl font-semibold text-gray-800" id="inboxTitle">
                        Inbox ${this.messages.length > 0 ? `(${this.messages.length})` : ''}
                    </h2>
                    <div class="flex space-x-3">
                        <button 
                            id="refreshBtn"
                            class="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-200 disabled:opacity-50"
                            ${this.currentState.isLoading ? 'disabled' : ''}
                        >
                            ${this.currentState.isLoading ? '🔄 Loading...' : '🔄 Refresh'}
                        </button>
                        <button 
                            id="autoRefreshToggle"
                            class="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                        >
                            ${this.currentState.autoRefresh ? '⏸️ Pause' : '▶️ Auto Refresh'}
                        </button>
                        <button 
                            id="deleteAccountBtn"
                            class="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition duration-200"
                        >
                            🗑️ Delete
                        </button>
                    </div>
                </div>

                <!-- Account Info -->
                <div class="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                    <div class="flex items-center justify-between">
                        <div>
                            <div class="flex items-center space-x-2 mb-2">
                                <span class="text-green-600 font-semibold">Email:</span>
                                <span class="text-gray-800 font-mono">${this.escapeHtml(this.account.address)}</span>
                            </div>
                            <div class="flex items-center space-x-2 text-sm text-green-600">
                                <span>Created: ${this.formatDate(this.account.createdAt)}</span>
                            </div>
                        </div>
                        <div class="text-sm text-gray-500">
                            ${this.currentState.autoRefresh ? '🟢 Auto-refresh enabled' : '🟡 Auto-refresh paused'}
                        </div>
                    </div>
                </div>

                <!-- Messages List -->
                <div id="messagesContainer">
                    ${this.currentState.isLoading ? this.renderLoading() : this.renderMessages()}
                </div>
            </div>
        `;
    }

    renderLoading() {
        return `
            <div class="text-center py-8">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                <p class="mt-4 text-gray-600">Loading messages...</p>
            </div>
        `;
    }

    renderMessages() {
        if (this.messages.length === 0) {
            return `
                <div class="text-center py-8 text-gray-500">
                    <div class="text-4xl mb-4">📭</div>
                    <p class="text-lg font-medium">No messages yet</p>
                    <p class="text-sm mt-2">Emails sent to your temporary address will appear here</p>
                </div>
            `;
        }

        return `
            <div class="space-y-3">
                ${this.messages.map(message => `
                    <div class="message-item bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 cursor-pointer ${
                        message.seen ? 'opacity-75' : 'border-l-4 border-l-blue-500'
                    }" data-message-id="${message.id}">
                        <div class="flex justify-between items-start mb-2">
                            <div class="font-semibold text-gray-800 truncate flex items-center">
                                ${message.seen ? '👁️' : '🔵'} 
                                <span class="ml-2">${this.escapeHtml(message.from?.name || message.from?.address || 'Unknown')}</span>
                            </div>
                            <div class="text-sm text-gray-500 whitespace-nowrap">${this.formatDate(message.createdAt)}</div>
                        </div>
                        <div class="font-medium text-gray-900 mb-1 truncate">${this.escapeHtml(message.subject || 'No subject')}</div>
                        <div class="text-gray-600 text-sm truncate">${this.escapeHtml(message.intro || 'No preview available')}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    attachEventListeners() {
        const refreshBtn = this.container.querySelector('#refreshBtn');
        const autoRefreshToggle = this.container.querySelector('#autoRefreshToggle');
        const deleteAccountBtn = this.container.querySelector('#deleteAccountBtn');
        const messageItems = this.container.querySelectorAll('.message-item');

        refreshBtn.addEventListener('click', () => {
            this.loadMessages();
        });

        autoRefreshToggle.addEventListener('click', () => {
            this.toggleAutoRefresh();
        });

        deleteAccountBtn.addEventListener('click', () => {
            this.deleteAccount();
        });

        messageItems.forEach(item => {
            item.addEventListener('click', (e) => {
                const messageId = e.currentTarget.dataset.messageId;
                this.viewMessage(messageId);
            });
        });
    }

    async loadMessages() {
        this.updateState({ isLoading: true });

        const result = await getInbox(this.account.address);

        this.updateState({ isLoading: false });

        if (result.success) {
            this.messages = result.messages;
            this.render();
            this.attachEventListeners();
        } else {
            this.showError('Failed to load messages: ' + result.error);
        }
    }

    async viewMessage(messageId) {
        const result = await getMessage(this.account.address, messageId);

        if (result.success) {
            this.showMessageModal(result.message);
            // Reload messages to mark as seen
            await this.loadMessages();
        } else {
            this.showError('Failed to load message: ' + result.error);
        }
    }

    showMessageModal(message) {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
        modal.innerHTML = `
            <div class="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div class="p-6">
                    <div class="flex justify-between items-start mb-4">
                        <h3 class="text-xl font-bold text-gray-900">${this.escapeHtml(message.subject || 'No subject')}</h3>
                        <button id="closeModal" class="text-gray-500 hover:text-gray-700 text-2xl">
                            ✕
                        </button>
                    </div>
                    <div class="space-y-4">
                        <div class="flex justify-between text-sm text-gray-600">
                            <div>
                                <strong>From:</strong> ${this.escapeHtml(message.from?.name || message.from?.address || 'Unknown')}
                            </div>
                            <div>${this.formatDate(message.createdAt)}</div>
                        </div>
                        <div class="text-sm text-gray-600">
                            <strong>To:</strong> ${this.escapeHtml((message.to || []).map(t => t.address).join(', ') || 'Unknown')}
                        </div>
                        <div class="border-t pt-4">
                            <div class="prose max-w-none">
                                ${message.html ? 
                                    `<div class="email-content">${message.html}</div>` : 
                                    `<pre class="whitespace-pre-wrap font-sans text-sm">${this.escapeHtml(message.text || 'No content')}</pre>`
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        modal.querySelector('#closeModal').addEventListener('click', () => {
            modal.remove();
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });

        document.body.appendChild(modal);
    }

    async deleteAccount() {
        if (!confirm('Are you sure you want to delete this email account? This action cannot be undone.')) {
            return;
        }

        const result = await deleteAddress(this.account.address);

        if (result.success) {
            this.showSuccess('Account deleted successfully');
            this.stopAutoRefresh();
            if (this.onAccountDeleted) {
                this.onAccountDeleted();
            }
        } else {
            this.showError('Failed to delete account: ' + result.error);
        }
    }

    toggleAutoRefresh() {
        this.updateState({ autoRefresh: !this.currentState.autoRefresh });
        
        if (this.currentState.autoRefresh) {
            this.startAutoRefresh();
        } else {
            this.stopAutoRefresh();
        }
        
        this.render();
        this.attachEventListeners();
    }

    startAutoRefresh() {
        this.stopAutoRefresh(); // Clear any existing interval
        this.currentState.refreshInterval = setInterval(() => {
            this.loadMessages();
        }, 10000); // Refresh every 10 seconds
    }

    stopAutoRefresh() {
        if (this.currentState.refreshInterval) {
            clearInterval(this.currentState.refreshInterval);
            this.currentState.refreshInterval = null;
        }
    }

    updateState(newState) {
        this.currentState = { ...this.currentState, ...newState };
    }

    showError(message) {
        alert('Error: ' + message);
    }

    showSuccess(message) {
        alert('Success: ' + message);
    }

    escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = (now - date) / (1000 * 60 * 60);
        
        if (diffInHours < 1) {
            return 'Just now';
        } else if (diffInHours < 24) {
            return `${Math.floor(diffInHours)}h ago`;
        } else {
            return date.toLocaleDateString();
        }
    }

    // Cleanup method to stop intervals when component is destroyed
    destroy() {
        this.stopAutoRefresh();
    }
}