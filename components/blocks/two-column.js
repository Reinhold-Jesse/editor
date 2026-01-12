/**
 * Two Column Block Component
 * Enthält alle Informationen für Two Column Container-Blöcke an einem Ort
 */
import { BLOCK_TYPES } from '../block-types.js';

export const TwoColumnBlock = {
    type: 'twoColumn',
    
    // Konfiguration direkt aus BLOCK_TYPES
    options: BLOCK_TYPES.twoColumn,
    
    // Datenstruktur-Definition
    structure: {
        id: '',
        type: 'twoColumn',
        children: [],
        style: '',
        classes: '',
        createdAt: '',
        updatedAt: ''
    },
    
    // HTML-Template für Rendering
    renderHTML(block, context = {}) {
        return `
            <div x-show="block.type === 'twoColumn'" 
                 class="grid grid-cols-2 gap-4 p-4 border-2 border-dashed border-gray-300 rounded-lg min-h-[200px]">
                <template x-for="(column, columnIndex) in (block.children || [])" :key="column.id">
                    <div class="space-y-2">
                        <div class="text-xs font-semibold text-gray-500 mb-2" x-text="'Spalte ' + (columnIndex + 1)"></div>
                        <template x-for="(child, childIndex) in (column.children || [])" :key="child.id">
                            <!-- Child Blocks werden hier gerendert -->
                        </template>
                        <select 
                            @change.stop="addChildToColumn(block.id, $event.target.value, columnIndex); $event.target.value = ''"
                            @click.stop
                            class="w-full mt-2 p-2 border border-dashed border-gray-400 rounded text-xs text-gray-500 hover:border-blue-500 hover:text-blue-500 bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="" disabled selected>+ Block hinzufügen</option>
                            <template x-for="(type, key) in childBlockTypes" :key="key">
                                <option :value="key" x-text="type.label"></option>
                            </template>
                        </select>
                    </div>
                </template>
            </div>
        `;
    },
    
    // Child-Version (für verschachtelte Container)
    renderChildHTML(child, context = {}) {
        return `
            <div x-show="child.type === 'twoColumn'" class="grid grid-cols-2 gap-2 p-2 border border-dashed border-gray-300 rounded min-h-[150px]">
                <template x-for="(nestedColumn, nestedColumnIndex) in (child.children || [])" :key="nestedColumn.id">
                    <div class="space-y-1">
                        <div class="text-xs font-semibold text-gray-400 mb-1" x-text="'Spalte ' + (nestedColumnIndex + 1)"></div>
                        <template x-for="(nestedChild, nestedChildIndex) in (nestedColumn.children || [])" :key="nestedChild.id">
                            <!-- Nested Child Blocks werden hier gerendert -->
                        </template>
                        <select 
                            @change.stop="addChildToColumn(child.id, $event.target.value, nestedColumnIndex); $event.target.value = ''"
                            @click.stop
                            class="w-full mt-1 p-1 border border-dashed border-gray-300 rounded text-xs text-gray-400 hover:border-blue-400 hover:text-blue-400 bg-white cursor-pointer"
                        >
                            <option value="" disabled selected>+ Block</option>
                            <template x-for="(type, key) in childBlockTypes" :key="key">
                                <option :value="key" x-text="type.label"></option>
                            </template>
                        </select>
                    </div>
                </template>
            </div>
        `;
    },
    
    // Initialisierung
    initialize(block, blockIdCounter) {
        // Container-Blöcke bekommen children Array mit Spalten
        if (!block.children || block.children.length === 0) {
            block.children = [];
            // Erstelle 2 Spalten
            for (let i = 0; i < 2; i++) {
                blockIdCounter++;
                block.children.push({
                    id: `col-${blockIdCounter}-${Date.now()}`,
                    type: 'column',
                    children: []
                });
            }
        }
        return block;
    },
    
    // Sicherstellen dass Block initialisiert ist
    ensureInitialized(block, blockIdCounter) {
        if (!block.children || block.children.length === 0) {
            return this.initialize(block, blockIdCounter);
        }
        // Stelle sicher, dass genau 2 Spalten vorhanden sind
        while (block.children.length < 2) {
            blockIdCounter++;
            block.children.push({
                id: `col-${blockIdCounter}-${Date.now()}`,
                type: 'column',
                children: []
            });
        }
        // Entferne überschüssige Spalten
        while (block.children.length > 2) {
            block.children.pop();
        }
        return block;
    },
    
    // Cleanup beim Typ-Wechsel
    cleanup(block) {
        if (block.children) {
            delete block.children;
        }
        return block;
    }
};




