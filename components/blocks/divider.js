/**
 * Divider Block Component
 * Enthält alle Informationen für Divider-Blöcke an einem Ort
 */
import { BLOCK_TYPES } from '../block-types.js';

export const DividerBlock = {
    type: 'divider',
    
    // Konfiguration direkt aus BLOCK_TYPES
    options: BLOCK_TYPES.divider,
    
    structure: {
        id: '',
        type: 'divider',
        style: '',
        classes: '',
        createdAt: '',
        updatedAt: ''
    },
    
    renderHTML(block, context = {}) {
        return `
            <div x-show="block.type === 'divider'">
                <hr class="border-t-2 border-gray-300 my-4">
            </div>
        `;
    },
    
    renderChildHTML(child, context = {}) {
        return this.renderHTML(child, context);
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




