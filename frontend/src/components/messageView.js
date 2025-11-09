export class MessageView {
    constructor(message) {
        this.message = message;
    }

    render() {
        return `
            <div class="bg-white rounded-2xl shadow-xl p-8 max-w-4xl mx-auto">
                <!-- Message Header -->
                <div class="border-b border-gray-200 pb-6 mb-6">
                    <div class="flex justify-between items-start mb-4">
                        <h2 class="text-2xl font-bold text-gray-800">${this.escapeHtml(this.message.subject || 'No subject')}</h2>
                        <button id="closeMessageBtn" class="text-gray-500 hover:text-gray-700 text-2xl">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>
                            <strong class="text-gray-700">From:</strong>
                            <div class="text-gray-900">${this.escapeHtml(this.message.from?.name || this.message.from?.address || 'Unknown')}</div>
                        </div>
                        <div>
                            <strong class="text-gray-700">To:</strong>
                            <div class="text-gray-900">${this.escapeHtml((this.message.to || []).map(t => t.address).join(', ') || 'Unknown')}</div>
                        </div>
                        <div>
                            <strong class="text-gray-700">Date:</strong>
                            <div class="text-gray-900">${this.formatDateTime(this.message.createdAt)}</div>
                        </div>
                        <div>
                            <strong class="text-gray-700">Message ID:</strong>
                            <div class="text-gray-900 font-mono text-xs">${this.message.id}</div>
                        </div>
                    </div>
                </div>

                <!-- Message Body -->
                <div class="prose max-w-none mb-8">
                    ${this.message.html ? 
        `<div class="email-content bg-gray-50 rounded-lg p-6">${this.message.html}</div>` : 
        `<pre class="whitespace-pre-wrap font-sans text-gray-800 bg-gray-50 p-6 rounded-lg">${this.escapeHtml(this.message.text || 'No content')}</pre>`
}
                </div>

                <!-- Attachments -->
                ${this.message.attachments && this.message.attachments.length > 0 ? this.renderAttachments() : ''}

                <!-- Message Actions -->
                <div class="border-t pt-6 flex flex-wrap gap-3 justify-between items-center">
                    <div class="text-sm text-gray-500">
                        <i class="fas fa-info-circle mr-2"></i>
                        This message was received via your temporary email address
                    </div>
                    <div class="flex space-x-3">
                        <button id="replyBtn" class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition duration-200 font-semibold">
                            <i class="fas fa-reply mr-2"></i>Reply
                        </button>
                        <button id="forwardBtn" class="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition duration-200 font-semibold">
                            <i class="fas fa-share mr-2"></i>Forward
                        </button>
                        <button id="deleteBtn" class="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition duration-200 font-semibold">
                            <i class="fas fa-trash mr-2"></i>Delete
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    renderAttachments() {
        return `
            <div class="border-t pt-6 mb-8">
                <h4 class="text-lg font-semibold text-gray-800 mb-4">
                    <i class="fas fa-paperclip mr-2"></i>Attachments
                </h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    ${this.message.attachments.map(attachment => `
                        <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                            <div class="flex items-center space-x-3">
                                <div class="text-blue-500 text-xl">
                                    <i class="fas fa-file"></i>
                                </div>
                                <div>
                                    <div class="font-medium text-gray-800">${this.escapeHtml(attachment.filename)}</div>
                                    <div class="text-sm text-gray-500">${this.formatFileSize(attachment.size)}</div>
                                </div>
                            </div>
                            <button class="text-blue-600 hover:text-blue-800 transition duration-200">
                                <i class="fas fa-download"></i>
                            </button>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    attachEventListeners(onClose, onReply, onForward, onDelete) {
        // Close button
        const closeBtn = document.getElementById('closeMessageBtn');
        if (closeBtn) {
            closeBtn.addEventListener('click', onClose);
        }

        // Action buttons
        const replyBtn = document.getElementById('replyBtn');
        if (replyBtn) {
            replyBtn.addEventListener('click', onReply);
        }

        const forwardBtn = document.getElementById('forwardBtn');
        if (forwardBtn) {
            forwardBtn.addEventListener('click', onForward);
        }

        const deleteBtn = document.getElementById('deleteBtn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', onDelete);
        }

        // Attachment download buttons
        const downloadBtns = document.querySelectorAll('[id^="downloadAttachment"]');
        downloadBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const attachmentId = e.target.dataset.attachmentId;
                this.downloadAttachment(attachmentId);
            });
        });
    }

    downloadAttachment(attachmentId) {
        // Implementation for attachment download
        console.log('Downloading attachment:', attachmentId);
        // This would require additional backend support for attachment handling
    }

    // Utility methods
    escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    formatDateTime(dateString) {
        return new Date(dateString).toLocaleString();
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}