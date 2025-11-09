import { generateEmail, getDomains } from '../utils/api.js';

export class EmailGenerator {
    constructor(onEmailCreated) {
        this.onEmailCreated = onEmailCreated;
        this.domains = [];
        this.state = {
            isLoading: false,
            username: '',
            password: '',
            selectedDomain: '',
            generatedEmail: null
        };
    }

    render() {
        return `
            <div class="max-w-4xl mx-auto">
                <!-- Hero Section -->
                <div class="text-center mb-12">
                    <h2 class="text-4xl font-bold text-gray-800 mb-4">Create Temporary Email</h2>
                    <p class="text-xl text-gray-600 max-w-2xl mx-auto">
                        Generate secure, anonymous temporary email addresses. No registration required.
                    </p>
                </div>

                <!-- Generator Card -->
                <div class="bg-white rounded-2xl shadow-xl p-8 mb-8">
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <!-- Left Column - Form -->
                        <div>
                            <h3 class="text-2xl font-semibold text-gray-800 mb-6">Create New Account</h3>
                            
                            <div class="space-y-6">
                                <!-- Domain Selection -->
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">
                                        <i class="fas fa-globe mr-2"></i>Select Domain
                                    </label>
                                    <select 
                                        id="domainSelect"
                                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                                        ${this.state.isLoading ? 'disabled' : ''}
                                    >
                                        <option value="">Loading domains...</option>
                                    </select>
                                </div>

                                <!-- Username Input -->
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">
                                        <i class="fas fa-user mr-2"></i>Username
                                    </label>
                                    <input 
                                        type="text" 
                                        id="usernameInput"
                                        placeholder="Enter your username"
                                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                                        value="${this.state.username}"
                                        ${this.state.isLoading ? 'disabled' : ''}
                                    >
                                    <p class="text-xs text-gray-500 mt-1">This will be the first part of your email address</p>
                                </div>

                                <!-- Password Input -->
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">
                                        <i class="fas fa-lock mr-2"></i>Password
                                    </label>
                                    <div class="flex space-x-3">
                                        <input 
                                            type="password" 
                                            id="passwordInput"
                                            placeholder="Enter password"
                                            class="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                                            value="${this.state.password}"
                                            ${this.state.isLoading ? 'disabled' : ''}
                                        >
                                        <button 
                                            type="button" 
                                            id="generatePasswordBtn"
                                            class="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-200"
                                            ${this.state.isLoading ? 'disabled' : ''}
                                            title="Generate secure password"
                                        >
                                            <i class="fas fa-sync-alt"></i>
                                        </button>
                                    </div>
                                    <p class="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
                                </div>

                                <!-- Generate Button -->
                                <button 
                                    id="generateEmailBtn"
                                    class="w-full bg-blue-600 text-white py-4 px-6 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                    ${this.state.isLoading ? 'disabled' : ''}
                                >
                                    ${this.state.isLoading ? 
        '<i class="fas fa-spinner fa-spin mr-2"></i> Creating Account...' : 
        '<i class="fas fa-plus-circle mr-2"></i> Generate Email Address'
}
                                </button>
                            </div>
                        </div>

                        <!-- Right Column - Preview & Info -->
                        <div class="lg:border-l lg:border-gray-200 lg:pl-8">
                            <h3 class="text-2xl font-semibold text-gray-800 mb-6">Your Email Preview</h3>
                            
                            <div class="space-y-6">
                                <!-- Email Preview -->
                                <div class="bg-gray-50 rounded-lg p-6">
                                    <div class="text-sm text-gray-600 mb-2">Your temporary email will be:</div>
                                    <div id="emailPreview" class="text-xl font-mono font-bold text-gray-800 break-all min-h-8">
                                        ${this.state.username && this.state.selectedDomain ? 
        `${this.state.username}@${this.state.selectedDomain}` : 
        'username@domain.com'
}
                                    </div>
                                </div>

                                <!-- Features -->
                                <div class="space-y-4">
                                    <h4 class="font-semibold text-gray-800">Why use TempMail?</h4>
                                    <div class="space-y-3">
                                        <div class="flex items-center text-sm text-gray-600">
                                            <i class="fas fa-shield-alt text-green-500 mr-3"></i>
                                            <span>Complete anonymity and privacy</span>
                                        </div>
                                        <div class="flex items-center text-sm text-gray-600">
                                            <i class="fas fa-clock text-blue-500 mr-3"></i>
                                            <span>No time limits on accounts</span>
                                        </div>
                                        <div class="flex items-center text-sm text-gray-600">
                                            <i class="fas fa-ban text-red-500 mr-3"></i>
                                            <span>No spam or promotional emails</span>
                                        </div>
                                        <div class="flex items-center text-sm text-gray-600">
                                            <i class="fas fa-mobile-alt text-purple-500 mr-3"></i>
                                            <span>Works on all devices</span>
                                        </div>
                                    </div>
                                </div>

                                <!-- Quick Tips -->
                                <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <div class="flex items-start">
                                        <i class="fas fa-lightbulb text-blue-500 mt-1 mr-3"></i>
                                        <div class="text-sm text-blue-800">
                                            <strong>Pro Tip:</strong> Use a memorable username to easily identify your temporary accounts.
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Generated Email Display -->
                ${this.state.generatedEmail ? this.renderGeneratedEmail() : ''}
            </div>
        `;
    }

