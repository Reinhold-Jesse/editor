/**
 * Link Block Component
 * Enthält alle Informationen für Link-Blöcke an einem Ort
 * Ein Link-Block rendert den gesamten Block-Inhalt als klickbaren Link
 */
import { BLOCK_TYPES } from '../block-types.js';

export const LinkBlock = {
    // Block-Typ Name
    type: 'link',
    
    // Konfiguration direkt aus BLOCK_TYPES
    options: BLOCK_TYPES.link,
    
    // Datenstruktur-Definition
    structure: {
        id: '',
        type: 'link',
        children: [],
        linkUrl: '',
        linkText: '', // Optionaler Link-Text
        linkTarget: '_self', // '_self', '_blank', etc.
        style: '',
        classes: '',
        createdAt: '',
        updatedAt: ''
    },
    
    // HTML-Template für Rendering
    // Diese Methode rendert den kompletten Link-Block-Container
    renderHTML(block, context = {}) {
        // Wenn der Block Children unterstützt, verwende renderContainerHTML
        if (block.children && Array.isArray(block.children)) {
            return this.renderContainerHTML(block, context);
        }
        
        // Ansonsten rendere einfachen Link
        const { selectedBlockId, draggingBlockId, hoveredBlockId } = context;
        const isSelected = selectedBlockId === block.id;
        const isDragging = draggingBlockId === block.id;
        
        // Wenn keine URL gesetzt ist, zeige Platzhalter
        if (!block.linkUrl || block.linkUrl.trim() === '') {
            return `
                <div x-show="block.type === 'link'" class="relative w-full">
                    <div 
                        :data-block-id="block.id"
                        class="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-8 bg-gray-50 min-h-[100px] cursor-pointer hover:bg-gray-100 transition-colors w-full"
                        @click.stop="openLinkSettingsModal(block.id)"
                    >
                        <div class="text-center text-gray-500">
                            <svg class="w-12 h-12 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>
                            </svg>
                            <p class="text-sm font-medium">Link hinzufügen</p>
                            <p class="text-xs text-gray-400 mt-1">Klicken Sie hier, um eine URL hinzuzufügen</p>
                        </div>
                    </div>
                </div>
            `;
        }
        
        // Wenn URL gesetzt ist, rendere als Link
        // Bestimme den anzuzeigenden Text: linkText > content > linkUrl
        const displayText = block.linkText || block.content || block.linkUrl || '';
        return `
            <div x-show="block.type === 'link'" class="relative w-full">
                <a 
                    :data-block-id="block.id"
                    :href="block.linkUrl"
                    :target="block.linkTarget || '_self'"
                    :style="block.style || ''"
                    :class="['block-placeholder min-h-[1.5rem] text-blue-600 hover:text-blue-800 hover:underline border-2 border-blue-400 rounded-lg px-3 py-2 inline-block', block.classes || '']"
                    contenteditable="true"
                    data-placeholder="${this.options.placeholder}"
                    x-init="$nextTick(() => initBlockContent($el, block))"
                    @input="updateBlockContent(block.id, $event.target.innerHTML)"
                    @keydown.enter.prevent="addBlockAfter(block.id, 'paragraph')"
                    @keydown.backspace="handleBackspace(block.id, $event)"
                    @focus="initBlockContent($event.target, block)"
                    @click.stop="openLinkSettingsModal(block.id)"
                    class="cursor-pointer"
                >${displayText}</a>
            </div>
        `;
    },
    
    // Child-Version (für verschachtelte Blöcke)
    renderChildHTML(child, context = {}) {
        const { block, childIndex } = context;
        // Wenn keine URL gesetzt ist, zeige Platzhalter
        if (!child.linkUrl || child.linkUrl.trim() === '') {
            return `
                <div x-show="child.type === 'link'" class="relative w-full">
                    <div 
                        :data-block-id="child.id"
                        class="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50 min-h-[80px] cursor-pointer hover:bg-gray-100 transition-colors w-full"
                        @click.stop="openLinkSettingsModal(child.id)"
                    >
                        <div class="text-center text-gray-500">
                            <svg class="w-8 h-8 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>
                            </svg>
                            <p class="text-xs font-medium">Link hinzufügen</p>
                        </div>
                    </div>
                </div>
            `;
        }
        
        // Wenn URL gesetzt ist, rendere als Link
        // Bestimme den anzuzeigenden Text: linkText > content > linkUrl
        const displayText = child.linkText || child.content || child.linkUrl || '';
        const addChildAfterCall = block && childIndex !== undefined 
            ? `addChildAfter(block.id, ${childIndex}, 'paragraph')` 
            : `addBlockAfter(child.id, 'paragraph')`;
        return `
            <div x-show="child.type === 'link'" class="relative w-full">
                <a 
                    :data-block-id="child.id"
                    :href="child.linkUrl"
                    :target="child.linkTarget || '_self'"
                    :style="child.style || ''"
                    :class="['block-placeholder min-h-[1.5rem] text-sm text-blue-600 hover:text-blue-800 hover:underline border-2 border-blue-400 rounded-lg px-3 py-2 inline-block', child.classes || '']"
                    contenteditable="true"
                    data-placeholder="Link-Text..."
                    x-init="$nextTick(() => initBlockContent($el, child))"
                    @input="updateBlockContent(child.id, $event.target.innerHTML)"
                    @keydown.enter.prevent="${addChildAfterCall}"
                    @keydown.backspace="handleBackspace(child.id, $event)"
                    @focus="initBlockContent($event.target, child)"
                    @click.stop="openLinkSettingsModal(child.id)"
                    class="cursor-pointer"
                >${displayText}</a>
            </div>
        `;
    },
    
    // Container-Version (für Link-Blöcke mit Children-Unterstützung)
    // Diese Methode rendert den kompletten Link-Block-Container
    // Die Children werden von der zentralen Rendering-Logik in index.html gerendert
    renderContainerHTML(block, context = {}) {
        return `
            <div x-show="block.type === 'link'" class="relative w-full border-2 border-blue-200 border-dashed rounded-lg p-4 bg-blue-50/30">
                <!-- URL-Hinweis wenn keine URL gesetzt -->
                <div 
                    x-show="!block.linkUrl || block.linkUrl.trim() === ''"
                    class="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-700 flex items-center gap-2"
                >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <span>Keine URL gesetzt. </span>
                    <button 
                        @click.stop="openLinkSettingsModal(block.id)"
                        class="text-yellow-800 underline font-semibold hover:text-yellow-900"
                    >
                        URL hinzufügen
                    </button>
                </div>
                
                <!-- Wenn keine Children vorhanden -->
                <div 
                    x-show="!block.children || block.children.length === 0"
                    class="space-y-2 min-h-[100px]"
                >
                    <!-- Wenn URL gesetzt, zeige Link-Text direkt -->
                    <div x-show="block.linkUrl && block.linkUrl.trim() !== ''">
                        <a 
                            :data-block-id="block.id"
                            :href="block.linkUrl"
                            :target="block.linkTarget || '_self'"
                            :style="block.style || ''"
                            :class="['block-placeholder min-h-[1.5rem] text-blue-600 hover:text-blue-800 hover:underline inline-block border-2 border-blue-400 rounded-lg px-3 py-2', block.classes || '']"
                            contenteditable="true"
                            data-placeholder="Link-Text..."
                            x-init="$nextTick(() => initBlockContent($el, block))"
                            @input="updateBlockContent(block.id, $event.target.innerHTML)"
                            @keydown.enter.prevent="addBlockAfter(block.id, 'paragraph')"
                            @keydown.backspace="handleBackspace(block.id, $event)"
                            @focus="initBlockContent($event.target, block)"
                            @click.stop="openLinkSettingsModal(block.id)"
                            class="cursor-pointer"
                        ><span x-text="block.linkText || block.content || block.linkUrl || ''"></span></a>
                    </div>
                    
                    <!-- Wenn keine URL gesetzt, zeige Platzhalter -->
                    <div 
                        x-show="!block.linkUrl || block.linkUrl.trim() === ''"
                        class="text-gray-400 italic py-4 text-center border-2 border-dashed border-gray-300 rounded-lg"
                    >
                        Keine Inhalte vorhanden
                    </div>
                    
                    <!-- "+ Block hinzufügen" Dropdown -->
                    <select 
                        @change.stop="addChild(block.id, $event.target.value); $event.target.value = ''"
                        @click.stop
                        class="w-full mt-2 p-2 border border-dashed border-gray-400 rounded text-xs text-gray-500 hover:border-blue-500 hover:text-blue-500 bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="" disabled selected>+ Block hinzufügen</option>
                        <template x-for="(type, key) in childBlockTypes" :key="key">
                            <option :value="key" x-text="type.label"></option>
                        </template>
                    </select>
                </div>
                
                <!-- Children Blocks für Link-Blöcke (mit Wrapper wenn URL gesetzt) -->
                <!-- Children werden von der zentralen Rendering-Logik gerendert -->
                <!-- Die Children-Struktur wird hier als Platzhalter gerendert, wird aber von der zentralen Logik gefüllt -->
                <div x-show="block.children && block.children.length > 0" class="mt-2 space-y-2">
                    <!-- Wenn URL gesetzt, wrappe Children in klickbaren Container -->
                    <div 
                        x-show="block.linkUrl && block.linkUrl.trim() !== ''"
                        class="block w-full no-underline text-inherit cursor-pointer"
                        @click.stop="openLinkFollowModal(block.id, $event)"
                    >
                        <div class="space-y-2">
                            <!-- Children werden hier von der zentralen Rendering-Logik gerendert -->
                            <!-- Siehe index.html für die vollständige Children-Rendering-Struktur -->
                        </div>
                    </div>
                    
                    <!-- Wenn keine URL, zeige Children ohne Wrapper -->
                    <div 
                        x-show="!block.linkUrl || block.linkUrl.trim() === ''"
                        class="space-y-2"
                    >
                        <!-- Children werden hier von der zentralen Rendering-Logik gerendert -->
                    </div>
                    
                    <!-- "+ Block hinzufügen" Dropdown für Link-Blöcke -->
                    <select 
                        @change.stop="addChild(block.id, $event.target.value); $event.target.value = ''"
                        @click.stop
                        class="w-full mt-2 p-2 border border-dashed border-gray-400 rounded text-xs text-gray-500 hover:border-blue-500 hover:text-blue-500 bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="" disabled selected>+ Block hinzufügen</option>
                        <template x-for="(type, key) in childBlockTypes" :key="key">
                            <option :value="key" x-text="type.label"></option>
                        </template>
                    </select>
                </div>
            </div>
        `;
    },
    
    // Initialisierung
    initialize(block, blockIdCounter) {
        block.linkUrl = '';
        block.linkText = '';
        block.linkTarget = '_self';
        if (!block.children || !Array.isArray(block.children)) {
            block.children = [];
        }
        return block;
    },
    
    // Sicherstellen dass Block initialisiert ist
    ensureInitialized(block, blockIdCounter) {
        if (!block.hasOwnProperty('linkUrl')) {
            block.linkUrl = '';
        }
        if (!block.hasOwnProperty('linkText')) {
            block.linkText = '';
        }
        if (!block.hasOwnProperty('linkTarget')) {
            block.linkTarget = '_self';
        }
        if (!block.children || !Array.isArray(block.children)) {
            block.children = [];
        }
        
        // Stelle sicher, dass content gesetzt ist, wenn linkText oder linkUrl vorhanden sind
        // Dies ist wichtig für die korrekte Anzeige beim Laden aus JSON
        if (block.linkUrl && (!block.content || block.content.trim() === '')) {
            // Verwende linkText falls vorhanden, sonst linkUrl
            block.content = block.linkText || block.linkUrl;
        } else if (block.linkText && (!block.content || block.content.trim() === '')) {
            block.content = block.linkText;
        }
        
        return block;
    },
    
    // Cleanup beim Typ-Wechsel
    cleanup(block) {
        delete block.linkUrl;
        delete block.linkText;
        delete block.linkTarget;
        if (block.children) {
            delete block.children;
        }
        return block;
    }
};

