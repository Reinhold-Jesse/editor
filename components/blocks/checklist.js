/**
 * Checklist Block Component
 * Enthält alle Informationen für Checklist-Blöcke an einem Ort
 */
import { BLOCK_TYPES } from '../block-types.js';
import { ChecklistManagement } from '../checklist-management.js';

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
        createdAt: '',
        updatedAt: ''
    },
    
    // HTML-Template für Rendering
    renderHTML(block, context = {}) {
        return `
            <div x-show="block.type === 'checklist'" 
                 :data-block-id="block.id"
                 :style="block.style || ''"
                 :class="['space-y-2 p-4 border border-gray-300 rounded-lg', block.classes || '']">
                <template x-for="(item, itemIndex) in (block.checklistData?.items || [])" :key="item.id">
                    <div class="flex items-start gap-3 group hover:bg-gray-50 p-2 rounded transition-colors">
                        <!-- Checkbox -->
                        <input 
                            type="checkbox"
                            :checked="item.checked || false"
                            @change="toggleChecklistItem(block.id, itemIndex)"
                            @click.stop
                            class="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                        />
                        <!-- Text Input -->
                        <div 
                            :data-item-id="item.id"
                            :data-block-id="block.id"
                            :data-item-index="itemIndex"
                            class="flex-1 block-placeholder min-h-[1.5rem] text-sm"
                            contenteditable="true"
                            data-placeholder="Checkliste-Eintrag..."
                            x-init="$nextTick(() => { if (!$el.innerHTML && item.text) $el.innerHTML = item.text; })"
                            @input="updateChecklistItemText(block.id, item.id, $event.target.innerHTML)"
                            @keydown.enter.prevent="addChecklistItem(block.id, 'bottom')"
                            @keydown.backspace="if (!$el.textContent.trim() && (block.checklistData?.items || []).length > 1) { $event.preventDefault(); removeChecklistItem(block.id, itemIndex); }"
                            @focus="initBlockContent($event.target, { content: item.text || '' })"
                        ></div>
                        <!-- Actions -->
                        <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                                @click.stop="moveChecklistItemUp(block.id, itemIndex)"
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
                                @click.stop="moveChecklistItemDown(block.id, itemIndex)"
                                :disabled="itemIndex === (block.checklistData?.items || []).length - 1"
                                :class="{'opacity-50 cursor-not-allowed': itemIndex === (block.checklistData?.items || []).length - 1}"
                                class="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded"
                                title="Nach unten verschieben"
                            >
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                                </svg>
                            </button>
                            <button 
                                @click.stop="removeChecklistItem(block.id, itemIndex)"
                                :disabled="(block.checklistData?.items || []).length <= 1"
                                :class="{'opacity-50 cursor-not-allowed': (block.checklistData?.items || []).length <= 1}"
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
                <div x-show="!block.checklistData || (block.checklistData?.items || []).length === 0" 
                     class="text-center text-gray-400 py-4 text-sm">
                    Keine Einträge vorhanden
                </div>
            </div>
        `;
    },
    
    // Child-Version (für verschachtelte Checklisten)
    renderChildHTML(child, context = {}) {
        return `
            <div x-show="child.type === 'checklist'" 
                 :data-block-id="child.id"
                 :style="child.style || ''"
                 :class="['space-y-2 p-4 border border-gray-300 rounded-lg', child.classes || '']">
                <template x-for="(item, itemIndex) in (child.checklistData?.items || [])" :key="item.id">
                    <div class="flex items-start gap-3 group hover:bg-gray-50 p-2 rounded transition-colors">
                        <!-- Checkbox -->
                        <input 
                            type="checkbox"
                            :checked="item.checked || false"
                            @change="toggleChecklistItem(child.id, itemIndex)"
                            @click.stop
                            class="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                        />
                        <!-- Text Input -->
                        <div 
                            :data-item-id="item.id"
                            :data-block-id="child.id"
                            :data-item-index="itemIndex"
                            class="flex-1 block-placeholder min-h-[1.5rem] text-sm"
                            contenteditable="true"
                            data-placeholder="Checkliste-Eintrag..."
                            x-init="$nextTick(() => { if (!$el.innerHTML && item.text) $el.innerHTML = item.text; })"
                            @input="updateChecklistItemText(child.id, item.id, $event.target.innerHTML)"
                            @keydown.enter.prevent="addChecklistItem(child.id, 'bottom')"
                            @keydown.backspace="if (!$el.textContent.trim() && (child.checklistData?.items || []).length > 1) { $event.preventDefault(); removeChecklistItem(child.id, itemIndex); }"
                            @focus="initBlockContent($event.target, { content: item.text || '' })"
                        ></div>
                        <!-- Actions -->
                        <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                                @click.stop="moveChecklistItemUp(child.id, itemIndex)"
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
                                @click.stop="moveChecklistItemDown(child.id, itemIndex)"
                                :disabled="itemIndex === (child.checklistData?.items || []).length - 1"
                                :class="{'opacity-50 cursor-not-allowed': itemIndex === (child.checklistData?.items || []).length - 1}"
                                class="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded"
                                title="Nach unten verschieben"
                            >
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                                </svg>
                            </button>
                            <button 
                                @click.stop="removeChecklistItem(child.id, itemIndex)"
                                :disabled="(child.checklistData?.items || []).length <= 1"
                                :class="{'opacity-50 cursor-not-allowed': (child.checklistData?.items || []).length <= 1}"
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
                <div x-show="!child.checklistData || (child.checklistData?.items || []).length === 0" 
                     class="text-center text-gray-400 py-4 text-sm">
                    Keine Einträge vorhanden
                </div>
            </div>
        `;
    },
    
    // Initialisierung
    initialize(block, blockIdCounter) {
        const checklistData = ChecklistManagement.initializeChecklist(blockIdCounter, 0);
        block.checklistData = checklistData;
        block.checklistData.lastItemIdCounter = checklistData.lastItemIdCounter;
        return block;
    },
    
    // Sicherstellen dass Block initialisiert ist
    ensureInitialized(block, blockIdCounter) {
        if (!block.checklistData) {
            const checklistData = ChecklistManagement.initializeChecklist(blockIdCounter, 0);
            block.checklistData = checklistData;
            block.checklistData.lastItemIdCounter = checklistData.lastItemIdCounter;
        } else if (!block.checklistData.items) {
            // Falls checklistData existiert aber items fehlt
            block.checklistData.items = [];
        }
        return block;
    },
    
    // Cleanup beim Typ-Wechsel
    cleanup(block) {
        delete block.checklistData;
        return block;
    }
};




