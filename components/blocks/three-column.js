/**
 * Three Column Block Component
 * Enthält alle Informationen für Three Column Container-Blöcke an einem Ort
 */
import { BLOCK_TYPES } from '../block-types.js';

export const ThreeColumnBlock = {
    type: 'threeColumn',
    
    // Konfiguration direkt aus BLOCK_TYPES
    options: BLOCK_TYPES.threeColumn,
    
    // Datenstruktur-Definition
    structure: {
        id: '',
        type: 'threeColumn',
        children: [],
        style: '',
        classes: '',
        htmlId: '',
        createdAt: '',
        updatedAt: ''
    },
    
    // HTML-Template für Rendering
    renderHTML(block, context = {}) {
        const blockId = block.id || '';
        const { selectedBlockId, draggingBlockId, hoveredBlockId, childBlockTypes, index } = context;
        
        return `
            <div x-show="block.type === 'threeColumn'" 
                 :id="block.htmlId || null"
                 :style="block.style || ''"
                 :class="['grid grid-cols-3 gap-4 p-4 border-2 border-dashed border-gray-300 rounded-lg min-h-[200px]', block.classes || '']">
                <template x-for="(column, columnIndex) in (block.children || [])" :key="column.id">
                    <div class="space-y-2">
                        <div class="text-xs font-semibold text-gray-500 mb-2" x-text="'Spalte ' + (columnIndex + 1)"></div>
                        <template x-for="(child, childIndex) in (column.children || [])" :key="child.id">
                            <div 
                                :class="{
                                    'ring-2 ring-blue-500': selectedBlockId === child.id,
                                    'opacity-50': draggingBlockId === child.id
                                }"
                                class="block-item group relative p-2 rounded-lg hover:bg-gray-50 transition-all cursor-move bg-gray-50"
                                @click.stop="selectBlock(child.id)"
                                @mouseenter="hoveredBlockId = child.id"
                                @mouseleave="hoveredBlockId = null"
                                draggable="true"
                                @dragstart="handleDragStart($event, index, columnIndex, childIndex)"
                                @dragover.prevent="handleDragOver($event, index, columnIndex, childIndex)"
                                @drop="handleDrop($event, index, columnIndex, childIndex)"
                                @dragend="handleDragEnd()"
                            >
                                <div x-show="selectedBlockId === child.id" class="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-l"></div>
                                <div x-show="hoveredBlockId === child.id || selectedBlockId === child.id" class="absolute -left-10 top-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                    <button @click.stop="openSidebar(child.id)" class="p-1 bg-blue-500 text-white rounded shadow hover:bg-blue-600 text-xs" title="Einstellungen öffnen">⚙</button>
                                    <button @click.stop="removeChildFromColumn(block.id, columnIndex, childIndex)" class="p-1 bg-red-500 text-white rounded shadow hover:bg-red-600" title="Löschen">×</button>
                                </div>
                                <div class="block-content">
                                    <div x-html="renderChild(child, column, childIndex)"></div>
                                    <!-- Nested Container Blocks -->
                                    <div x-show="child.type === 'twoColumn' || child.type === 'threeColumn' || child.type === 'table'">
                                        <div x-show="child.type === 'twoColumn'" class="grid grid-cols-2 gap-2 p-2 border border-dashed border-gray-300 rounded min-h-[150px]">
                                            <template x-for="(nestedColumn, nestedColumnIndex) in (child.children || [])" :key="nestedColumn.id">
                                                <div class="space-y-1">
                                                    <div class="text-xs font-semibold text-gray-400 mb-1" x-text="'Spalte ' + (nestedColumnIndex + 1)"></div>
                                                    <template x-for="(nestedChild, nestedChildIndex) in (nestedColumn.children || [])" :key="nestedChild.id">
                                                        <div 
                                                            :class="{
                                                                'ring-2 ring-blue-500': selectedBlockId === nestedChild.id,
                                                                'opacity-50': draggingBlockId === nestedChild.id
                                                            }"
                                                            class="block-item group relative p-1 rounded hover:bg-gray-50 transition-all cursor-move bg-gray-50"
                                                            @click.stop="selectBlock(nestedChild.id)"
                                                            @mouseenter="hoveredBlockId = nestedChild.id"
                                                            @mouseleave="hoveredBlockId = null"
                                                            draggable="true"
                                                            @dragstart="handleDragStart($event, ${index}, columnIndex, childIndex)"
                                                            @dragover.prevent="handleDragOver($event, ${index}, columnIndex, childIndex)"
                                                            @drop="handleDrop($event, ${index}, columnIndex, childIndex)"
                                                            @dragend="handleDragEnd()"
                                                        >
                                                            <div x-show="selectedBlockId === nestedChild.id" class="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-l"></div>
                                                            <div x-show="hoveredBlockId === nestedChild.id || selectedBlockId === nestedChild.id" class="absolute -left-8 top-1 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                                                <button @click.stop="openSidebar(nestedChild.id)" class="p-0.5 bg-blue-500 text-white rounded shadow hover:bg-blue-600 text-xs" title="Einstellungen">⚙</button>
                                                                <button @click.stop="removeChildFromColumn(child.id, nestedColumnIndex, nestedChildIndex)" class="p-0.5 bg-red-500 text-white rounded shadow hover:bg-red-600 text-xs" title="Löschen">×</button>
                                                            </div>
                                                            <div class="block-content">
                                                                <div x-html="renderChild(nestedChild, nestedColumn, nestedChildIndex)"></div>
                                                            </div>
                                                        </div>
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
                                        <div x-show="child.type === 'threeColumn'" class="grid grid-cols-3 gap-2 p-2 border border-dashed border-gray-300 rounded min-h-[150px]">
                                            <template x-for="(nestedColumn, nestedColumnIndex) in (child.children || [])" :key="nestedColumn.id">
                                                <div class="space-y-1">
                                                    <div class="text-xs font-semibold text-gray-400 mb-1" x-text="'Spalte ' + (nestedColumnIndex + 1)"></div>
                                                    <template x-for="(nestedChild, nestedChildIndex) in (nestedColumn.children || [])" :key="nestedChild.id">
                                                        <div 
                                                            :class="{
                                                                'ring-2 ring-blue-500': selectedBlockId === nestedChild.id,
                                                                'opacity-50': draggingBlockId === nestedChild.id
                                                            }"
                                                            class="block-item group relative p-1 rounded hover:bg-gray-50 transition-all cursor-move bg-gray-50"
                                                            @click.stop="selectBlock(nestedChild.id)"
                                                            @mouseenter="hoveredBlockId = nestedChild.id"
                                                            @mouseleave="hoveredBlockId = null"
                                                            draggable="true"
                                                            @dragstart="handleDragStart($event, ${index}, columnIndex, childIndex)"
                                                            @dragover.prevent="handleDragOver($event, ${index}, columnIndex, childIndex)"
                                                            @drop="handleDrop($event, ${index}, columnIndex, childIndex)"
                                                            @dragend="handleDragEnd()"
                                                        >
                                                            <div x-show="selectedBlockId === nestedChild.id" class="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-l"></div>
                                                            <div x-show="hoveredBlockId === nestedChild.id || selectedBlockId === nestedChild.id" class="absolute -left-8 top-1 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                                                <button @click.stop="openSidebar(nestedChild.id)" class="p-0.5 bg-blue-500 text-white rounded shadow hover:bg-blue-600 text-xs" title="Einstellungen">⚙</button>
                                                                <button @click.stop="removeChildFromColumn(child.id, nestedColumnIndex, nestedChildIndex)" class="p-0.5 bg-red-500 text-white rounded shadow hover:bg-red-600 text-xs" title="Löschen">×</button>
                                                            </div>
                                                            <div class="block-content">
                                                                <div x-html="renderChild(nestedChild, nestedColumn, nestedChildIndex)"></div>
                                                            </div>
                                                        </div>
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
                                    </div>
                                </div>
                            </div>
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
            <div x-show="child.type === 'threeColumn'"
                 :id="child.htmlId || null"
                 :style="child.style || ''"
                 :class="['grid grid-cols-3 gap-2 p-2 border border-dashed border-gray-300 rounded min-h-[150px]', child.classes || '']">
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
            // Erstelle 3 Spalten
            for (let i = 0; i < 3; i++) {
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
        // Stelle sicher, dass genau 3 Spalten vorhanden sind
        while (block.children.length < 3) {
            blockIdCounter++;
            block.children.push({
                id: `col-${blockIdCounter}-${Date.now()}`,
                type: 'column',
                children: []
            });
        }
        // Entferne überschüssige Spalten
        while (block.children.length > 3) {
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




