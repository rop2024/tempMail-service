// API base URL
const API_BASE_URL = 'http://localhost:3000/api';

// Application state
let currentAccount = null;

// DOM Elements
const domainSelect = document.getElementById('domainSelect');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const createAccountBtn = document.getElementById('createAccountBtn');
const accountInfo = document.getElementById('accountInfo');
const inboxSection = document.getElementById('inboxSection');
const emailAddress = document.getElementById('emailAddress');
const inbox = document.getElementById('inbox');
const refreshBtn = document.getElementById('refreshBtn');
const deleteAccountBtn = document.getElementById('deleteAccountBtn');

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
    loadDomains();
    setupEventListeners();
    generateRandomPassword();
});

// Event Listeners
function setupEventListeners() {
    createAccountBtn.addEventListener('click', createAccount);

    // Add refresh button if it exists
    if (refreshBtn) {
        refreshBtn.addEventListener('click', loadMessages);
    }

    // Enter key support
    passwordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            createAccount();
        }
    });
}

// Load available domains (using common Mail.tm domains)
async function loadDomains() {
    try {
        domainSelect.innerHTML = '<option value="">Loading domains...</option>';

        // Use common Mail.tm domains instead of fetching dynamically
        const commonDomains = [
            '1secmail.com',
            '1secmail.org',
            '1secmail.net',
            'wwjmp.com',
            'esiix.com',
            'xojxe.com',
            'yoggm.com'
        ];

        domainSelect.innerHTML = '<option value="">Select a domain</option>';
        commonDomains.forEach(domain => {
            const option = document.createElement('option');
            option.value = domain;
            option.textContent = domain;
            domainSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading domains:', error);
        domainSelect.innerHTML = '<option value="">Error loading domains</option>';
        showError('Failed to load domains. Please refresh the page.');
    }
}

// Generate random password
function generateRandomPassword() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 16; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    passwordInput.value = password;
}

// Create new email account using the new endpoint
async function createAccount() {
    const username = usernameInput.value.trim();
    const password = passwordInput.value;
    const domain = domainSelect.value;

    if (!username || !password || !domain) {
        showError('Please fill in all fields');
        return;
    }

    if (password.length < 6) {
        showError('Password must be at least 6 characters long');
        return;
    }

    try {
        setLoading(true);

        const emailAddress = `${username}@${domain}`;

        const response = await fetch(`${API_BASE_URL}/email/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                address: emailAddress,
                password: password
            })
        });

        const data = await response.json();

        if (data.success) {
            currentAccount = data.data;
            showAccountInfo(currentAccount);
            showSuccess('Account created successfully!');
            await loadMessages();
        } else {
            throw new Error(data.error || 'Failed to create account');
        }
    } catch (error) {
        console.error('Error creating account:', error);

        // Handle rate limit errors
        if (error.message.includes('Too many requests')) {
            showError('Too many account creations. Please wait before creating another account.');
        } else {
            showError(error.message);
        }
    } finally {
        setLoading(false);
    }
}

// Load messages using the new endpoint
async function loadMessages() {
    if (!currentAccount) return;

    try {
        const response = await fetch(`${API_BASE_URL}/email/${currentAccount.address}/inbox`);
        const data = await response.json();

        if (data.success) {
            displayMessages(data.data.messages, data.data.total, data.data.unread);
        } else {
            throw new Error(data.error || 'Failed to load messages');
        }
    } catch (error) {
        console.error('Error loading messages:', error);
        showError('Failed to load messages');
    }
}

// Display messages in the inbox
function displayMessages(messages, total, unread) {
    const inboxTitle = document.getElementById('inboxTitle');
    if (inboxTitle) {
        inboxTitle.textContent = `Inbox (${total} messages, ${unread} unread)`;
    }

    if (!messages || messages.length === 0) {
        inbox.innerHTML = `
            <div class="text-center py-8 text-gray-500">
                <div class="text-4xl mb-4">📭</div>
                <p>No messages yet</p>
                <p class="text-sm mt-2">Emails sent to your temporary address will appear here</p>
            </div>
        `;
        return;
    }

    inbox.innerHTML = messages.map(message => `
        <div class="message-item bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200 cursor-pointer ${message.seen ? 'opacity-75' : ''}"
             onclick="viewMessage('${message.id}')">
            <div class="flex justify-between items-start mb-2">
                <div class="font-semibold text-gray-800 truncate flex items-center">
                    ${message.seen ? '👁️' : '🔵'}
                    <span class="ml-2">${escapeHtml(message.from?.name || message.from?.address || 'Unknown')}</span>
                </div>
                <div class="text-sm text-gray-500 whitespace-nowrap">${formatDate(message.createdAt)}</div>
            </div>
            <div class="font-medium text-gray-900 mb-1 truncate">${escapeHtml(message.subject || 'No subject')}</div>
            <div class="text-gray-600 text-sm truncate">${escapeHtml(message.intro || 'No preview available')}</div>
        </div>
    `).join('');
}

// View specific message
async function viewMessage(messageId) {
    if (!currentAccount) return;

    try {
        const response = await fetch(`${API_BASE_URL}/email/${currentAccount.address}/message/${messageId}`);
        const data = await response.json();

        if (data.success) {
            showMessageModal(data.data.message);
        } else {
            throw new Error(data.error || 'Failed to load message');
        }
    } catch (error) {
        console.error('Error loading message:', error);
        showError('Failed to load message');
    }
}

// Show message in modal
function showMessageModal(message) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
    modal.innerHTML = `
        <div class="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div class="p-6">
                <div class="flex justify-between items-start mb-4">
                    <h3 class="text-xl font-bold text-gray-900">${escapeHtml(message.subject || 'No subject')}</h3>
                    <button onclick="this.closest('.fixed').remove()" class="text-gray-500 hover:text-gray-700">
                        ✕
                    </button>
                </div>
                <div class="space-y-4">
                    <div class="flex justify-between text-sm text-gray-600">
                        <div>
                            <strong>From:</strong> ${escapeHtml(message.from?.name || message.from?.address || 'Unknown')}
                        </div>
                        <div>${formatDate(message.createdAt)}</div>
                    </div>
                    <div class="text-sm text-gray-600">
                        <strong>To:</strong> ${escapeHtml(message.to?.map(t => t.address).join(', ') || 'Unknown')}
                    </div>
                    <div class="border-t pt-4">
                        <div class="prose max-w-none">
                            ${message.html ? message.html : `<pre class="whitespace-pre-wrap">${escapeHtml(message.text || 'No content')}</pre>`}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

// Delete account
async function deleteAccount() {
    if (!currentAccount || !confirm('Are you sure you want to delete this email account? This action cannot be undone.')) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/email/${currentAccount.address}`, {
            method: 'DELETE'
        });

        const data = await response.json();

        if (data.success) {
            showSuccess('Account deleted successfully');
            resetUI();
        } else {
            throw new Error(data.error || 'Failed to delete account');
        }
    } catch (error) {
        console.error('Error deleting account:', error);
        showError('Failed to delete account');
    }
}

// Show account information
function showAccountInfo(account) {
    emailAddress.textContent = account.address;
    accountInfo.classList.remove('hidden');
    accountInfo.classList.add('fade-in');
    inboxSection.classList.remove('hidden');

    // Add action buttons if not exists
    if (!refreshBtn) {
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'flex space-x-3 mt-4';

        const refreshButton = document.createElement('button');
        refreshButton.id = 'refreshBtn';
        refreshButton.className = 'flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition duration-200';
        refreshButton.innerHTML = '🔄 Refresh Inbox';
        refreshButton.addEventListener('click', loadMessages);

        const deleteButton = document.createElement('button');
        deleteButton.id = 'deleteAccountBtn';
        deleteButton.className = 'flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition duration-200';
        deleteButton.innerHTML = '🗑️ Delete Account';
        deleteButton.addEventListener('click', deleteAccount);

        buttonContainer.appendChild(refreshButton);
        buttonContainer.appendChild(deleteButton);
        accountInfo.querySelector('.bg-green-50').appendChild(buttonContainer);
    }
}

// Reset UI after account deletion
function resetUI() {
    currentAccount = null;
    accountInfo.classList.add('hidden');
    inboxSection.classList.add('hidden');
    usernameInput.value = '';
    generateRandomPassword();
}

// Utility functions (keep the same as before)
function setLoading(loading) {
    createAccountBtn.disabled = loading;
    createAccountBtn.textContent = loading ? 'Creating Account...' : 'Create Email Account';
    createAccountBtn.classList.toggle('opacity-50', loading);
}

function showSuccess(message) {
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 fade-in';
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function showError(message) {
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 fade-in';
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function formatDate(dateString) {
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

// Make functions globally available for HTML onclick
window.viewMessage = viewMessage;