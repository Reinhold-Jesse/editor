/**
 * Image Settings Modal Template
 */
export function getImageSettingsModalTemplate() {
    return `
        <!-- Image Settings Modal -->
        <div x-show="showImageSettingsModal" x-transition:enter="transition ease-out duration-300"
            x-transition:enter-start="opacity-0" x-transition:enter-end="opacity-100"
            x-transition:leave="transition ease-in duration-200" x-transition:leave-start="opacity-100"
            x-transition:leave-end="opacity-0"
            class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            @click.self="closeImageSettingsModal()" style="display: none;">
            <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full flex flex-col" @click.stop
                x-transition:enter="transition ease-out duration-300" x-transition:enter-start="opacity-0 scale-95"
                x-transition:enter-end="opacity-100 scale-100" x-transition:leave="transition ease-in duration-200"
                x-transition:leave-start="opacity-100 scale-100" x-transition:leave-end="opacity-0 scale-95">
                <!-- Modal Header -->
                <div class="flex justify-between items-center p-6 border-b border-gray-200">
                    <h2 class="text-2xl font-bold text-gray-900">🖼️ Bild-Einstellungen</h2>
                    <button @click="closeImageSettingsModal()"
                        class="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Schließen">
                        <svg class="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>

                <!-- Tabs -->
                <div class="border-b border-gray-200 px-6">
                    <div class="flex space-x-1">
                        <button @click="imageSettingsActiveTab = 'upload'"
                            :class="imageSettingsActiveTab === 'upload' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'"
                            class="px-4 py-3 text-sm font-medium transition-colors">
                            📁 Bild auswählen
                        </button>
                        <button @click="imageSettingsActiveTab = 'url'"
                            :class="imageSettingsActiveTab === 'url' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'"
                            class="px-4 py-3 text-sm font-medium transition-colors">
                            🔗 URL eingeben
                        </button>
                    </div>
                </div>

                <!-- Modal Body -->
                <div class="flex-1 overflow-y-auto p-6">
                    <!-- Tab: Bild auswählen -->
                    <div x-show="imageSettingsActiveTab === 'upload'" class="space-y-6">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <!-- Linke Spalte: Datei-Auswahl -->
                            <div>
                                <label class="block text-sm font-semibold text-gray-700 mb-2">
                                    Bild auswählen:
                                </label>
                                <!-- Datei-Auswahl Bereich -->
                                <div @click.stop="selectImageFile(imageSettingsBlockId)"
                                    class="border-2 border-dashed border-gray-300 rounded-lg p-8 bg-gray-50 hover:bg-gray-100 hover:border-blue-400 transition-colors cursor-pointer text-center">
                                    <svg class="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor"
                                        viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z">
                                        </path>
                                    </svg>
                                    <p class="text-sm font-medium text-gray-700 mb-1">Datei auswählen</p>
                                    <p class="text-xs text-gray-500">Klicken Sie hier, um ein Bild vom Computer
                                        auszuwählen</p>
                                </div>
                            </div>

                            <!-- Rechte Spalte: Vorschau -->
                            <div>
                                <label class="block text-sm font-semibold text-gray-700 mb-2">
                                    Vorschau:
                                </label>
                                <div
                                    class="border border-gray-300 rounded-lg p-4 bg-gray-50 min-h-[200px] flex items-center justify-center">
                                    <img x-show="imageSettingsUrl" :src="imageSettingsUrl" alt="Vorschau"
                                        class="max-w-full max-h-[300px] h-auto rounded mx-auto"
                                        @error="imageSettingsUrl = ''" />
                                    <div x-show="!imageSettingsUrl" class="text-center text-gray-400">
                                        <svg class="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor"
                                            viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z">
                                            </path>
                                        </svg>
                                        <p class="text-sm">Kein Bild ausgewählt</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Alt-Text und Titel -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                            <!-- Alt-Text -->
                            <div>
                                <label class="block text-sm font-semibold text-gray-700 mb-2">
                                    Alt-Text (für Barrierefreiheit):
                                </label>
                                <input type="text" x-model="imageSettingsAlt" @click.stop @focus.stop
                                    placeholder="Beschreibung des Bildes..."
                                    class="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                                <p class="mt-1 text-xs text-gray-500">
                                    Beschreibung des Bildes für Screenreader
                                </p>
                            </div>

                            <!-- Titel -->
                            <div>
                                <label class="block text-sm font-semibold text-gray-700 mb-2">
                                    Titel (Tooltip):
                                </label>
                                <input type="text" x-model="imageSettingsTitle" @click.stop @focus.stop
                                    placeholder="Titel des Bildes..."
                                    class="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                                <p class="mt-1 text-xs text-gray-500">
                                    Wird beim Hovern über das Bild angezeigt
                                </p>
                            </div>
                        </div>
                    </div>

                    <!-- Tab: URL eingeben -->
                    <div x-show="imageSettingsActiveTab === 'url'" class="space-y-6">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <!-- Linke Spalte: URL-Eingabe -->
                            <div>
                                <label class="block text-sm font-semibold text-gray-700 mb-2">
                                    Bild-URL:
                                </label>
                                <input type="text" x-model="imageSettingsUrl" @click.stop @focus.stop
                                    placeholder="https://example.com/image.jpg"
                                    class="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                                <p class="mt-1 text-xs text-gray-500">
                                    Geben Sie eine URL zu einem Bild ein
                                </p>
                            </div>

                            <!-- Rechte Spalte: Vorschau -->
                            <div>
                                <label class="block text-sm font-semibold text-gray-700 mb-2">
                                    Vorschau:
                                </label>
                                <div
                                    class="border border-gray-300 rounded-lg p-4 bg-gray-50 min-h-[200px] flex items-center justify-center">
                                    <img x-show="imageSettingsUrl" :src="imageSettingsUrl" alt="Vorschau"
                                        class="max-w-full max-h-[300px] h-auto rounded mx-auto"
                                        @error="imageSettingsUrl = ''" />
                                    <div x-show="!imageSettingsUrl" class="text-center text-gray-400">
                                        <svg class="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor"
                                            viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z">
                                            </path>
                                        </svg>
                                        <p class="text-sm">Kein Bild ausgewählt</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Alt-Text und Titel -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                            <!-- Alt-Text -->
                            <div>
                                <label class="block text-sm font-semibold text-gray-700 mb-2">
                                    Alt-Text (für Barrierefreiheit):
                                </label>
                                <input type="text" x-model="imageSettingsAlt" @click.stop @focus.stop
                                    placeholder="Beschreibung des Bildes..."
                                    class="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                                <p class="mt-1 text-xs text-gray-500">
                                    Beschreibung des Bildes für Screenreader
                                </p>
                            </div>

                            <!-- Titel -->
                            <div>
                                <label class="block text-sm font-semibold text-gray-700 mb-2">
                                    Titel (Tooltip):
                                </label>
                                <input type="text" x-model="imageSettingsTitle" @click.stop @focus.stop
                                    placeholder="Titel des Bildes..."
                                    class="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                                <p class="mt-1 text-xs text-gray-500">
                                    Wird beim Hovern über das Bild angezeigt
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Modal Footer -->
                <div class="flex justify-end gap-3 p-6 border-t border-gray-200">
                    <button @click="closeImageSettingsModal()"
                        class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
                        Abbrechen
                    </button>
                    <button @click="saveImageSettings()"
                        class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        Speichern
                    </button>
                </div>
            </div>
        </div>
    `;
}
