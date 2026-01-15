/**
 * Image Block Component
 * Enthält alle Informationen für Image-Blöcke an einem Ort
 * Ein Image-Block rendert ein Bild mit Platzhalter wenn kein Bild gesetzt ist
 */
import { BLOCK_TYPES } from '../block-types.js';

export const ImageBlock = {
    // Block-Typ Name
    type: 'image',
    
    // Konfiguration direkt aus BLOCK_TYPES
    options: BLOCK_TYPES.image,
    
    // Datenstruktur-Definition
    structure: {
        id: '',
        type: 'image',
        imageUrl: '',
        imageAlt: '',
        imageTitle: '',
        style: '',
        classes: '',
        htmlId: '',
        createdAt: '',
        updatedAt: ''
    },
    
    // HTML-Template für Rendering
    // Diese Methode rendert den kompletten Image-Block-Container
    renderHTML(block, context = {}) {
        // Wenn kein Bild gesetzt ist, zeige Platzhalter
        if (!block.imageUrl || block.imageUrl.trim() === '') {
            return `
                <div x-show="block.type === 'image'" class="relative w-full">
                    <div 
                        :data-block-id="block.id"
                        class="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-8 bg-gray-50 min-h-[200px] cursor-pointer hover:bg-gray-100 transition-colors w-full"
                        @click.stop="openImageSettingsModal(block.id)"
                    >
                        <div class="text-center text-gray-500">
                            <svg class="w-12 h-12 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                            </svg>
                            <p class="text-sm font-medium">Bild auswählen</p>
                            <p class="text-xs text-gray-400 mt-1">Klicken Sie hier, um ein Bild hinzuzufügen</p>
                        </div>
                    </div>
                </div>
            `;
        }
        
        // Wenn Bild gesetzt ist, rendere das Bild
        return `
            <div x-show="block.type === 'image'" class="relative w-full">
                <img 
                    :data-block-id="block.id"
                    :id="block.htmlId || null"
                    :src="block.imageUrl"
                    :alt="block.imageAlt || ''"
                    :title="block.imageTitle || ''"
                    :style="block.style || ''"
                    :class="['w-full h-auto rounded cursor-pointer', block.classes || '']"
                    @click.stop="openImageSettingsModal(block.id)"
                />
            </div>
        `;
    },
    
    // Child-Version (für verschachtelte Blöcke)
    renderChildHTML(child, context = {}) {
        const { block, childIndex } = context;
        
        // Wenn kein Bild gesetzt ist, zeige Platzhalter
        if (!child.imageUrl || child.imageUrl.trim() === '') {
            return `
                <div x-show="child.type === 'image'" class="relative w-full">
                    <div 
                        :data-block-id="child.id"
                        class="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50 min-h-[150px] cursor-pointer hover:bg-gray-100 transition-colors w-full"
                        @click.stop="openImageSettingsModal(child.id)"
                    >
                        <div class="text-center text-gray-500">
                            <svg class="w-8 h-8 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                            </svg>
                            <p class="text-xs font-medium">Bild auswählen</p>
                        </div>
                    </div>
                </div>
            `;
        }
        
        // Wenn Bild gesetzt ist, rendere das Bild
        return `
            <div x-show="child.type === 'image'" class="relative w-full">
                <img 
                    :data-block-id="child.id"
                    :id="child.htmlId || null"
                    :src="child.imageUrl"
                    :alt="child.imageAlt || ''"
                    :title="child.imageTitle || ''"
                    :style="child.style || ''"
                    :class="['w-full h-auto rounded cursor-pointer', child.classes || '']"
                    @click.stop="openImageSettingsModal(child.id)"
                />
            </div>
        `;
    },
    
    // Initialisierung
    initialize(block, blockIdCounter) {
        block.imageUrl = '';
        block.imageAlt = '';
        block.imageTitle = '';
        return block;
    },
    
    // Sicherstellen dass Block initialisiert ist
    ensureInitialized(block, blockIdCounter) {
        if (!block.hasOwnProperty('imageUrl')) {
            block.imageUrl = '';
        }
        if (!block.hasOwnProperty('imageAlt')) {
            block.imageAlt = '';
        }
        if (!block.hasOwnProperty('imageTitle')) {
            block.imageTitle = '';
        }
        return block;
    },
    
    // Cleanup beim Typ-Wechsel
    cleanup(block) {
        delete block.imageUrl;
        delete block.imageAlt;
        delete block.imageTitle;
        return block;
    }
};




