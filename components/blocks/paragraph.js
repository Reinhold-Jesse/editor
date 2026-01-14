/**
 * Paragraph Block Component
 * Enthält alle Informationen für Paragraph-Blöcke an einem Ort
 */
import { BLOCK_TYPES } from '../block-types.js';

export const ParagraphBlock = {
    // Block-Typ Name
    type: 'paragraph',
    
    // Konfiguration direkt aus BLOCK_TYPES
    options: BLOCK_TYPES.paragraph,
    
    // Datenstruktur-Definition
    structure: {
        id: '',
        type: 'paragraph',
        content: '',
        style: '',
        classes: '',
        htmlId: '',
        createdAt: '',
        updatedAt: ''
    },
    
    // HTML-Template für Rendering
    renderHTML(block, context = {}) {
        const { selectedBlockId, draggingBlockId, hoveredBlockId } = context;
        const isSelected = selectedBlockId === block.id;
        const isDragging = draggingBlockId === block.id;
        
        return `
            <div x-show="block.type === 'paragraph'">
                <div 
                    :data-block-id="block.id"
                    :id="block.htmlId || null"
                    :style="block.style || ''"
                    :class="['block-placeholder min-h-[1.5rem]', block.classes || '']"
                    contenteditable="true"
                    data-placeholder="${this.options.placeholder}"
                    x-init="$nextTick(() => initBlockContent($el, block))"
                    @input="updateBlockContent(block.id, $event.target.innerHTML)"
                    @keydown.enter.prevent="addBlockAfter(block.id, 'paragraph')"
                    @keydown.backspace="handleBackspace(block.id, $event)"
                    @focus="initBlockContent($event.target, block)"
                ></div>
            </div>
        `;
    },
    
    // Child-Version (für verschachtelte Blöcke)
    renderChildHTML(child, context = {}) {
        return `
            <div x-show="child.type === 'paragraph'">
                <div 
                    :data-block-id="child.id"
                    :id="child.htmlId || null"
                    :style="child.style || ''"
                    :class="['block-placeholder min-h-[1.5rem] text-sm', child.classes || '']"
                    contenteditable="true"
                    data-placeholder="Child Absatz..."
                    @input="updateBlockContent(child.id, $event.target.innerHTML)"
                    @keydown.enter.prevent="addChildAfter(block.id, childIndex, 'paragraph')"
                    @keydown.backspace="handleBackspace(child.id, $event)"
                    @focus="initBlockContent($event.target, child)"
                ></div>
            </div>
        `;
    },
    
    // Initialisierung (aus block-components.js)
    initialize(block, blockIdCounter) {
        // Standard-Blöcke benötigen keine spezielle Initialisierung
        return block;
    },
    
    // Sicherstellen dass Block initialisiert ist
    ensureInitialized(block, blockIdCounter) {
        // Standard-Blöcke sind immer initialisiert
        return block;
    },
    
    // Cleanup beim Typ-Wechsel
    cleanup(block) {
        // Keine Cleanup-Logik für Standard-Blöcke
        return block;
    }
};




