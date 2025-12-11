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
        linkTarget: '_self', // '_self', '_blank', etc.
        style: '',
        classes: '',
        createdAt: '',
        updatedAt: ''
    },
    
    // HTML-Template für Rendering
    renderHTML(block, context = {}) {
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
        return `
            <div x-show="block.type === 'link'" class="relative w-full">
                <a 
                    :data-block-id="block.id"
                    :href="block.linkUrl"
                    :target="block.linkTarget || '_self'"
                    :style="block.style || ''"
                    :class="['block-placeholder min-h-[1.5rem] text-blue-600 hover:text-blue-800 hover:underline', block.classes || '']"
                    contenteditable="true"
                    data-placeholder="${this.options.placeholder}"
                    x-init="$nextTick(() => initBlockContent($el, block))"
                    @input="updateBlockContent(block.id, $event.target.innerHTML)"
                    @keydown.enter.prevent="addBlockAfter(block.id, 'paragraph')"
                    @keydown.backspace="handleBackspace(block.id, $event)"
                    @focus="initBlockContent($event.target, block)"
                    @click.stop="openLinkSettingsModal(block.id)"
                    class="cursor-pointer"
                ></a>
            </div>
        `;
    },
    
    // Child-Version (für verschachtelte Blöcke)
    renderChildHTML(child, context = {}) {
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
        return `
            <div x-show="child.type === 'link'" class="relative w-full">
                <a 
                    :data-block-id="child.id"
                    :href="child.linkUrl"
                    :target="child.linkTarget || '_self'"
                    :style="child.style || ''"
                    :class="['block-placeholder min-h-[1.5rem] text-sm text-blue-600 hover:text-blue-800 hover:underline', child.classes || '']"
                    contenteditable="true"
                    data-placeholder="Link-Text..."
                    @input="updateBlockContent(child.id, $event.target.innerHTML)"
                    @keydown.enter.prevent="addChildAfter(block.id, childIndex, 'paragraph')"
                    @keydown.backspace="handleBackspace(child.id, $event)"
                    @focus="initBlockContent($event.target, child)"
                    @click.stop="openLinkSettingsModal(child.id)"
                    class="cursor-pointer"
                ></a>
            </div>
        `;
    },
    
    // Initialisierung
    initialize(block, blockIdCounter) {
        block.linkUrl = '';
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
        if (!block.hasOwnProperty('linkTarget')) {
            block.linkTarget = '_self';
        }
        if (!block.children || !Array.isArray(block.children)) {
            block.children = [];
        }
        return block;
    },
    
    // Cleanup beim Typ-Wechsel
    cleanup(block) {
        delete block.linkUrl;
        delete block.linkTarget;
        if (block.children) {
            delete block.children;
        }
        return block;
    }
};

