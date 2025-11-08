// API base URL - adjust according to your backend URL
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

// Load available domains from Mail.tm API
async function loadDomains() {
    try {
        domainSelect.innerHTML = '<option value="">Loading domains...</option>';

        const response = await fetch(`${API_BASE_URL}/domains`);
        const data = await response.json();

        if (data['hydra:member'] && data['hydra:member'].length > 0) {
            domainSelect.innerHTML = '<option value="">Select a domain</option>';
            data['hydra:member'].forEach(domain => {
                const option = document.createElement('option');
                option.value = domain.domain;
                option.textContent = domain.domain;
                domainSelect.appendChild(option);
            });
        } else {
            domainSelect.innerHTML = '<option value="">No domains available</option>';
        }
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

// Create new email account
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

        const response = await fetch(`${API_BASE_URL}/accounts`, {
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
        showError(error.message);
    } finally {
        setLoading(false);
    }
}

// Load messages for current account
async function loadMessages() {
    if (!currentAccount) return;

    try {
        const response = await fetch(`${API_BASE_URL}/accounts/${currentAccount.id}/messages`);
        const data = await response.json();

        if (data.success) {
            displayMessages(data.data);
        } else {
            throw new Error(data.error || 'Failed to load messages');
        }
    } catch (error) {
        console.error('Error loading messages:', error);
        showError('Failed to load messages');
    }
}

// Display messages in the inbox
function displayMessages(messages) {
    if (messages.length === 0) {
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
        <div class="message-item bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
            <div class="flex justify-between items-start mb-2">
                <div class="font-semibold text-gray-800 truncate">${escapeHtml(message.from?.name || message.from?.address || 'Unknown')}</div>
                <div class="text-sm text-gray-500 whitespace-nowrap">${formatDate(message.createdAt)}</div>
            </div>
            <div class="font-medium text-gray-900 mb-1 truncate">${escapeHtml(message.subject || 'No subject')}</div>
            <div class="text-gray-600 text-sm truncate">${escapeHtml(message.intro || 'No preview available')}</div>
        </div>
    `).join('');
}

// Show account information
function showAccountInfo(account) {
    emailAddress.textContent = account.address;
    accountInfo.classList.remove('hidden');
    accountInfo.classList.add('fade-in');
    inboxSection.classList.remove('hidden');

    // Add refresh button if not exists
    if (!refreshBtn) {
        const refreshButton = document.createElement('button');
        refreshButton.id = 'refreshBtn';
        refreshButton.className = 'mt-4 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition duration-200';
        refreshButton.innerHTML = '🔄 Refresh Inbox';
        accountInfo.querySelector('.bg-green-50').appendChild(refreshButton);
        refreshButton.addEventListener('click', loadMessages);
    }
}

// Utility functions
function setLoading(loading) {
    createAccountBtn.disabled = loading;
    createAccountBtn.textContent = loading ? 'Creating Account...' : 'Create Email Account';
    createAccountBtn.classList.toggle('opacity-50', loading);
}

function showSuccess(message) {
    // Simple toast notification
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}

function showError(message) {
    // Simple toast notification
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
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