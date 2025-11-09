import { getInbox, getMessage, deleteAddress, downloadAttachment, checkAccountStatus } from '../utils/api.js';
import { pollingService } from '../services/pollingService.js';

export class InboxView {
    constructor(account, onAccountDeleted) {
        this.account = account;
        this.onAccountDeleted = onAccountDeleted;
        this.messages = [];
        this.state = {
            isLoading: false,
            isAccountValid: true,
            selectedMessage: null,
            autoRefresh: true,
            lastPollTime: null,
            pollError: null,
            retryCount: 0,
            maxRetries: 3
        };

        this.pollingInterval = 15000; // 15 seconds
    }

    render() {
        // Show account expired message if account is invalid
        if (!this.state.isAccountValid) {
            return this.renderExpiredAccount();
        }

        return `
            <div class="max-w-6xl mx-auto">
                <!-- Inbox Header -->
                <div class="bg-white rounded-2xl shadow-xl p-8 mb-8">
                    <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                        <div class="flex-1 mb-4 lg:mb-0">
                            <h2 class="text-3xl font-bold text-gray-800 mb-2">Your Inbox</h2>
                            <div class="flex items-center space-x-4 text-gray-600">
                                <div class="flex items-center">
                                    <i class="fas fa-envelope mr-2"></i>
                                    <span id="emailDisplay" class="font-mono">${this.account.address}</span>
                                </div>
                                <div class="flex items-center">
                                    <i class="fas fa-clock mr-2"></i>
                                    <span>Created: ${this.formatDate(this.account.createdAt)}</span>
                                </div>
                                <div class="flex items-center text-green-600">
                                    <i class="fas fa-check-circle mr-2"></i>
                                    <span>Active</span>
                                </div>
                            </div>
                        </div>

                        <div class="flex space-x-3">
                            <button
                                id="refreshInboxBtn"
                                class="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-200 font-semibold disabled:opacity-50"
                                ${this.state.isLoading ? 'disabled' : ''}
                            >
                                ${this.state.isLoading ?
                                    '<i class="fas fa-spinner fa-spin mr-2"></i> Loading...' :
                                    '<i class="fas fa-sync-alt mr-2"></i> Refresh'
                                }
                            </button>
                            <button
                                id="autoRefreshToggle"
                                class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 font-semibold"
                            >
                                ${this.state.autoRefresh ?
                                    '<i class="fas fa-pause mr-2"></i> Pause' :
                                    '<i class="fas fa-play mr-2"></i> Auto Refresh'
                                }
                            </button>
                            <button
                                id="deleteAccountBtn"
                                class="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition duration-200 font-semibold"
                            >
                                <i class="fas fa-trash mr-2"></i> Delete Account
                            </button>
                        </div>
                    </div>

                    <!-- Polling Status -->
                    <div class="mt-4 pt-4 border-t border-gray-200">
                        <div class="flex items-center justify-between text-sm">
                            <div class="flex items-center space-x-4">
                                <div class="flex items-center ${this.state.pollError ? 'text-red-600' : 'text-green-600'}">
                                    <i class="fas ${this.state.pollError ? 'fa-exclamation-triangle' : 'fa-check-circle'} mr-2"></i>
                                    <span>${this.state.pollError ? 'Polling error' : 'Auto-refresh active'}</span>
                                </div>
                                <div class="text-gray-500">
                                    <i class="fas fa-clock mr-1"></i>
                                    Last update: <span id="lastPollTime">${this.state.lastPollTime ? this.formatTime(this.state.lastPollTime) : 'Never'}</span>
                                </div>
                                ${this.state.retryCount > 0 ? `
                                    <div class="text-orange-600">
                                        <i class="fas fa-redo mr-1"></i>
                                        Retry ${this.state.retryCount}/${this.state.maxRetries}
                                    </div>
                                ` : ''}
                            </div>
                            <div class="text-gray-500">
                                Next update in: <span id="nextPollCountdown">--</span>
                            </div>
                        </div>
                        ${this.state.pollError ? `
                            <div class="mt-2 bg-red-50 border border-red-200 rounded-lg p-3">
                                <div class="flex items-center justify-between">
                                    <div class="flex items-center text-red-800">
                                        <i class="fas fa-exclamation-circle mr-2"></i>
                                        <span>${this.state.pollError}</span>
                                    </div>
                                    <button
                                        id="retryPollingBtn"
                                        class="bg-red-600 text-white px-4 py-1 rounded text-sm hover:bg-red-700 transition duration-200"
                                    >
                                        Retry Now
                                    </button>
                                </div>
                            </div>
                        ` : ''}
                    </div>
                </div>

                <!-- Stats & Messages -->
                <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    <!-- Sidebar Stats -->
                    <div class="lg:col-span-1">
                        <div class="bg-white rounded-2xl shadow-xl p-6 sticky top-8">
                            <h3 class="text-lg font-semibold text-gray-800 mb-4">Inbox Stats</h3>
                            <div class="space-y-4">
                                <div class="text-center p-4 bg-blue-50 rounded-lg">
                                    <div class="text-2xl font-bold text-blue-600" id="totalMessages">${this.messages.length}</div>
                                    <div class="text-sm text-blue-800">Total Messages</div>
                                </div>
                                <div class="text-center p-4 bg-green-50 rounded-lg">
                                    <div class="text-2xl font-bold text-green-600" id="unreadMessages">
                                        ${this.messages.filter(msg => !msg.seen).length}
                                    </div>
                                    <div class="text-sm text-green-800">Unread Messages</div>
                                </div>
                                <div class="text-center p-4 bg-purple-50 rounded-lg">
                                    <div class="text-2xl font-bold text-purple-600">
                                        ${this.state.autoRefresh ? 'On' : 'Off'}
                                    </div>
                                    <div class="text-sm text-purple-800">Auto Refresh</div>
                                </div>
                                <div class="text-center p-4 bg-orange-50 rounded-lg">
                                    <div class="text-2xl font-bold text-orange-600" id="pollInterval">
                                        ${this.pollingInterval / 1000}s
                                    </div>
                                    <div class="text-sm text-orange-800">Refresh Rate</div>
                                </div>
                            </div>

                            <!-- Quick Actions -->
                            <div class="mt-6 pt-6 border-t border-gray-200">
                                <h4 class="font-semibold text-gray-800 mb-3">Quick Actions</h4>
                                <div class="space-y-2">
                                    <button
                                        id="copyEmailBtn"
                                        class="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded transition duration-200"
                                    >
                                        <i class="fas fa-copy mr-2"></i>Copy Email Address
                                    </button>
                                    <button
                                        id="exportMessagesBtn"
                                        class="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded transition duration-200"
                                    >
                                        <i class="fas fa-download mr-2"></i>Export Messages
                                    </button>
                                    <button
                                        id="changePollIntervalBtn"
                                        class="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded transition duration-200"
                                    >
                                        <i class="fas fa-clock mr-2"></i>Change Refresh Rate
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Messages List -->
                    <div class="lg:col-span-3">
                        <div class="bg-white rounded-2xl shadow-xl p-6">
                            <div class="flex items-center justify-between mb-6">
                                <h3 class="text-xl font-semibold text-gray-800">Messages</h3>
                                <div class="text-sm text-gray-500">
                                    <span id="messageCount">${this.messages.length}</span> messages
                                    ${this.state.lastPollTime ? `• Updated ${this.formatRelativeTime(this.state.lastPollTime)}` : ''}
                                </div>
                            </div>

                            <div id="messagesContainer">
                                ${this.state.isLoading ? this.renderLoading() : this.renderMessages()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderExpiredAccount() {
        return `
            <div class="max-w-2xl mx-auto">
                <div class="bg-white rounded-2xl shadow-xl p-8 text-center">
                    <div class="text-6xl text-red-500 mb-4">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <h2 class="text-3xl font-bold text-gray-800 mb-4">Account Expired</h2>
                    <p class="text-gray-600 mb-6">
                        The email address <strong class="font-mono">${this.account.address}</strong> has been deleted or expired.
                    </p>
                    <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                        <div class="flex items-center text-red-800">
                            <i class="fas fa-info-circle mr-2"></i>
                            <span>Temporary email addresses are automatically deleted after 24 hours of inactivity.</span>
                        </div>
                    </div>
                    <div class="space-y-4">
                        <button
                            id="createNewAccountBtn"
                            class="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 font-semibold"
                        >
                            <i class="fas fa-plus-circle mr-2"></i>Create New Email Account
                        </button>
                        <button
                            id="tryRecoverBtn"
                            class="w-full bg-gray-600 text-white py-3 px-6 rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-200 font-semibold"
                        >
                            <i class="fas fa-redo mr-2"></i>Try to Recover Account
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    renderMessages() {
        if (this.messages.length === 0) {
            return `
                <div class="text-center py-12">
                    <div class="text-6xl text-gray-300 mb-4">
                        <i class="fas fa-inbox"></i>
                    </div>
                    <h4 class="text-xl font-semibold text-gray-600 mb-2">No messages yet</h4>
                    <p class="text-gray-500 max-w-md mx-auto">
                        Emails sent to <strong>${this.account.address}</strong> will appear here automatically.
                        <span class="block mt-2 text-sm text-blue-600">
                            <i class="fas fa-sync-alt fa-spin mr-1"></i>
                            Auto-refresh is ${this.state.autoRefresh ? 'enabled' : 'paused'}
                        </span>
                    </p>
                    <div class="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
                        <div class="flex items-center text-sm text-blue-800">
                            <i class="fas fa-info-circle mr-2"></i>
                            <span>Share this email address to start receiving messages</span>
                        </div>
                    </div>
                </div>
            `;
        }

        // Sort messages by date (newest first)
        const sortedMessages = [...this.messages].sort((a, b) =>
            new Date(b.createdAt) - new Date(a.createdAt)
        );

        return `
            <div class="space-y-3">
                ${sortedMessages.map(message => `
                    <div class="message-card ${message.seen ? 'opacity-75' : 'border-l-4 border-l-blue-500 bg-blue-50'}"
                         data-message-id="${message.id}">
                        <div class="flex items-start space-x-4 p-4">
                            <div class="flex-shrink-0">
                                <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                                    ${this.getInitials(message.from?.name || message.from?.address || 'Unknown')}
                                </div>
                            </div>

                            <div class="flex-1 min-w-0">
                                <div class="flex items-start justify-between mb-1">
                                    <div class="font-semibold text-gray-800 truncate">
                                        ${message.seen ? '👁️' : '🔵'}
                                        ${this.escapeHtml(message.from?.name || message.from?.address || 'Unknown')}
                                    </div>
                                    <div class="text-sm text-gray-500 whitespace-nowrap ml-2">
                                        ${this.formatTime(message.createdAt)}
                                    </div>
                                </div>

                                <div class="font-medium text-gray-900 mb-1 truncate">
                                    ${this.escapeHtml(message.subject || 'No subject')}
                                </div>

                                <div class="text-gray-600 text-sm line-clamp-2">
                                    ${this.escapeHtml(message.intro || 'No preview available')}
                                </div>

                                <div class="flex items-center space-x-3 mt-2 text-xs text-gray-500">
                                    <span>${this.formatDate(message.createdAt)}</span>
                                    ${message.hasAttachments ? `
                                        <span class="flex items-center text-blue-600">
                                            <i class="fas fa-paperclip mr-1"></i>
                                            ${message.attachments.length} attachment${message.attachments.length > 1 ? 's' : ''}
                                        </span>
                                    ` : ''}
                                    ${!message.seen ? `<span class="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">New</span>` : ''}
                                </div>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    async init() {
        // Check account status first
        await this.checkAccountValidity();

        if (this.state.isAccountValid) {
            await this.loadMessages();
            this.attachEventListeners();

            if (this.state.autoRefresh) {
                this.startPolling();
            }

            this.startCountdownTimer();
        }
    }

    async checkAccountValidity() {
        const result = await checkAccountStatus(this.account.address);
        this.updateState({
            isAccountValid: result.isValid,
            pollError: result.success ? null : result.error
        });
    }

    attachEventListeners() {
        // Refresh button
        const refreshBtn = document.getElementById('refreshInboxBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.loadMessages(true); // Force refresh
            });
        }

        // Auto-refresh toggle
        const autoRefreshToggle = document.getElementById('autoRefreshToggle');
        if (autoRefreshToggle) {
            autoRefreshToggle.addEventListener('click', () => {
                this.toggleAutoRefresh();
            });
        }

        // Delete account button
        const deleteAccountBtn = document.getElementById('deleteAccountBtn');
        if (deleteAccountBtn) {
            deleteAccountBtn.addEventListener('click', () => {
                this.deleteAccount();
            });
        }

        // Copy email button
        const copyEmailBtn = document.getElementById('copyEmailBtn');
        if (copyEmailBtn) {
            copyEmailBtn.addEventListener('click', () => {
                this.copyEmailAddress();
            });
        }

        // Export messages button
        const exportMessagesBtn = document.getElementById('exportMessagesBtn');
        if (exportMessagesBtn) {
            exportMessagesBtn.addEventListener('click', () => {
                this.exportMessages();
            });
        }

        // Change poll interval button
        const changePollIntervalBtn = document.getElementById('changePollIntervalBtn');
        if (changePollIntervalBtn) {
            changePollIntervalBtn.addEventListener('click', () => {
                this.changePollInterval();
            });
        }

        // Retry polling button (when there's an error)
        const retryPollingBtn = document.getElementById('retryPollingBtn');
        if (retryPollingBtn) {
            retryPollingBtn.addEventListener('click', () => {
                this.retryPolling();
            });
        }

        // Expired account buttons
        const createNewAccountBtn = document.getElementById('createNewAccountBtn');
        if (createNewAccountBtn) {
            createNewAccountBtn.addEventListener('click', () => {
                this.handleCreateNewAccount();
            });
        }

        const tryRecoverBtn = document.getElementById('tryRecoverBtn');
        if (tryRecoverBtn) {
            tryRecoverBtn.addEventListener('click', () => {
                this.tryRecoverAccount();
            });
        }

        // Message click events
        this.attachMessageEventListeners();
    }

