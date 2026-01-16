/**
 * Block Toolbar Template
 * Toolbar zum Hinzufügen neuer Blöcke mit Theme-Vorlagen
 */
export function getBlockToolbarTemplate() {
    return `
        <!-- Toolbar für neuen Block -->
        <div x-cloak x-show="showToolbar" x-transition
            class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            @click.self="closeBlockToolbar()">
            <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col" @click.stop
                x-transition:enter="transition ease-out duration-300" x-transition:enter-start="opacity-0 scale-95"
                x-transition:enter-end="opacity-100 scale-100" x-transition:leave="transition ease-in duration-200"
                x-transition:leave-start="opacity-100 scale-100" x-transition:leave-end="opacity-0 scale-95">
                <!-- Modal Header -->
                <div class="flex justify-between items-center p-6 border-b border-gray-200">
                    <h2 class="text-2xl font-bold text-gray-900">Block hinzufügen</h2>
                    <button @click="closeBlockToolbar()" class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Schließen">
                        <svg class="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>

                <!-- Modal Body -->
                <div class="flex-1 overflow-auto p-6">
                    <!-- Tabs -->
                    <div class="flex gap-2 mb-4 border-b border-gray-200">
                        <button @click="showToolbarTab = 'blocks'"
                            :class="showToolbarTab === 'blocks' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'"
                            class="px-4 py-2 font-semibold transition-colors">
                            Block hinzufügen
                        </button>
                        <button @click="showToolbarTab = 'themes'"
                            :class="showToolbarTab === 'themes' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'"
                            class="px-4 py-2 font-semibold transition-colors">
                            Theme Vorlagen
                        </button>
                    </div>

                    <!-- Tab: Block hinzufügen -->
                    <div x-show="showToolbarTab === 'blocks'">
                        <!-- Block-Typen - Automatisch aus BLOCK_TYPES generiert -->
                        <div class="flex gap-2 flex-wrap">
                            <template x-for="(config, blockType) in childBlockTypes" :key="blockType">
                                <button @click="addBlock(blockType)"
                                    class="px-3 py-2 bg-gray-100 rounded hover:bg-gray-200 text-sm transition-colors">
                                    <span x-text="config.label || blockType"></span>
                                </button>
                            </template>
                        </div>
                    </div>

                    <!-- Tab: Theme Vorlagen -->
                    <div x-show="showToolbarTab === 'themes'">
                        <div class="flex items-center justify-between mb-2">
                            <span class="text-xs font-semibold text-gray-600">🎨 Theme-Vorlagen:</span>
                        </div>
                        <div class="space-y-1 max-h-64 overflow-y-auto">
                            <template x-for="theme in themes" :key="theme.name">
                                <button @click.stop="loadThemeFromToolbar(theme.name); closeBlockToolbar()"
                                    class="w-full px-3 py-2 bg-white rounded hover:bg-blue-50 text-left text-sm flex items-center justify-between group transition-colors">
                                    <div class="flex-1 min-w-0">
                                        <div class="font-medium text-gray-900 truncate" x-text="theme.name"></div>
                                        <div class="text-xs text-gray-500"
                                            x-text="(theme.data || []).length + ' Blöcke'"></div>
                                    </div>
                                    <svg class="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors"
                                        fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12">
                                        </path>
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
        </div>
    `;
}