    renderGeneratedEmail() {
        return `
            <div class="bg-green-50 border border-green-200 rounded-2xl p-8 text-center fade-in">
                <div class="flex items-center justify-center text-green-600 text-6xl mb-4">
                    <i class="fas fa-check-circle"></i>
                </div>
                <h3 class="text-2xl font-bold text-green-800 mb-2">Email Created Successfully!</h3>
                <p class="text-green-700 mb-6">Your temporary email address is ready to use.</p>
                
                <div class="max-w-md mx-auto">
                    <div class="bg-white rounded-lg p-4 mb-6 border-2 border-green-300">
                        <div class="text-sm text-gray-600 mb-1">Your temporary email:</div>
                        <div id="generatedEmail" class="text-xl font-mono font-bold text-gray-800 break-all">
                            ${this.state.generatedEmail.address}
                        </div>
                    </div>
                    
                    <div class="flex space-x-3 justify-center">
                        <button 
                            id="copyEmailBtn"
                            class="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-200 font-semibold"
                        >
                            <i class="fas fa-copy mr-2"></i>Copy Email
                        </button>
                        <button 
                            id="goToInboxBtn"
                            class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 font-semibold"
                        >
                            <i class="fas fa-inbox mr-2"></i>Go to Inbox
                        </button>
                        <button 
                            id="createAnotherBtn"
                            class="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-200 font-semibold"
                        >
                            <i class="fas fa-plus mr-2"></i>Create Another
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    async init() {
        await this.loadDomains();
        this.attachEventListeners();
    }

    async loadDomains() {
        this.updateState({ isLoading: true });
        
        const result = await getDomains();
        
        if (result.success) {
            this.domains = result.domains;
            this.populateDomainSelect();
        } else {
            this.showError('Failed to load domains: ' + result.error);
        }
        
        this.updateState({ isLoading: false });
    }

    populateDomainSelect() {
        const domainSelect = document.getElementById('domainSelect');
        if (!domainSelect) return;

        if (this.domains.length === 0) {
            domainSelect.innerHTML = '<option value="">No domains available</option>';
            return;
        }

        domainSelect.innerHTML = '<option value="">Select a domain</option>';
        this.domains.forEach(domain => {
            const option = document.createElement('option');
            option.value = domain.domain;
            option.textContent = domain.domain;
            domainSelect.appendChild(option);
        });

        // Auto-select first domain
        if (this.domains.length > 0) {
            domainSelect.value = this.domains[0].domain;
            this.state.selectedDomain = this.domains[0].domain;
        }
    }

    attachEventListeners() {
        // Domain selection
        const domainSelect = document.getElementById('domainSelect');
        if (domainSelect) {
            domainSelect.addEventListener('change', (e) => {
                this.updateState({ selectedDomain: e.target.value });
                this.updateEmailPreview();
            });
        }

        // Username input
        const usernameInput = document.getElementById('usernameInput');
        if (usernameInput) {
            usernameInput.addEventListener('input', (e) => {
                this.updateState({ username: e.target.value.trim() });
                this.updateEmailPreview();
            });
        }

        // Password generation
        const generatePasswordBtn = document.getElementById('generatePasswordBtn');
        if (generatePasswordBtn) {
            generatePasswordBtn.addEventListener('click', () => {
                this.generateRandomPassword();
            });
        }

        // Email generation
        const generateEmailBtn = document.getElementById('generateEmailBtn');
        if (generateEmailBtn) {
            generateEmailBtn.addEventListener('click', () => {
                this.createEmailAccount();
            });
        }

        // Copy email button
        const copyEmailBtn = document.getElementById('copyEmailBtn');
        if (copyEmailBtn) {
            copyEmailBtn.addEventListener('click', () => {
                this.copyEmailToClipboard();
            });
        }

        // Go to inbox button
        const goToInboxBtn = document.getElementById('goToInboxBtn');
        if (goToInboxBtn) {
            goToInboxBtn.addEventListener('click', () => {
                if (this.onEmailCreated) {
                    this.onEmailCreated(this.state.generatedEmail);
                }
            });
        }

        // Create another button
        const createAnotherBtn = document.getElementById('createAnotherBtn');
        if (createAnotherBtn) {
            createAnotherBtn.addEventListener('click', () => {
                this.resetForm();
            });
        }

        // Enter key support
        if (usernameInput) {
            usernameInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.createEmailAccount();
                }
            });
        }

        const passwordInput = document.getElementById('passwordInput');
        if (passwordInput) {
            passwordInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.createEmailAccount();
                }
            });
        }
    }

    updateEmailPreview() {
        const emailPreview = document.getElementById('emailPreview');
        if (emailPreview) {
            if (this.state.username && this.state.selectedDomain) {
                emailPreview.textContent = `${this.state.username}@${this.state.selectedDomain}`;
                emailPreview.className = 'text-xl font-mono font-bold text-blue-600 break-all min-h-8';
            } else {
                emailPreview.textContent = 'username@domain.com';
                emailPreview.className = 'text-xl font-mono font-bold text-gray-400 break-all min-h-8';
            }
        }
    }

    generateRandomPassword() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
        let password = '';
        for (let i = 0; i < 16; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        
        const passwordInput = document.getElementById('passwordInput');
        if (passwordInput) {
            passwordInput.value = password;
            this.updateState({ password });
        }
    }

    async createEmailAccount() {
        const { username, password, selectedDomain } = this.state;

        // Validation
        if (!username) {
            this.showError('Please enter a username');
            return;
        }

        if (!selectedDomain) {
            this.showError('Please select a domain');
            return;
        }

        if (!password || password.length < 6) {
            this.showError('Password must be at least 6 characters long');
            return;
        }

        const emailAddress = `${username}@${selectedDomain}`;

        this.updateState({ isLoading: true });

        const result = await generateEmail(emailAddress, password);

        this.updateState({ isLoading: false });

        if (result.success) {
            this.updateState({ generatedEmail: result.data });
            this.showSuccess('Email account created successfully!');
        } else {
            this.showError(result.error || 'Failed to create email account');
        }
    }

    copyEmailToClipboard() {
        const email = this.state.generatedEmail?.address;
        if (!email) return;

        navigator.clipboard.writeText(email).then(() => {
            this.showSuccess('Email address copied to clipboard!');
            
            // Update button text temporarily
            const copyBtn = document.getElementById('copyEmailBtn');
            if (copyBtn) {
                const originalText = copyBtn.innerHTML;
                copyBtn.innerHTML = '<i class="fas fa-check mr-2"></i>Copied!';
                copyBtn.disabled = true;
                
                setTimeout(() => {
                    copyBtn.innerHTML = originalText;
                    copyBtn.disabled = false;
                }, 2000);
            }
        }).catch(() => {
            this.showError('Failed to copy email address');
        });
    }

    resetForm() {
        this.updateState({
            username: '',
            password: '',
            selectedDomain: this.domains[0]?.domain || '',
            generatedEmail: null
        });
        this.generateRandomPassword();
    }

    updateState(newState) {
        this.state = { ...this.state, ...newState };
    }

    showError(message) {
        // Create toast notification
        this.showNotification(message, 'error');
    }

    showSuccess(message) {
        // Create toast notification
        this.showNotification(message, 'success');
    }

    showNotification(message, type = 'info') {
        const toast = document.createElement('div');
        const bgColor = type === 'error' ? 'bg-red-500' : type === 'success' ? 'bg-green-500' : 'bg-blue-500';
        
        toast.className = `fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50 fade-in max-w-sm`;
        toast.innerHTML = `
            <div class="flex items-center">
                <i class="fas fa-${type === 'error' ? 'exclamation-triangle' : type === 'success' ? 'check-circle' : 'info-circle'} mr-3"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('fade-out');
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }
}