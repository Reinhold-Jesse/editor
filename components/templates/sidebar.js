/**
 * Sidebar Component Template
 * Enthält Overlay, Sidebar mit Tabs (Blocks/Themes) und alle Block-Einstellungen
 */
export function getSidebarTemplate() {
    return `
        <!-- Overlay für Sidebar (schließt Sidebar beim Klick) -->
        <div x-show="showSidebar" x-transition:enter="transition ease-out duration-300"
            x-transition:enter-start="opacity-0" x-transition:enter-end="opacity-100"
            x-transition:leave="transition ease-in duration-200" x-transition:leave-start="opacity-100"
            x-transition:leave-end="opacity-0" @click="closeSidebar()"
            class="fixed inset-0 bg-black bg-opacity-20 z-10"></div>

        <!-- Sidebar für Block-Einstellungen -->
        <div x-show="showSidebar" x-transition:enter="transition ease-out duration-300"
            x-transition:enter-start="-translate-x-full opacity-0" x-transition:enter-end="translate-x-0 opacity-100"
            x-transition:leave="transition ease-in duration-200" x-transition:leave-start="translate-x-0 opacity-100"
            x-transition:leave-end="-translate-x-full opacity-0"
            class="w-80 bg-white border-r border-gray-200 shadow-xl overflow-y-auto z-20 fixed left-0 top-0 h-screen"
            @click.stop>
            <template x-if="showSidebar">
                <div class="p-4" @click.stop>
                    <div class="flex justify-between items-center mb-4" @click.stop>
                        <h2 class="text-xl font-bold text-gray-900">Einstellungen</h2>
                        <button @click.stop="closeSidebar()" class="p-1 hover:bg-gray-100 rounded" title="Schließen">
                            ×
                        </button>
                    </div>

                    <!-- Tabs für Sidebar-Navigation -->
                    <div class="flex gap-2 mb-4 border-b border-gray-200" @click.stop>
                        <button @click.stop="sidebarTab = 'blocks'"
                            :class="sidebarTab === 'blocks' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'"
                            class="px-4 py-2 font-semibold transition-colors">
                            Blöcke
                        </button>
                        <button @click.stop="sidebarTab = 'themes'"
                            :class="sidebarTab === 'themes' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'"
                            class="px-4 py-2 font-semibold transition-colors">
                            Themes
                        </button>
                    </div>

                    <!-- Themes Tab -->
                    <div x-show="sidebarTab === 'themes'" class="space-y-4" @click.stop>
                        <div class="flex gap-2">
                            <button @click.stop="openSaveThemeModal()"
                                class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M12 4v16m8-8H4"></path>
                                </svg>
                                Speichern
                            </button>
                            <button @click.stop="openImportThemeModal()"
                                class="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 text-sm">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12">
                                    </path>
                                </svg>
                                Import
                            </button>
                        </div>

                        <div class="border-t border-gray-200 pt-4">
                            <h3 class="text-sm font-semibold text-gray-700 mb-3">Gespeicherte Themes</h3>
                            <div class="space-y-2 max-h-96 overflow-y-auto">
                                <template x-for="theme in themes" :key="theme.name">
                                    <div
                                        class="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                        <div class="flex-1 min-w-0">
                                            <div class="font-medium text-gray-900 truncate" x-text="theme.name"></div>
                                            <div class="text-xs text-gray-500"
                                                x-text="new Date(theme.createdAt).toLocaleDateString('de-DE')"></div>
                                        </div>
                                        <div class="flex gap-1 ml-2">
                                            <button @click.stop="showLoadThemeConfirm(theme.name)"
                                                class="p-1.5 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                                                title="Theme laden">
                                                <svg class="w-4 h-4" fill="none" stroke="currentColor"
                                                    viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round"
                                                        stroke-width="2"
                                                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12">
                                                    </path>
                                                </svg>
                                            </button>
                                            <button @click.stop="openEditThemeModal(theme.name)"
                                                class="p-1.5 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
                                                title="Theme bearbeiten">
                                                <svg class="w-4 h-4" fill="none" stroke="currentColor"
                                                    viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round"
                                                        stroke-width="2"
                                                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z">
                                                    </path>
                                                </svg>
                                            </button>
                                            <button @click.stop="showDeleteThemeConfirm(theme.name)"
                                                class="p-1.5 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                                                title="Theme löschen">
                                                <svg class="w-4 h-4" fill="none" stroke="currentColor"
                                                    viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round"
                                                        stroke-width="2"
                                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16">
                                                    </path>
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </template>
                                <div x-show="themes.length === 0" class="text-center text-gray-500 py-8 text-sm">
                                    <p>Keine Themes gespeichert</p>
                                    <p class="text-xs mt-1">Speichere dein erstes Theme oben</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Blocks Tab -->
                    <div x-show="sidebarTab === 'blocks'">
                        <div x-show="selectedBlockId === null" class="text-center text-gray-500 py-8">
                            <p>Kein Block ausgewählt</p>
                            <p class="text-sm mt-2">Wähle einen Block aus, um seine Einstellungen zu bearbeiten</p>
                        </div>

                        <template x-for="block in getAllBlocks()" :key="block.id">
                            <div x-show="block.id === selectedBlockId" class="space-y-4">
                                <!-- Block-Typ ändern -->
                                <div @click.stop>
                                    <label class="block text-sm font-semibold text-gray-700 mb-2">
                                        Block-Typ:
                                    </label>
                                    <select x-model="block.type" @change="changeBlockType(block.id, block.type)"
                                        @click.stop
                                        class="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                                        <template x-for="(config, blockType) in childBlockTypes" :key="blockType">
                                            <option :value="blockType">
                                                <span x-text="config.icon ? config.icon + ' ' : ''"></span>
                                                <span x-text="config.label || blockType"></span>
                                            </option>
                                        </template>
                                    </select>
                                </div>

                                <!-- Tailwind CSS Klassen Editor -->
                                <div @click.stop>
                                    <label class="block text-sm font-semibold text-gray-700 mb-2">
                                        Tailwind CSS Klassen:
                                    </label>
                                    <input type="text" x-model="block.classes"
                                        @input="block.updatedAt = new Date().toISOString()" @click.stop @focus.stop
                                        placeholder="z.B. text-red-500 bg-yellow-200 p-4 rounded-lg"
                                        class="w-full p-2 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                                    <div class="mt-2 flex gap-2"
                                        x-show="block.classes && block.classes.trim().length > 0">
                                        <button @click.stop="clearBlockClasses(block.id)"
                                            class="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600">
                                            Zurücksetzen
                                        </button>
                                    </div>
                                    <div class="mt-2 text-xs text-gray-500">
                                        Beispiel: <code
                                            class="bg-gray-100 px-1 rounded">text-blue-600 bg-gray-100 p-4 rounded-lg shadow-md</code>
                                    </div>
                                </div>

                                <!-- HTML ID Editor -->
                                <div @click.stop class="pt-4 border-t border-gray-200">
                                    <label class="block text-sm font-semibold text-gray-700 mb-2">
                                        HTML ID (Optional):
                                    </label>
                                    <input type="text" x-model="block.htmlId"
                                        @input="block.updatedAt = new Date().toISOString()" @click.stop @focus.stop
                                        placeholder="z.B. my-custom-id"
                                        class="w-full p-2 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                                    <div class="mt-2 flex gap-2"
                                        x-show="block.htmlId && block.htmlId.trim().length > 0">
                                        <button @click.stop="clearBlockHtmlId(block.id)"
                                            class="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600">
                                            Zurücksetzen
                                        </button>
                                    </div>
                                    <div class="mt-2 text-xs text-gray-500">
                                        Beispiel: <code class="bg-gray-100 px-1 rounded">my-section-header</code>
                                    </div>
                                </div>

                                <!-- CSS Editor (Optional) -->
                                <div @click.stop class="pt-4 border-t border-gray-200">
                                    <label class="block text-sm font-semibold text-gray-700 mb-2">
                                        Inline CSS (Optional):
                                    </label>
                                    <textarea x-model="block.style" @input="block.updatedAt = new Date().toISOString()"
                                        @click.stop @focus.stop
                                        placeholder="z.B. color: red; background-color: yellow; padding: 10px;"
                                        class="w-full p-2 border border-gray-300 rounded-lg font-mono text-sm h-32 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"></textarea>
                                    <div class="mt-2 flex gap-2" x-show="block.style && block.style.trim().length > 0">
                                        <button @click.stop="clearBlockStyle(block.id)"
                                            class="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600">
                                            Zurücksetzen
                                        </button>
                                    </div>
                                    <div class="mt-2 text-xs text-gray-500">
                                        Beispiel: <code
                                            class="bg-gray-100 px-1 rounded">color: blue; font-size: 18px; margin: 10px;</code>
                                    </div>
                                </div>

                                <!-- Block-spezifische Einstellungen aus Komponente -->
                                <div x-html="renderBlockSettings(block)"
                                    x-effect="updateBlockSettingsReactive(block, $el)"></div>

                                <!-- Cell Merge Instructions -->
                                <div class="mb-4 p-2 bg-blue-50 rounded text-xs text-gray-600">
                                    <strong>Zellen verbinden:</strong> Wähle eine Zelle aus und verwende die
                                    Kontextmenü-Optionen oder markiere mehrere Zellen für das Verbinden.
                                </div>

                                <!-- Table Info -->
                                <div class="text-xs text-gray-500 space-y-1">
                                    <div><strong>Zeilen:</strong> <span
                                            x-text="(block.tableData?.cells || []).length || 0"></span></div>
                                    <div><strong>Spalten:</strong> <span
                                            x-text="(block.tableData?.cells[0]?.length || 0)"></span></div>
                                </div>
                            </div>

                            <!-- Checklist Management -->
                            <div x-show="block.type === 'checklist'" class="pt-4 border-t border-gray-200" @click.stop>
                                <label class="block text-sm font-semibold text-gray-700 mb-2">
                                    Checkliste-Einstellungen:
                                </label>

                                <!-- Item Management -->
                                <div class="mb-4">
                                    <label class="block text-xs font-semibold text-gray-600 mb-2">Einträge:</label>
                                    <div class="flex gap-2">
                                        <button @click.stop="addChecklistItem(block.id, 'top')"
                                            class="flex-1 px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600">
                                            + Oben
                                        </button>
                                        <button @click.stop="addChecklistItem(block.id, 'bottom')"
                                            class="flex-1 px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600">
                                            + Unten
                                        </button>
                                    </div>
                                </div>

                                <!-- Checklist Info -->
                                <div class="text-xs text-gray-500 space-y-1">
                                    <div><strong>Einträge:</strong> <span
                                            x-text="(block.checklistData?.items || []).length || 0"></span></div>
                                </div>
                            </div>

                            <!-- Children Management -->
                            <div class="pt-4 border-t border-gray-200" @click.stop>
                                <label class="block text-sm font-semibold text-gray-700 mb-2">
                                    Children (Verschachtelte Blöcke):
                                </label>
                                <div class="space-y-2 mb-2">
                                    <template x-for="(child, childIndex) in (block.children || [])" :key="child.id">
                                        <div class="flex items-center gap-2 p-2 bg-gray-50 rounded" @click.stop>
                                            <span class="text-xs text-gray-600 flex-1"
                                                x-text="child.type + ': ' + (child.content || 'leer')"></span>
                                            <button @click.stop="removeChild(block.id, childIndex)"
                                                class="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600">
                                                ×
                                            </button>
                                        </div>
                                    </template>
                                    <div x-show="!block.children || block.children.length === 0"
                                        class="text-xs text-gray-400 italic">
                                        Keine Children vorhanden
                                    </div>
                                </div>
                                <div class="flex gap-2">
                                    <select x-ref="childTypeSelect" @click.stop @change.stop
                                        class="flex-1 p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500">
                                        <option value="" disabled selected>Block-Typ wählen...</option>
                                        <template x-for="(type, key) in childBlockTypes" :key="key">
                                            <option :value="key" x-text="type.label"></option>
                                        </template>
                                    </select>
                                    <button @click.stop="addChild(block.id, $refs.childTypeSelect.value)"
                                        class="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
                                        + Child
                                    </button>
                                </div>
                            </div>

                            <!-- Block-Info -->
                            <div class="pt-4 border-t border-gray-200" @click.stop>
                                <div class="text-xs text-gray-500 space-y-1">
                                    <div><strong>ID:</strong> <span x-text="block.id"></span></div>
                                    <div x-show="block.createdAt"><strong>Erstellt:</strong> <span
                                            x-text="new Date(block.createdAt).toLocaleString('de-DE')"></span></div>
                                    <div x-show="block.updatedAt"><strong>Geändert:</strong> <span
                                            x-text="new Date(block.updatedAt).toLocaleString('de-DE')"></span></div>
                                    <div><strong>Children:</strong> <span x-text="(block.children || []).length"></span>
                                    </div>
                                </div>
                            </div>
                    </div>
            </template>
        </div>
    </div>
    </template>
    </div>
    `;
}
