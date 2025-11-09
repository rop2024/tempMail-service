export class Header {
    constructor() {
        this.currentView = 'generator';
    }

    render() {
        return `
            <header class="bg-white shadow-sm border-b">
                <div class="container mx-auto px-4">
                    <div class="flex justify-between items-center py-4">
                        <div class="flex items-center space-x-3">
                            <div class="bg-blue-600 text-white p-2 rounded-lg">
                                <i class="fas fa-envelope text-xl"></i>
                            </div>
                            <div>
                                <h1 class="text-2xl font-bold text-gray-800">TempMail</h1>
                                <p class="text-sm text-gray-600">Secure Temporary Email</p>
                            </div>
                        </div>
                        
                        <nav class="flex space-x-1">
                            <button 
                                id="nav-generator" 
                                class="nav-btn ${this.currentView === 'generator' ? 'nav-btn-active' : ''}"
                                data-view="generator"
                            >
                                <i class="fas fa-plus-circle mr-2"></i>
                                Create Email
                            </button>
                            <button 
                                id="nav-inbox" 
                                class="nav-btn ${this.currentView === 'inbox' ? 'nav-btn-active' : ''}"
                                data-view="inbox"
                                disabled
                            >
                                <i class="fas fa-inbox mr-2"></i>
                                Inbox
                            </button>
                        </nav>
                    </div>
                </div>
            </header>
        `;
    }

    attachEventListeners(onViewChange) {
        const generatorBtn = document.getElementById('nav-generator');
        const inboxBtn = document.getElementById('nav-inbox');

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