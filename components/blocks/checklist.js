/**
 * Checklist Block Component
 * Enthält alle Informationen für Checklist-Blöcke an einem Ort
 */
import { BLOCK_TYPES } from '../block-types.js';
import { ChecklistManagement } from '../checklist-management.js';
import { Utils } from '../utils.js';

export const ChecklistBlock = {
    type: 'checklist',
    
    // Konfiguration direkt aus BLOCK_TYPES
    options: BLOCK_TYPES.checklist,
    
    // Datenstruktur-Definition
    structure: {
        id: '',
        type: 'checklist',
        checklistData: null,
        style: '',
        classes: '',
        htmlId: '',
        createdAt: '',
        updatedAt: ''
    },
    
    // HTML-Template für Rendering
    renderHTML(block, context = {}) {
        const blockId = block.id || '';
        const items = block.checklistData?.items || [];
        const itemsLength = items.length;
        
        return `
            <div x-show="block.type === 'checklist'" 
                 data-block-id="${blockId}"
                 :id="block.htmlId || null"
                 :style="block.style || ''"
                 :class="['space-y-2 p-4 border border-gray-300 rounded-lg', block.classes || '']">
                <template x-for="(item, itemIndex) in (block.checklistData?.items || [])" :key="item.id">
                    <div class="flex items-start gap-3 group hover:bg-gray-50 p-2 rounded transition-colors">
                        <!-- Checkbox -->
                        <input 
                            type="checkbox"
                            :checked="item.checked || false"
                            @change="toggleChecklistItem('${blockId}', itemIndex)"
                            @click.stop
                            class="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                        />
                        <!-- Text Input -->
                        <div 
                            :data-item-id="item.id"
                            data-block-id="${blockId}"
                            :data-item-index="itemIndex"
                            class="flex-1 block-placeholder min-h-[1.5rem] text-sm"
                            contenteditable="true"
                            data-placeholder="Checkliste-Eintrag..."
                            x-init="$nextTick(() => { if (item.text !== undefined && item.text !== null) { $el.innerHTML = item.text || ''; } })"
                            @input="updateChecklistItemText('${blockId}', item.id, $event.target.innerHTML)"
                            @blur="commitChecklistItemText('${blockId}', item.id, $event.target.innerHTML)"
                            @keydown.enter.prevent="addChecklistItem('${blockId}', 'bottom')"
                            @keydown.backspace="if (!$el.textContent.trim() && ${itemsLength} > 1) { $event.preventDefault(); removeChecklistItem('${blockId}', itemIndex); }"
                            @focus="initBlockContent($event.target, { content: item.text || '' })"
                        ></div>
                        <!-- Actions -->
                        <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                                @click.stop="moveChecklistItemUp('${blockId}', itemIndex)"
                                :disabled="itemIndex === 0"
                                :class="{'opacity-50 cursor-not-allowed': itemIndex === 0}"
                                class="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded"
                                title="Nach oben verschieben"
                            >
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path>
                                </svg>
                            </button>
                            <button 
                                @click.stop="moveChecklistItemDown('${blockId}', itemIndex)"
                                :disabled="itemIndex === ${itemsLength > 0 ? itemsLength - 1 : 0}"
                                :class="{'opacity-50 cursor-not-allowed': itemIndex === ${itemsLength > 0 ? itemsLength - 1 : 0}}"
                                class="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded"
                                title="Nach unten verschieben"
                            >
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                                </svg>
                            </button>
                            <button 
                                @click.stop="removeChecklistItem('${blockId}', itemIndex)"
                                :disabled="${itemsLength <= 1}"
                                :class="{'opacity-50 cursor-not-allowed': ${itemsLength <= 1}}"
                                class="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                                title="Eintrag löschen"
                            >
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                            </button>
                        </div>
                    </div>
                </template>
                <!-- Empty State -->
                <div x-show="${itemsLength === 0}" 
                     class="text-center text-gray-400 py-4 text-sm">
                    Keine Einträge vorhanden
                </div>
            </div>
        `;
    },
    
    // Child-Version (für verschachtelte Checklisten)
    renderChildHTML(child, context = {}) {
        const childId = child.id || '';
        const { block, childIndex } = context;
        const items = child.checklistData?.items || [];
        const itemsLength = items.length;
        
        return `
            <div x-show="child.type === 'checklist'" 
                 data-block-id="${childId}"
                 :id="child.htmlId || null"
                 :style="child.style || ''"
                 :class="['space-y-2 p-4 border border-gray-300 rounded-lg', child.classes || '']">
                <template x-for="(item, itemIndex) in (child.checklistData?.items || [])" :key="item.id">
                    <div class="flex items-start gap-3 group hover:bg-gray-50 p-2 rounded transition-colors">
                        <!-- Checkbox -->
                        <input 
                            type="checkbox"
                            :checked="item.checked || false"
                            @change="toggleChecklistItem('${childId}', itemIndex)"
                            @click.stop
                            class="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                        />
                        <!-- Text Input -->
                        <div 
                            :data-item-id="item.id"
                            data-block-id="${childId}"
                            :data-item-index="itemIndex"
                            class="flex-1 block-placeholder min-h-[1.5rem] text-sm"
                            contenteditable="true"
                            data-placeholder="Checkliste-Eintrag..."
                            x-init="$nextTick(() => { if (item.text !== undefined && item.text !== null) { $el.innerHTML = item.text || ''; } })"
                            @input="updateChecklistItemText('${childId}', item.id, $event.target.innerHTML)"
                            @blur="commitChecklistItemText('${childId}', item.id, $event.target.innerHTML)"
                            @keydown.enter.prevent="addChecklistItem('${childId}', 'bottom')"
                            @keydown.backspace="if (!$el.textContent.trim() && ${itemsLength} > 1) { $event.preventDefault(); removeChecklistItem('${childId}', itemIndex); }"
                            @focus="initBlockContent($event.target, { content: item.text || '' })"
                        ></div>
                        <!-- Actions -->
                        <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                                @click.stop="moveChecklistItemUp('${childId}', itemIndex)"
                                :disabled="itemIndex === 0"
                                :class="{'opacity-50 cursor-not-allowed': itemIndex === 0}"
                                class="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded"
                                title="Nach oben verschieben"
                            >
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path>
                                </svg>
                            </button>
                            <button 
                                @click.stop="moveChecklistItemDown('${childId}', itemIndex)"
                                :disabled="itemIndex === ${itemsLength > 0 ? itemsLength - 1 : 0}"
                                :class="{'opacity-50 cursor-not-allowed': itemIndex === ${itemsLength > 0 ? itemsLength - 1 : 0}}"
                                class="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded"
                                title="Nach unten verschieben"
                            >
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                                </svg>
                            </button>
                            <button 
                                @click.stop="removeChecklistItem('${childId}', itemIndex)"
                                :disabled="${itemsLength <= 1}"
                                :class="{'opacity-50 cursor-not-allowed': ${itemsLength <= 1}}"
                                class="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                                title="Eintrag löschen"
                            >
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                            </button>
                        </div>
                    </div>
                </template>
                <!-- Empty State -->
                <div x-show="${itemsLength === 0}" 
                     class="text-center text-gray-400 py-4 text-sm">
                    Keine Einträge vorhanden
                </div>
            </div>
        `;
    },
    
    // Initialisierung
    initialize(block, blockIdCounter) {
        const checklistData = ChecklistManagement.initializeChecklist(blockIdCounter, 1);
        block.checklistData = checklistData;
        block.checklistData.lastItemIdCounter = checklistData.lastItemIdCounter;
        // Erstes Item als checked markieren
        if (block.checklistData.items && block.checklistData.items.length > 0) {
            block.checklistData.items[0].checked = true;
        }
        return block;
    },
    
    // Sicherstellen dass Block initialisiert ist
    ensureInitialized(block, blockIdCounter) {
        if (!block.checklistData) {
            const checklistData = ChecklistManagement.initializeChecklist(blockIdCounter, 1);
            block.checklistData = checklistData;
            block.checklistData.lastItemIdCounter = checklistData.lastItemIdCounter;
            // Erstes Item als checked markieren
            if (block.checklistData.items && block.checklistData.items.length > 0) {
                block.checklistData.items[0].checked = true;
            }
        } else if (!block.checklistData.items) {
            // Falls checklistData existiert aber items fehlt
            block.checklistData.items = [];
            // Ein checked item hinzufügen
            const newItem = {
                id: Utils.generateId(blockIdCounter),
                text: '',
                checked: true
            };
            block.checklistData.items.push(newItem);
            block.checklistData.lastItemIdCounter = blockIdCounter;
        } else if (block.checklistData.items.length === 0) {
            // Falls items leer ist, ein checked item hinzufügen
            const newItem = {
                id: Utils.generateId(blockIdCounter),
                text: '',
                checked: true
            };
            block.checklistData.items.push(newItem);
            block.checklistData.lastItemIdCounter = blockIdCounter;
        }
        return block;
    },
    
    // Cleanup beim Typ-Wechsel
    cleanup(block) {
        delete block.checklistData;
        return block;
    }
};




