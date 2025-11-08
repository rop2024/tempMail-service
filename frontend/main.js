// API base URL - adjust according to your backend URL
const API_BASE_URL = 'http://localhost:3000/api';

// DOM Elements
const domainSelect = document.getElementById('domainSelect');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const createAccountBtn = document.getElementById('createAccountBtn');
const accountInfo = document.getElementById('accountInfo');
const inboxSection = document.getElementById('inboxSection');
const emailAddress = document.getElementById('emailAddress');
const inbox = document.getElementById('inbox');

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
    loadDomains();
    setupEventListeners();
});

// Event Listeners
function setupEventListeners() {
    createAccountBtn.addEventListener('click', createAccount);
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
    }
}

// Create new email account
async function createAccount() {
    const username = usernameInput.value.trim();
    const password = passwordInput.value;
    const domain = domainSelect.value;

    if (!username || !password || !domain) {
        alert('Please fill in all fields');
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

        if (response.ok) {
            showAccountInfo(emailAddress);
            showSuccess('Account created successfully!');
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

// Show account information
function showAccountInfo(email) {
    emailAddress.textContent = email;
    accountInfo.classList.remove('hidden');
    accountInfo.classList.add('fade-in');
    inboxSection.classList.remove('hidden');
}

// Utility functions
function setLoading(loading) {
    createAccountBtn.disabled = loading;
    createAccountBtn.textContent = loading ? 'Creating...' : 'Create Email Account';
    createAccountBtn.classList.toggle('loading', loading);
}

function showSuccess(message) {
    // You can implement a toast notification system here
    console.log('Success:', message);
}

function showError(message) {
    // You can implement a toast notification system here
    alert('Error: ' + message);
}