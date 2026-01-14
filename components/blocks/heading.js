/**
 * Heading Block Components (H1, H2, H3)
 * Enthält alle Informationen für Heading-Blöcke an einem Ort
 */
import { BLOCK_TYPES } from '../block-types.js';

const createHeadingBlock = (level) => ({
    type: `heading${level}`,
    
    // Konfiguration direkt aus BLOCK_TYPES
    options: BLOCK_TYPES[`heading${level}`],
    
    structure: {
        id: '',
        type: `heading${level}`,
        content: '',
        style: '',
        classes: '',
        htmlId: '',
        createdAt: '',
        updatedAt: ''
    },
    
    renderHTML(block, context = {}) {
        return `
            <div x-show="block.type === 'heading${level}'">
                <h${level} 
                    :data-block-id="block.id"
                    :id="block.htmlId || null"
                    :style="block.style || ''"
                    :class="['block-placeholder text-${level === 1 ? '3xl' : level === 2 ? '2xl' : 'xl'} font-bold mb-2 min-h-[${level === 1 ? '2rem' : level === 2 ? '1.75rem' : '1.5rem'}]', block.classes || '']"
                    contenteditable="true"
                    data-placeholder="${this.options.placeholder}"
                    x-init="$nextTick(() => initBlockContent($el, block))"
                    @input="updateBlockContent(block.id, $event.target.innerHTML)"
                    @keydown.enter.prevent="addBlockAfter(block.id, 'paragraph')"
                    @keydown.backspace="handleBackspace(block.id, $event)"
                    @focus="initBlockContent($event.target, block)"
                ></h${level}>
            </div>
        `;
    },
    
    renderChildHTML(child, context = {}) {
        const childClasses = level === 1 ? 'text-2xl' : level === 2 ? 'text-xl' : 'text-lg';
        return `
            <div x-show="child.type === 'heading${level}'">
                <h${level} 
                    :data-block-id="child.id"
                    :id="child.htmlId || null"
                    :style="child.style || ''"
                    :class="['block-placeholder ${childClasses} font-bold mb-2 min-h-[${level === 1 ? '1.75rem' : '1.5rem'}]', child.classes || '']"
                    contenteditable="true"
                    data-placeholder="Child Überschrift ${level}..."
                    x-init="$nextTick(() => initBlockContent($el, child))"
                    @input="updateBlockContent(child.id, $event.target.innerHTML)"
                    @keydown.enter.prevent="addChildAfter((column && column.id) || (block && block.id), childIndex, 'paragraph')"
                    @keydown.backspace="handleBackspace(child.id, $event)"
                    @focus="initBlockContent($event.target, child)"
                ></h${level}>
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
    },
    
    // Einstellungen HTML für Sidebar (Standard: keine speziellen Einstellungen)
    getSettingsHTML(block, context = {}) {
        return '';
    }
});

export const Heading1Block = createHeadingBlock(1);
export const Heading2Block = createHeadingBlock(2);
export const Heading3Block = createHeadingBlock(3);




