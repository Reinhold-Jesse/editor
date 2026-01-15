/**
 * Code Block Component
 * Enthält alle Informationen für Code-Blöcke an einem Ort
 */
import { BLOCK_TYPES } from '../block-types.js';

export const CodeBlock = {
    type: 'code',
    
    // Konfiguration direkt aus BLOCK_TYPES
    options: BLOCK_TYPES.code,
    
    structure: {
        id: '',
        type: 'code',
        content: '',
        style: '',
        classes: '',
        htmlId: '',
        createdAt: '',
        updatedAt: ''
    },
    
    renderHTML(block, context = {}) {
        return `
            <div x-show="block.type === 'code'">
                <pre 
                    :data-block-id="block.id"
                    :id="block.htmlId || null"
                    :style="block.style || ''"
                    :class="['block-placeholder bg-gray-900 text-green-400 p-4 rounded font-mono text-sm min-h-[4rem] whitespace-pre-wrap', block.classes || '']"
                    contenteditable="true"
                    data-placeholder="${this.options.placeholder}"
                    x-init="$nextTick(() => initBlockContent($el, block, true))"
                    @input="updateBlockContent(block.id, $event.target.textContent)"
                    @blur="commitBlockContent(block.id, $event.target.textContent)"
                    @keydown.enter.prevent="addBlockAfter(block.id, 'paragraph')"
                    @keydown.backspace="handleBackspace(block.id, $event)"
                    @focus="initBlockContent($event.target, block, true)"
                ></pre>
            </div>
        `;
    },
    
    renderChildHTML(child, context = {}) {
        return `
            <div x-show="child.type === 'code'">
                <pre 
                    :data-block-id="child.id"
                    :id="child.htmlId || null"
                    :style="child.style || ''"
                    :class="['block-placeholder bg-gray-900 text-green-400 p-3 rounded font-mono text-xs min-h-[3rem] whitespace-pre-wrap', child.classes || '']"
                    contenteditable="true"
                    data-placeholder="Child Code..."
                    @input="updateBlockContent(child.id, $event.target.textContent)"
                    @blur="commitBlockContent(child.id, $event.target.textContent)"
                    @keydown.enter.prevent="addChildAfter(block.id, childIndex, 'paragraph')"
                    @keydown.backspace="handleBackspace(child.id, $event)"
                    @focus="initBlockContent($event.target, child, true)"
                ></pre>
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




