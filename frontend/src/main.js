import { Header } from './components/header.js';
import { EmailGenerator } from './components/emailGenerator.js';
import { InboxView } from './components/inboxView.js';
import { PopularArticles } from './components/PopularArticles.js';
import { Footer } from './components/footer.js';
import { pollingService } from './services/pollingService.js';
import { healthCheck } from './utils/api.js';
import './styles/main.css';

class TempMailApp {
    constructor() {
        this.currentView = 'generator';
        this.currentAccount = null;
        this.header = new Header();
        this.footer = new Footer();
        this.emailGenerator = null;
        this.inboxView = null;
        this.popularArticles = null;

        this.init();
    }

    async init() {
        // Check backend health
        await this.checkHealth();

        // Render initial layout
        this.renderLayout();

        // Initialize components
        this.initializeComponents();

        // Attach global event listeners
        this.attachGlobalEventListeners();
    }

    async checkHealth() {
        const health = await healthCheck();
        if (!health.success) {
            this.showNotification('Backend server is unavailable. Please make sure the backend is running.', 'error');
        }
    }

    renderLayout() {
        const appContainer = document.getElementById('app');
        if (!appContainer) return;

        appContainer.innerHTML = `
            <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex flex-col transition-colors duration-200">
                ${this.header.render()}

                <main class="flex-1 container mx-auto px-4 py-8">
                    <div id="popular-articles-container"></div>
                    <div id="view-container"></div>
                </main>

                ${this.footer.render()}
            </div>
        `;

        // Initialize Popular Articles
        this.initializePopularArticles();

        // Render initial view
        this.renderCurrentView();
    }

    renderCurrentView() {
        const viewContainer = document.getElementById('view-container');
        if (!viewContainer) return;

        switch (this.currentView) {
        case 'generator':
            this.renderGeneratorView();
            break;
        case 'inbox':
            this.renderInboxView();
            break;
        default:
            this.renderGeneratorView();
        }

        // Update header navigation
        this.header.setActiveView(this.currentView);
    }

    renderGeneratorView() {
        const viewContainer = document.getElementById('view-container');
        if (!viewContainer) return;

        this.emailGenerator = new EmailGenerator((account) => {
            this.handleEmailCreated(account);
        });

        viewContainer.innerHTML = this.emailGenerator.render();
        this.emailGenerator.init();
    }

    renderInboxView() {
        const viewContainer = document.getElementById('view-container');
        if (!viewContainer || !this.currentAccount) return;

        this.inboxView = new InboxView(
            this.currentAccount,
            () => this.handleAccountDeleted()
        );

        viewContainer.innerHTML = this.inboxView.render();
        this.inboxView.init();
    }

    handleEmailCreated(account) {
        this.currentAccount = account;
        this.currentView = 'inbox';
        this.header.enableInbox();
        this.renderCurrentView();
    }

    handleAccountDeleted() {
        // Stop polling for the deleted account
        if (this.currentAccount) {
            pollingService.stopPolling(this.currentAccount.address);
        }

        this.currentAccount = null;
        this.currentView = 'generator';
        this.header.disableInbox();
        this.renderCurrentView();
    }

    initializeComponents() {
        // Attach header event listeners
        this.header.attachEventListeners((view) => {
            this.handleViewChange(view);
        });
    }

    initializePopularArticles() {
        const container = document.getElementById('popular-articles-container');
        if (!container) return;

        this.popularArticles = new PopularArticles(container);
        this.popularArticles.init();
    }

    handleViewChange(view) {
        if (view === 'inbox' && !this.currentAccount) {
            this.showNotification('Please create an email account first', 'error');
            return;
        }

        this.currentView = view;
        this.renderCurrentView();
    }

    attachGlobalEventListeners() {
        // Global keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + 1 for generator
            if ((e.ctrlKey || e.metaKey) && e.key === '1') {
                e.preventDefault();
                this.handleViewChange('generator');
            }

            // Ctrl/Cmd + 2 for inbox
            if ((e.ctrlKey || e.metaKey) && e.key === '2' && this.currentAccount) {
                e.preventDefault();
                this.handleViewChange('inbox');
            }

            // Escape to close modals
            if (e.key === 'Escape') {
                const modals = document.querySelectorAll('.fixed.inset-0');
                modals.forEach(modal => modal.remove());
            }

            // F5 to refresh inbox
            if (e.key === 'F5' && this.currentView === 'inbox' && this.inboxView) {
                e.preventDefault();
                this.inboxView.loadMessages(true);
            }

            // R to refresh current view
            if (e.key === 'r' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                if (this.currentView === 'inbox' && this.inboxView) {
                    this.inboxView.loadMessages(true);
                }
            }
        });

        // Global error handler
        window.addEventListener('error', (e) => {
            console.error('Global error:', e.error);
            this.showNotification('An unexpected error occurred', 'error');
        });

        // Online/offline detection
        window.addEventListener('online', () => {
            this.showNotification('Connection restored', 'success');
            // Resume polling if we have an active account
            if (this.currentAccount && this.inboxView) {
                this.inboxView.loadMessages(true);
            }
        });

        window.addEventListener('offline', () => {
            this.showNotification('You are currently offline', 'error');
        });

        // Clean up polling when page is hidden (tab switch)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                // Page is hidden, could optimize polling here
                console.log('Page hidden - polling continues in background');
            } else {
                // Page is visible again
                console.log('Page visible');
                if (this.currentAccount && this.inboxView) {
                    this.inboxView.loadMessages(true);
                }
            }
        });

        // Clean up on page unload
        window.addEventListener('beforeunload', () => {
            pollingService.stopAllPolling();
        });
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
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TempMailApp();
});

// Export for potential debugging
window.TempMailApp = TempMailApp;