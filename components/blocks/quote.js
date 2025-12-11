/**
 * Quote Block Component
 * Enthält alle Informationen für Quote-Blöcke an einem Ort
 */
import { BLOCK_TYPES } from '../block-types.js';

export const QuoteBlock = {
    type: 'quote',
    
    // Konfiguration direkt aus BLOCK_TYPES
    options: BLOCK_TYPES.quote,
    
    structure: {
        id: '',
        type: 'quote',
        content: '',
        style: '',
        classes: '',
        createdAt: '',
        updatedAt: ''
    },
    
    renderHTML(block, context = {}) {
        return `
            <div x-show="block.type === 'quote'">
                <blockquote 
                    :data-block-id="block.id"
                    :style="block.style || ''"
                    :class="['block-placeholder border-l-4 border-blue-500 pl-4 italic text-gray-700 min-h-[1.5rem]', block.classes || '']"
                    contenteditable="true"
                    data-placeholder="${this.options.placeholder}"
                    x-init="$nextTick(() => initBlockContent($el, block))"
                    @input="updateBlockContent(block.id, $event.target.innerHTML)"
                    @keydown.enter.prevent="addBlockAfter(block.id, 'paragraph')"
                    @keydown.backspace="handleBackspace(block.id, $event)"
                    @focus="initBlockContent($event.target, block)"
                ></blockquote>
            </div>
        `;
    },
    
    renderChildHTML(child, context = {}) {
        return `
            <div x-show="child.type === 'quote'">
                <blockquote 
                    :data-block-id="child.id"
                    :style="child.style || ''"
                    :class="['block-placeholder border-l-4 border-blue-500 pl-3 italic text-gray-700 min-h-[1.5rem] text-sm', child.classes || '']"
                    contenteditable="true"
                    data-placeholder="Child Zitat..."
                    @input="updateBlockContent(child.id, $event.target.innerHTML)"
                    @keydown.enter.prevent="addChildAfter(block.id, childIndex, 'paragraph')"
                    @keydown.backspace="handleBackspace(child.id, $event)"
                    @focus="initBlockContent($event.target, child)"
                ></blockquote>
            </div>
        `;
    },
    
    initialize(block, blockIdCounter) {
        return block;
    },
    
    ensureInitialized(block, blockIdCounter) {
        return block;
    },
    
    cleanup(block) {
        return block;
    }
};