    attachMessageEventListeners() {
        const messageCards = document.querySelectorAll('.message-card');
        messageCards.forEach(card => {
            card.addEventListener('click', (e) => {
                const messageId = e.currentTarget.dataset.messageId;
                this.viewMessage(messageId);
            });
        });
    }

    async loadMessages(forceRefresh = false) {
        this.updateState({
            isLoading: true,
            pollError: null
        });

        const result = await getInbox(this.account.address, forceRefresh);

        this.updateState({
            isLoading: false,
            lastPollTime: new Date().toISOString()
        });

        if (result.success) {
            this.updateState({
                retryCount: 0, // Reset retry count on success
                pollError: null
            });

            const previousCount = this.messages.length;
            this.messages = result.messages;

            // Check for new messages
            if (this.messages.length > previousCount) {
                this.showNewMessageNotification(this.messages.length - previousCount);
            }

            this.updateLastUpdated();
            this.updateMessageCount();

            // Re-render if we have new state
            if (this.messages.length !== previousCount || forceRefresh) {
                this.renderMessagesSection();
            }
        } else {
            // Handle specific error cases
            if (result.error.includes('deleted') || result.error.includes('not found')) {
                this.updateState({
                    isAccountValid: false,
                    pollError: 'Account has been deleted or expired'
                });
                this.stopPolling();
            } else {
                // Increment retry count for transient errors
                this.updateState({
                    retryCount: this.state.retryCount + 1,
                    pollError: result.error
                });

                if (this.state.retryCount >= this.state.maxRetries) {
                    this.showError(`Failed to load messages after ${this.state.maxRetries} attempts: ${result.error}`);
                    this.updateState({ autoRefresh: false });
                    this.stopPolling();
                } else {
                    this.showError(`Failed to load messages (${this.state.retryCount}/${this.state.maxRetries}): ${result.error}`);
                }
            }
        }
    }

