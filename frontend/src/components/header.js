export class Header {
    constructor() {
        this.currentView = 'generator';
        this.theme = this.loadTheme();
        this.applyTheme(this.theme);
    }

    loadTheme() {
        // Check localStorage first, then system preference
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            return savedTheme;
        }
        
        // Check system preference
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        
        return 'light';
    }

    applyTheme(theme) {
        const html = document.documentElement;
        if (theme === 'dark') {
            html.classList.add('dark');
        } else {
            html.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
        this.theme = theme;
    }

    toggleTheme() {
        const newTheme = this.theme === 'light' ? 'dark' : 'light';
        this.applyTheme(newTheme);
        this.updateThemeButton();
    }

    updateThemeButton() {
        const themeIcon = document.getElementById('theme-icon');
        if (themeIcon) {
            themeIcon.innerHTML = this.theme === 'dark' 
                ? '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>'
                : '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>';
        }
    }

    render() {
        return `
            <header class="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors duration-200">
                <div class="container mx-auto px-4">
                    <div class="flex justify-between items-center py-4">
                        <!-- Logo Section -->
                        <div class="flex items-center space-x-3">
                            <div class="bg-gradient-to-br from-blue-600 to-indigo-600 text-white p-3 rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-200">
                                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                                </svg>
                            </div>
                            <div>
                                <h1 class="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-indigo-400">
                                    TempMail
                                </h1>
                                <p class="text-xs text-gray-600 dark:text-gray-400">Secure Temporary Email Service</p>
                            </div>
                        </div>
                        
                        <!-- Navigation & Theme Toggle -->
                        <div class="flex items-center space-x-2">
                            <nav class="flex space-x-1 mr-2">
                                <button 
                                    id="nav-generator" 
                                    class="nav-btn ${this.currentView === 'generator' ? 'nav-btn-active' : ''}"
                                    data-view="generator"
                                    title="Create Email (Ctrl+1)"
                                >
                                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                                    </svg>
                                    <span class="hidden sm:inline">Create Email</span>
                                    <span class="sm:hidden">Create</span>
                                </button>
                                <button 
                                    id="nav-inbox" 
                                    class="nav-btn ${this.currentView === 'inbox' ? 'nav-btn-active' : ''}"
                                    data-view="inbox"
                                    disabled
                                    title="Inbox (Ctrl+2)"
                                >
                                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
                                    </svg>
                                    Inbox
                                </button>
                            </nav>
                            
                            <!-- Theme Toggle Button -->
                            <button 
                                id="theme-toggle"
                                class="p-2.5 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                title="Toggle theme"
                                aria-label="Toggle dark/light theme"
                            >
                                <span id="theme-icon">
                                    ${this.theme === 'dark' 
                                        ? '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>'
                                        : '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>'
                                    }
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>
        `;
    }

    attachEventListeners(onViewChange) {
        const generatorBtn = document.getElementById('nav-generator');
        const inboxBtn = document.getElementById('nav-inbox');
        const themeToggle = document.getElementById('theme-toggle');

        if (generatorBtn) {
            generatorBtn.addEventListener('click', () => {
                this.setActiveView('generator');
                onViewChange('generator');
            });
        }

        if (inboxBtn) {
            inboxBtn.addEventListener('click', () => {
                this.setActiveView('inbox');
                onViewChange('inbox');
            });
        }

        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                this.toggleTheme();
            });
        }

        // Listen for system theme changes
        if (window.matchMedia) {
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
                if (!localStorage.getItem('theme')) {
                    this.applyTheme(e.matches ? 'dark' : 'light');
                    this.updateThemeButton();
                }
            });
        }
    }

    setActiveView(view) {
        this.currentView = view;
        
        const generatorBtn = document.getElementById('nav-generator');
        const inboxBtn = document.getElementById('nav-inbox');

        // Update button states
        if (generatorBtn) {
            generatorBtn.className = `nav-btn ${view === 'generator' ? 'nav-btn-active' : ''}`;
        }
        if (inboxBtn) {
            inboxBtn.className = `nav-btn ${view === 'inbox' ? 'nav-btn-active' : ''}`;
        }
    }

    enableInbox() {
        const inboxBtn = document.getElementById('nav-inbox');
        if (inboxBtn) {
            inboxBtn.disabled = false;
        }
    }

    disableInbox() {
        const inboxBtn = document.getElementById('nav-inbox');
        if (inboxBtn) {
            inboxBtn.disabled = true;
        }
    }
}