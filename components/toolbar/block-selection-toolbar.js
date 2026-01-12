/**
 * Block Selection Toolbar Component
 * Toolbar zum Hinzufügen neuer Blöcke
 */
export const BlockSelectionToolbar = {
    // Toolbar Name
    name: 'blockSelection',
    
    // Alpine.js State Variable
    stateVariable: 'showToolbar',
    
    // Konfiguration
    options: {
        showThemeDropdown: false,
        themeDropdownStateVariable: 'showThemeDropdown'
    },
    
    // HTML-Template für Rendering
    renderHTML(context = {}) {
        const { childBlockTypes = {}, themes = [], showThemeDropdown = false } = context;
        
        return `
            <div x-cloak
                x-show="${this.stateVariable}"
                @click.outside="${this.stateVariable} = false"
                x-transition
                class="mb-4 p-2 bg-gray-100 rounded-lg"
            >
                <!-- Block-Typen - Automatisch aus BLOCK_TYPES generiert -->
                <div class="flex gap-2 flex-wrap mb-3">
                    <template x-for="(config, blockType) in childBlockTypes" :key="blockType">
                        <button 
                            @click="addBlock(blockType)"
                            class="px-3 py-1 bg-white rounded hover:bg-gray-200 text-sm"
                        >
                            <span x-text="config.label || blockType"></span>
                        </button>
                    </template>
                </div>

                <!-- Theme-Vorlagen -->
                <div class="border-t border-gray-300 pt-3">
                    <div class="flex items-center justify-between mb-2">
                        <span class="text-xs font-semibold text-gray-600">🎨 Theme-Vorlagen:</span>
                        <button 
                            @click.stop="${this.options.themeDropdownStateVariable} = !${this.options.themeDropdownStateVariable}"
                            class="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                        >
                            <span x-text="${this.options.themeDropdownStateVariable} ? 'Ausblenden' : 'Anzeigen'"></span>
                            <svg 
                                class="w-4 h-4 transition-transform"
                                :class="${this.options.themeDropdownStateVariable} ? 'rotate-180' : ''"
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                            >
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                            </svg>
                        </button>
                    </div>
                    <div 
                        x-show="${this.options.themeDropdownStateVariable}"
                        x-transition:enter="transition ease-out duration-200"
                        x-transition:enter-start="opacity-0 max-h-0"
                        x-transition:enter-end="opacity-100 max-h-96"
                        x-transition:leave="transition ease-in duration-150"
                        x-transition:leave-start="opacity-100 max-h-96"
                        x-transition:leave-end="opacity-0 max-h-0"
                        class="overflow-hidden"
                    >
                        <div class="space-y-1 max-h-64 overflow-y-auto">
                            <template x-for="theme in themes" :key="theme.name">
                                <button 
                                    @click.stop="loadThemeFromToolbar(theme.name)"
                                    class="w-full px-3 py-2 bg-white rounded hover:bg-blue-50 text-left text-sm flex items-center justify-between group transition-colors"
                                >
                                    <div class="flex-1 min-w-0">
                                        <div class="font-medium text-gray-900 truncate" x-text="theme.name"></div>
                                        <div class="text-xs text-gray-500" x-text="(theme.data || []).length + ' Blöcke'"></div>
                                    </div>
                                    <svg class="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path>
                                    </svg>
                                </button>
                            </template>
                            <div x-show="themes.length === 0" class="px-3 py-2 text-xs text-gray-500 text-center">
                                Keine Themes verfügbar
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },
    
    // Event-Handler
    handlers: {
        // Öffnet die Toolbar
        open() {
            return `${this.stateVariable} = true; ${this.options.themeDropdownStateVariable} = false`;
        },
        
        // Schließt die Toolbar
        close() {
            return `${this.stateVariable} = false`;
        },
        
        // Toggle Theme Dropdown
        toggleThemeDropdown() {
            return `${this.options.themeDropdownStateVariable} = !${this.options.themeDropdownStateVariable}`;
        }
    }
};