    retryPolling() {
        this.updateState({ retryCount: 0, pollError: null });
        this.loadMessages(true);
    }

    renderMessagesSection() {
        const messagesContainer = document.getElementById('messagesContainer');
        if (messagesContainer) {
            messagesContainer.innerHTML = this.renderMessages();
            this.attachMessageEventListeners();
        }
    }

    async viewMessage(messageId) {
        const result = await getMessage(this.account.address, messageId);

        if (result.success) {
            this.showMessageModal(result.message);
            // Mark message as seen in local state
            const messageIndex = this.messages.findIndex(msg => msg.id === messageId);
            if (messageIndex !== -1) {
                this.messages[messageIndex].seen = true;
                this.renderMessagesSection();
            }
        } else {
            this.showError('Failed to load message: ' + result.error);
        }
    }

    showMessageModal(message) {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
        modal.innerHTML = `
            <div class="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                <!-- Modal Header -->
                <div class="flex justify-between items-center p-6 border-b border-gray-200">
                    <h3 class="text-2xl font-bold text-gray-800">${this.escapeHtml(message.subject || 'No subject')}</h3>
                    <button id="closeModal" class="text-gray-500 hover:text-gray-700 text-2xl">
                        <i class="fas fa-times"></i>
                    </button>
                </div>

                <!-- Message Header -->
                <div class="p-6 border-b border-gray-200">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                            <strong class="text-gray-700">From:</strong>
                            <div class="text-gray-900">${this.escapeHtml(message.from?.name || message.from?.address || 'Unknown')}</div>
                        </div>
                        <div>
                            <strong class="text-gray-700">To:</strong>
                            <div class="text-gray-900">${this.escapeHtml((message.to || []).map(t => t.address).join(', ') || 'Unknown')}</div>
                        </div>
                        <div>
                            <strong class="text-gray-700">Date:</strong>
                            <div class="text-gray-900">${this.formatDateTime(message.createdAt)}</div>
                        </div>
                        <div>
                            <strong class="text-gray-700">Subject:</strong>
                            <div class="text-gray-900">${this.escapeHtml(message.subject || 'No subject')}</div>
                        </div>
                    </div>
                </div>

                <!-- Attachments -->
                ${message.hasAttachments ? this.renderAttachmentsSection(message.attachments) : ''}

                <!-- Message Body -->
                <div class="flex-1 overflow-auto">
                    <div class="p-6">
                        ${this.renderMessageContent(message)}
                    </div>
                </div>

                <!-- Modal Footer -->
                <div class="p-6 border-t border-gray-200 bg-gray-50">
                    <div class="flex justify-between items-center">
                        <div class="text-sm text-gray-600">
                            Message ID: <span class="font-mono">${message.id}</span>
                        </div>
                        <div class="flex space-x-3">
                            <button id="closeMessageBtn" class="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition duration-200">
                                Close
                            </button>
                            <button id="replyMessageBtn" class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition duration-200">
                                <i class="fas fa-reply mr-2"></i>Reply
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Add event listeners for modal
        const closeModal = () => modal.remove();
        modal.querySelector('#closeModal').addEventListener('click', closeModal);
        modal.querySelector('#closeMessageBtn').addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });

        // Add attachment download listeners
        if (message.hasAttachments) {
            this.attachAttachmentListeners(modal, message.attachments);
        }

        document.body.appendChild(modal);
    }

    renderAttachmentsSection(attachments) {
        return `
            <div class="p-6 border-b border-gray-200 bg-blue-50">
                <h4 class="text-lg font-semibold text-gray-800 mb-4">
                    <i class="fas fa-paperclip mr-2"></i>Attachments (${attachments.length})
                </h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    ${attachments.map(attachment => `
                        <div class="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition duration-200">
                            <div class="flex items-center space-x-3 min-w-0">
                                <div class="text-blue-500 text-xl">
                                    <i class="fas fa-file"></i>
                                </div>
                                <div class="min-w-0 flex-1">
                                    <div class="font-medium text-gray-800 truncate" title="${this.escapeHtml(attachment.filename)}">
                                        ${this.escapeHtml(attachment.filename)}
                                    </div>
                                    <div class="text-sm text-gray-500">
                                        ${this.formatFileSize(attachment.size)} • ${attachment.contentType}
                                    </div>
                                </div>
                            </div>
                            <button
                                class="download-attachment-btn bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition duration-200"
                                data-attachment-id="${attachment.id}"
                                data-filename="${this.escapeHtml(attachment.filename)}"
                                ${attachment.error ? 'disabled' : ''}
                                title="${attachment.error ? 'Failed to load attachment' : 'Download attachment'}"
                            >
                                <i class="fas fa-download"></i>
                            </button>
                        </div>
                    `).join('')}
                </div>
                ${attachments.some(a => a.error) ? `
                    <div class="mt-3 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <div class="flex items-center text-yellow-800 text-sm">
                            <i class="fas fa-exclamation-triangle mr-2"></i>
                            <span>Some attachments failed to load. You can still try to download them.</span>
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }

    attachAttachmentListeners(modal, attachments) {
        const downloadButtons = modal.querySelectorAll('.download-attachment-btn');
        downloadButtons.forEach(button => {
            button.addEventListener('click', async (e) => {
                e.stopPropagation();
                const attachmentId = e.currentTarget.dataset.attachmentId;
                const filename = e.currentTarget.dataset.filename;

                // Show loading state
                const originalHTML = e.currentTarget.innerHTML;
                e.currentTarget.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
                e.currentTarget.disabled = true;

                try {
                    const result = await downloadAttachment(this.account.address, attachmentId, filename);
                    if (result.success) {
                        this.showSuccess('Attachment download started');
                    } else {
                        this.showError('Failed to download attachment: ' + result.error);
                        // Reset button state
                        e.currentTarget.innerHTML = originalHTML;
                        e.currentTarget.disabled = false;
                    }
                } catch (error) {
                    this.showError('Failed to download attachment: ' + error.message);
                    // Reset button state
                    e.currentTarget.innerHTML = originalHTML;
                    e.currentTarget.disabled = false;
                }
            });
        });
    }

    renderMessageContent(message) {
        if (message.html) {
            // Sanitize and display HTML content in sandboxed iframe
            return `
                <div class="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <div class="bg-gray-50 px-4 py-2 border-b border-gray-200 text-sm text-gray-600">
                        <i class="fas fa-code mr-2"></i>HTML Content (Secure Sandbox)
                    </div>
                    <iframe
                        srcdoc="${this.sanitizeHTMLForIframe(message.html)}"
                        sandbox="allow-same-origin"
                        class="w-full h-96 border-0"
                        loading="lazy"
                    ></iframe>
                </div>
            `;
        } else {
            // Display plain text content
            return `
                <div class="bg-gray-50 rounded-lg p-6">
                    <pre class="whitespace-pre-wrap font-sans text-gray-800 text-sm leading-relaxed">${this.escapeHtml(message.text || 'No content available')}</pre>
                </div>
            `;
        }
    }

    sanitizeHTMLForIframe(html) {
        // Basic HTML sanitization for iframe display
        // In a production app, you might want to use a proper sanitizer like DOMPurify
        const sanitized = html
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/on\w+="[^"]*"/g, '')
            .replace(/on\w+='[^']*'/g, '')
            .replace(/javascript:/gi, '')
            .replace(/vbscript:/gi, '');

        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body {
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                        line-height: 1.6;
                        padding: 20px;
                        margin: 0;
                        background: white;
                    }
                    img { max-width: 100%; height: auto; }
                    table { border-collapse: collapse; width: 100%; }
                    td, th { border: 1px solid #ddd; padding: 8px; }
                    a { color: #2563eb; }
                </style>
            </head>
            <body>${sanitized}</body>
            </html>
        `;
    }

    startPolling() {
        pollingService.startPolling(
            this.account.address,
            () => this.loadMessages(),
            this.pollingInterval
        );
    }

    stopPolling() {
        pollingService.stopPolling(this.account.address);
    }

    toggleAutoRefresh() {
        this.updateState({ autoRefresh: !this.state.autoRefresh });

        if (this.state.autoRefresh) {
            this.startPolling();
            this.showNotification('Auto-refresh enabled');
        } else {
            this.stopPolling();
            this.showNotification('Auto-refresh paused');
        }

        this.renderMessagesSection();
    }

    changePollInterval() {
        const newInterval = prompt(
            'Enter new refresh interval in seconds (5-60):',
            this.pollingInterval / 1000
        );

        if (newInterval) {
            const seconds = parseInt(newInterval);
            if (seconds >= 5 && seconds <= 60) {
                this.pollingInterval = seconds * 1000;
                if (this.state.autoRefresh) {
                    pollingService.updatePollingInterval(this.account.address, this.pollingInterval);
                }
                this.showNotification(`Refresh interval set to ${seconds} seconds`);
                this.renderMessagesSection();
            } else {
                this.showError('Please enter a value between 5 and 60 seconds');
            }
        }
    }

    startCountdownTimer() {
        setInterval(() => {
            const countdownElement = document.getElementById('nextPollCountdown');
            if (countdownElement && this.state.autoRefresh && this.state.lastPollTime) {
                const nextPoll = new Date(this.state.lastPollTime).getTime() + this.pollingInterval;
                const now = new Date().getTime();
                const secondsLeft = Math.max(0, Math.round((nextPoll - now) / 1000));
                countdownElement.textContent = `${secondsLeft}s`;
            }
        }, 1000);
    }

    async deleteAccount() {
        if (!confirm('Are you sure you want to delete this email account? All messages will be permanently lost and this action cannot be undone.')) {
            return;
        }

        const result = await deleteAddress(this.account.address);

        if (result.success) {
            this.stopPolling();
            this.showSuccess('Account deleted successfully');
            this.updateState({ isAccountValid: false });
            if (this.onAccountDeleted) {
                this.onAccountDeleted();
            }
        } else {
            this.showError('Failed to delete account: ' + result.error);
        }
    }

    handleCreateNewAccount() {
        if (this.onAccountDeleted) {
            this.onAccountDeleted();
        }
    }

    async tryRecoverAccount() {
        this.showNotification('Attempting to recover account...', 'info');
        await this.checkAccountValidity();

        if (this.state.isAccountValid) {
            this.showSuccess('Account recovered successfully!');
            await this.loadMessages(true);
            this.attachEventListeners();
        } else {
            this.showError('Unable to recover account. It may have been permanently deleted.');
        }
    }

    copyEmailAddress() {
        navigator.clipboard.writeText(this.account.address).then(() => {
            this.showSuccess('Email address copied to clipboard!');
        }).catch(() => {
            this.showError('Failed to copy email address');
        });
    }

    exportMessages() {
        const exportData = {
            account: this.account.address,
            exportDate: new Date().toISOString(),
            messageCount: this.messages.length,
            messages: this.messages
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `tempmail-${this.account.address.replace('@', '-at-')}-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showSuccess('Messages exported successfully!');
    }

    showNewMessageNotification(count) {
        if (count > 0) {
            this.showNotification(`📬 ${count} new message${count > 1 ? 's' : ''} received!`, 'success');

            // Optional: Play notification sound or update browser title
            if (count === 1) {
                document.title = `📬 (1) TempMail - ${this.account.address}`;
            } else {
                document.title = `📬 (${count}) TempMail - ${this.account.address}`;
            }

            // Reset title after 5 seconds
            setTimeout(() => {
                document.title = `TempMail - ${this.account.address}`;
            }, 5000);
        }
    }

    updateLastUpdated() {
        const lastUpdated = document.getElementById('lastPollTime');
        if (lastUpdated && this.state.lastPollTime) {
            lastUpdated.textContent = this.formatTime(this.state.lastPollTime);
        }
    }

    updateMessageCount() {
        const messageCount = document.getElementById('messageCount');
        const totalMessages = document.getElementById('totalMessages');
        const unreadMessages = document.getElementById('unreadMessages');

        if (messageCount) messageCount.textContent = this.messages.length;
        if (totalMessages) totalMessages.textContent = this.messages.length;
        if (unreadMessages) {
            unreadMessages.textContent = this.messages.filter(msg => !msg.seen).length;
        }
    }

    // Utility methods
    getInitials(name) {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
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
        return new Date(dateString).toLocaleDateString();
    }

    formatTime(dateString) {
        return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    formatDateTime(dateString) {
        return new Date(dateString).toLocaleString();
    }

    formatRelativeTime(dateString) {
        const now = new Date();
        const time = new Date(dateString);
        const diffInSeconds = Math.floor((now - time) / 1000);

        if (diffInSeconds < 60) return 'just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
        return `${Math.floor(diffInSeconds / 86400)} days ago`;
    }

    updateState(newState) {
        this.state = { ...this.state, ...newState };
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showNotification(message, type = 'info') {
        const toast = document.createElement('div');
        const bgColor = type === 'error' ? 'bg-red-500' : type === 'success' ? 'bg-green-500' : 'bg-blue-500';
        const icon = type === 'error' ? 'exclamation-triangle' : type === 'success' ? 'check-circle' : 'info-circle';

        toast.className = `fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50 fade-in max-w-sm`;
        toast.innerHTML = `
            <div class="flex items-center">
                <i class="fas fa-${icon} mr-3"></i>
                <span>${message}</span>
            </div>
        `;

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('fade-out');
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }

    // Cleanup method
    destroy() {
        this.stopPolling();
    }
}

// Utility method for file size formatting
InboxView.prototype.formatFileSize = function(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};