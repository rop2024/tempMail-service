import { generateEmail, getDomains } from '../utils/api.js';

export class EmailCreator {
    constructor(container, onAccountCreated) {
        this.container = container;
        this.onAccountCreated = onAccountCreated;
        this.domains = [];
        this.currentState = {
            isLoading: false,
            username: '',
            password: '',
            selectedDomain: ''
        };
        
        this.init();
    }

    async init() {
        this.render();
        await this.loadDomains();
        this.attachEventListeners();
    }

    render() {
        this.container.innerHTML = `
            <div class="bg-white rounded-lg shadow-lg p-6 mb-8">
                <h2 class="text-2xl font-semibold text-gray-800 mb-4">Create Temporary Email</h2>
                <div class="space-y-4">
                    <div>
                        <label for="domainSelect" class="block text-sm font-medium text-gray-700 mb-2">
                            Select Domain
                        </label>
                        <select 
                            id="domainSelect" 
                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                            ${this.currentState.isLoading ? 'disabled' : ''}
                        >
                            <option value="">Loading domains...</option>
                        </select>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label for="username" class="block text-sm font-medium text-gray-700 mb-2">
                                Username
                            </label>
                            <input 
                                type="text" 
                                id="username" 
                                placeholder="Enter username"
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                                value="${this.currentState.username}"
                                ${this.currentState.isLoading ? 'disabled' : ''}
                            >
                        </div>
                        <div>
                            <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
                                Password
                            </label>
                            <div class="flex space-x-2">
                                <input 
                                    type="password" 
                                    id="password" 
                                    placeholder="Enter password"
                                    class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                                    value="${this.currentState.password}"
                                    ${this.currentState.isLoading ? 'disabled' : ''}
                                >
                                <button 
                                    type="button" 
                                    id="generatePassword"
                                    class="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-200"
                                    ${this.currentState.isLoading ? 'disabled' : ''}
                                >
                                    🔄
                                </button>
                            </div>
                        </div>
                    </div>

                    <button 
                        id="createAccountBtn"
                        class="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        ${this.currentState.isLoading ? 'disabled' : ''}
                    >
                        ${this.currentState.isLoading ? 
                            '<span class="flex items-center justify-center"><span class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span> Creating Account...</span>' : 
                            'Create Email Account'
                        }
                    </button>
                </div>
            </div>
        `;
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
        const domainSelect = this.container.querySelector('#domainSelect');
        
        if (this.domains.length === 0) {
            domainSelect.innerHTML = '<option value="">No domains available</option>';
            return;
        }

        domainSelect.innerHTML = '<option value="">Select a domain</option>';
        this.domains.forEach(domain => {
            const option = document.createElement('option');
            option.value = domain.domain;
            option.textContent = domain.domain;
            option.selected = domain.isActive;
            domainSelect.appendChild(option);
        });

        // Auto-select first domain if available
        if (this.domains.length > 0) {
            domainSelect.value = this.domains[0].domain;
            this.currentState.selectedDomain = this.domains[0].domain;
        }
    }

    attachEventListeners() {
        const domainSelect = this.container.querySelector('#domainSelect');
        const usernameInput = this.container.querySelector('#username');
        const passwordInput = this.container.querySelector('#password');
        const generatePasswordBtn = this.container.querySelector('#generatePassword');
        const createAccountBtn = this.container.querySelector('#createAccountBtn');

        domainSelect.addEventListener('change', (e) => {
            this.updateState({ selectedDomain: e.target.value });
        });

        usernameInput.addEventListener('input', (e) => {
            this.updateState({ username: e.target.value.trim() });
        });

        passwordInput.addEventListener('input', (e) => {
            this.updateState({ password: e.target.value });
        });

        generatePasswordBtn.addEventListener('click', () => {
            this.generateRandomPassword();
        });

        createAccountBtn.addEventListener('click', () => {
            this.createAccount();
        });

        // Enter key support
        passwordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.createAccount();
            }
        });
    }

    generateRandomPassword() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
        let password = '';
        for (let i = 0; i < 16; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        
        const passwordInput = this.container.querySelector('#password');
        passwordInput.value = password;
        this.updateState({ password });
    }

    async createAccount() {
        const { username, password, selectedDomain } = this.currentState;

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
            this.showSuccess('Account created successfully!');
            if (this.onAccountCreated) {
                this.onAccountCreated(result.data);
            }
        } else {
            this.showError(result.error || 'Failed to create account');
        }
    }

    updateState(newState) {
        this.currentState = { ...this.currentState, ...newState };
        this.render();
        this.attachEventListeners(); // Re-attach event listeners after re-render
    }

    showError(message) {
        // Simple error display - can be enhanced with a proper notification system
        alert('Error: ' + message);
    }

    showSuccess(message) {
        // Simple success display - can be enhanced with a proper notification system
        alert('Success: ' + message);
    }

    // Public method to reset the form
    reset() {
        this.updateState({
            username: '',
            password: '',
            selectedDomain: this.domains[0]?.domain || ''
        });
        this.generateRandomPassword();
    }
}