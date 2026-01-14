/**
 * JSON Export Modal Template
 */
export function getJsonExportModalTemplate() {
    return `
        <!-- JSON Export Modal -->
        <div x-show="showExportModal" x-transition:enter="transition ease-out duration-300"
            x-transition:enter-start="opacity-0" x-transition:enter-end="opacity-100"
            x-transition:leave="transition ease-in duration-200" x-transition:leave-start="opacity-100"
            x-transition:leave-end="opacity-0"
            class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            @click.self="closeExportModal()" style="display: none;">
            <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col" @click.stop
                x-transition:enter="transition ease-out duration-300" x-transition:enter-start="opacity-0 scale-95"
                x-transition:enter-end="opacity-100 scale-100" x-transition:leave="transition ease-in duration-200"
                x-transition:leave-start="opacity-100 scale-100" x-transition:leave-end="opacity-0 scale-95">
                <!-- Modal Header -->
                <div class="flex justify-between items-center p-6 border-b border-gray-200">
                    <h2 class="text-2xl font-bold text-gray-900">JSON Export</h2>
                    <button @click="closeExportModal()" class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Schließen">
                        <svg class="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>

                <!-- Modal Body -->
                <div class="flex-1 overflow-hidden flex flex-col p-6">
                    <!-- JSON Display Area -->
                    <div class="flex-1 flex flex-col mb-4">
                        <div class="flex justify-between items-center mb-2">
                            <label class="block text-sm font-semibold text-gray-700">
                                Aktuelles Editor JSON:
                            </label>
                            <div class="text-sm text-gray-500">
                                <span x-text="blocks.length"></span> Block(s)
                            </div>
                        </div>
                        <textarea x-ref="exportJSONTextarea" x-model="exportJSONText" readonly
                            class="flex-1 w-full p-4 border border-gray-300 rounded-lg font-mono text-sm bg-gray-50 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            spellcheck="false"></textarea>
                    </div>

                    <!-- Info -->
                    <div class="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p class="text-sm text-blue-800">
                            <strong>Tipp:</strong> Sie können den JSON-Code kopieren oder als Datei herunterladen.
                        </p>
                    </div>
                </div>

                <!-- Modal Footer -->
                <div class="flex justify-end gap-3 p-6 border-t border-gray-200">
                    <button @click="copyExportJSON()"
                        :class="exportCopied ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600 hover:bg-gray-700'"
                        class="px-4 py-2 text-white rounded-lg transition-colors flex items-center gap-2">
                        <svg x-show="!exportCopied" class="w-5 h-5" fill="none" stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z">
                            </path>
                        </svg>
                        <svg x-show="exportCopied" class="w-5 h-5" fill="none" stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7">
                            </path>
                        </svg>
                        <span x-text="exportCopied ? 'Kopiert!' : 'Kopieren'"></span>
                    </button>
                    <button @click="downloadExportJSON()"
                        class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                        </svg>
                        Herunterladen
                    </button>
                    <button @click="closeExportModal()"
                        class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
                        Schließen
                    </button>
                </div>
            </div>
        </div>
    `;
}
