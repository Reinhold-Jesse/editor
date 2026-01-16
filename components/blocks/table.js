/**
 * Table Block Component
 * Enthält alle Informationen für Table-Blöcke an einem Ort
 */
import { BLOCK_TYPES } from '../block-types.js';
import { TableManagement } from '../table-management.js';

export const TableBlock = {
    type: 'table',
    
    // Konfiguration direkt aus BLOCK_TYPES
    options: BLOCK_TYPES.table,
    
    // Datenstruktur-Definition
    structure: {
        id: '',
        type: 'table',
        tableData: null,
        style: '',
        classes: '',
        htmlId: '',
        createdAt: '',
        updatedAt: ''
    },
    
    // HTML-Template für Rendering
    renderHTML(block, context = {}) {
        const blockId = block.id || '';
        
        return `
            <div x-show="block.type === 'table'" class="overflow-x-auto">
                <table 
                    data-block-id="${blockId}"
                    :id="block.htmlId || null"
                    :style="block.style || ''"
                    :class="['w-full border-collapse border border-gray-300', block.classes || '']"
                >
                    <!-- Header -->
                    <thead x-show="block.tableData && block.tableData.hasHeader">
                        <template x-for="(row, rowIndex) in getTableHeaderRows(block)" :key="rowIndex">
                            <tr>
                                <template x-for="(cell, colIndex) in row" :key="cell.id">
                                    <th 
                                        x-show="!cell.merged"
                                        :colspan="cell.colspan > 1 ? cell.colspan : null"
                                        :rowspan="cell.rowspan > 1 ? cell.rowspan : null"
                                        :data-cell-id="cell.id"
                                        data-block-id="${blockId}"
                                        :data-row-index="rowIndex"
                                        :data-col-index="colIndex"
                                        class="border border-gray-300 p-2 bg-gray-100 font-semibold text-left min-w-[100px] min-h-[40px]"
                                        contenteditable="true"
                                        x-init="$nextTick(() => { if (cell.content !== undefined && cell.content !== null) $el.innerHTML = cell.content || ''; })"
                                        x-effect="if (cell.content !== undefined && cell.content !== null && document.activeElement !== $el && $el.innerHTML !== (cell.content || '')) { $el.innerHTML = cell.content || ''; }"
                                        @input="updateTableCellContent('${blockId}', cell.id, $event.target.innerHTML)"
                                        @blur="commitTableCellContent('${blockId}', cell.id, $event.target.innerHTML)"
                                        @focus="selectBlock('${blockId}'); initTableCellContent($event.target, cell)"
                                    ></th>
                                </template>
                            </tr>
                        </template>
                    </thead>
                    
                    <!-- Body -->
                    <tbody>
                        <template x-for="(row, rowIndex) in getTableBodyRows(block)" :key="rowIndex">
                            <tr>
                                <template x-for="(cell, colIndex) in row" :key="cell.id">
                                    <td 
                                        x-show="!cell.merged"
                                        :colspan="cell.colspan > 1 ? cell.colspan : null"
                                        :rowspan="cell.rowspan > 1 ? cell.rowspan : null"
                                        :data-cell-id="cell.id"
                                        data-block-id="${blockId}"
                                        :data-row-index="rowIndex"
                                        :data-col-index="colIndex"
                                        class="border border-gray-300 p-2 min-w-[100px] min-h-[40px]"
                                        contenteditable="true"
                                        x-init="$nextTick(() => { if (cell.content !== undefined && cell.content !== null) $el.innerHTML = cell.content || ''; })"
                                        x-effect="if (cell.content !== undefined && cell.content !== null && document.activeElement !== $el && $el.innerHTML !== (cell.content || '')) { $el.innerHTML = cell.content || ''; }"
                                        @input="updateTableCellContent('${blockId}', cell.id, $event.target.innerHTML)"
                                        @blur="commitTableCellContent('${blockId}', cell.id, $event.target.innerHTML)"
                                        @focus="selectBlock('${blockId}'); initTableCellContent($event.target, cell)"
                                    ></td>
                                </template>
                            </tr>
                        </template>
                    </tbody>
                    
                    <!-- Footer -->
                    <tfoot x-show="block.tableData && block.tableData.hasFooter">
                        <template x-for="(row, rowIndex) in getTableFooterRows(block)" :key="rowIndex">
                            <tr>
                                <template x-for="(cell, colIndex) in row" :key="cell.id">
                                    <td 
                                        x-show="!cell.merged"
                                        :colspan="cell.colspan > 1 ? cell.colspan : null"
                                        :rowspan="cell.rowspan > 1 ? cell.rowspan : null"
                                        :data-cell-id="cell.id"
                                        data-block-id="${blockId}"
                                        :data-row-index="rowIndex"
                                        :data-col-index="colIndex"
                                        class="border border-gray-300 p-2 bg-gray-50 font-semibold min-w-[100px] min-h-[40px]"
                                        contenteditable="true"
                                        x-init="$nextTick(() => { if (cell.content !== undefined && cell.content !== null) $el.innerHTML = cell.content || ''; })"
                                        x-effect="if (cell.content !== undefined && cell.content !== null && document.activeElement !== $el && $el.innerHTML !== (cell.content || '')) { $el.innerHTML = cell.content || ''; }"
                                        @input="updateTableCellContent('${blockId}', cell.id, $event.target.innerHTML)"
                                        @blur="commitTableCellContent('${blockId}', cell.id, $event.target.innerHTML)"
                                        @focus="selectBlock('${blockId}'); initTableCellContent($event.target, cell)"
                                    ></td>
                                </template>
                            </tr>
                        </template>
                    </tfoot>
                </table>
            </div>
        `;
    },
    
    // Child-Version (für verschachtelte Tabellen)
    renderChildHTML(child, context = {}) {
        const childId = child.id || '';
        
        return `
            <div x-show="child.type === 'table'" class="overflow-x-auto">
                <table 
                    data-block-id="${childId}"
                    :id="child.htmlId || null"
                    :style="child.style || ''"
                    :class="['w-full border-collapse border border-gray-300', child.classes || '']"
                >
                    <!-- Header -->
                    <thead x-show="child.tableData && child.tableData.hasHeader">
                        <template x-for="(row, rowIndex) in getTableHeaderRows(child)" :key="rowIndex">
                            <tr>
                                <template x-for="(cell, colIndex) in row" :key="cell.id">
                                    <th 
                                        x-show="!cell.merged"
                                        :colspan="cell.colspan > 1 ? cell.colspan : null"
                                        :rowspan="cell.rowspan > 1 ? cell.rowspan : null"
                                        :data-cell-id="cell.id"
                                        data-block-id="${childId}"
                                        :data-row-index="rowIndex"
                                        :data-col-index="colIndex"
                                        class="border border-gray-300 p-2 bg-gray-100 font-semibold text-left min-w-[100px] min-h-[40px]"
                                        contenteditable="true"
                                        x-init="$nextTick(() => { if (cell.content !== undefined && cell.content !== null) $el.innerHTML = cell.content || ''; })"
                                        x-effect="if (cell.content !== undefined && cell.content !== null && document.activeElement !== $el && $el.innerHTML !== (cell.content || '')) { $el.innerHTML = cell.content || ''; }"
                                        @input="updateTableCellContent('${childId}', cell.id, $event.target.innerHTML)"
                                        @blur="commitTableCellContent('${childId}', cell.id, $event.target.innerHTML)"
                                        @focus="selectBlock('${childId}'); initTableCellContent($event.target, cell)"
                                    ></th>
                                </template>
                            </tr>
                        </template>
                    </thead>
                    
                    <!-- Body -->
                    <tbody>
                        <template x-for="(row, rowIndex) in getTableBodyRows(child)" :key="rowIndex">
                            <tr>
                                <template x-for="(cell, colIndex) in row" :key="cell.id">
                                    <td 
                                        x-show="!cell.merged"
                                        :colspan="cell.colspan > 1 ? cell.colspan : null"
                                        :rowspan="cell.rowspan > 1 ? cell.rowspan : null"
                                        :data-cell-id="cell.id"
                                        data-block-id="${childId}"
                                        :data-row-index="rowIndex"
                                        :data-col-index="colIndex"
                                        class="border border-gray-300 p-2 min-w-[100px] min-h-[40px]"
                                        contenteditable="true"
                                        x-init="$nextTick(() => { if (cell.content !== undefined && cell.content !== null) $el.innerHTML = cell.content || ''; })"
                                        x-effect="if (cell.content !== undefined && cell.content !== null && document.activeElement !== $el && $el.innerHTML !== (cell.content || '')) { $el.innerHTML = cell.content || ''; }"
                                        @input="updateTableCellContent('${childId}', cell.id, $event.target.innerHTML)"
                                        @blur="commitTableCellContent('${childId}', cell.id, $event.target.innerHTML)"
                                        @focus="selectBlock('${childId}'); initTableCellContent($event.target, cell)"
                                    ></td>
                                </template>
                            </tr>
                        </template>
                    </tbody>
                    
                    <!-- Footer -->
                    <tfoot x-show="child.tableData && child.tableData.hasFooter">
                        <template x-for="(row, rowIndex) in getTableFooterRows(child)" :key="rowIndex">
                            <tr>
                                <template x-for="(cell, colIndex) in row" :key="cell.id">
                                    <td 
                                        x-show="!cell.merged"
                                        :colspan="cell.colspan > 1 ? cell.colspan : null"
                                        :rowspan="cell.rowspan > 1 ? cell.rowspan : null"
                                        :data-cell-id="cell.id"
                                        data-block-id="${childId}"
                                        :data-row-index="rowIndex"
                                        :data-col-index="colIndex"
                                        class="border border-gray-300 p-2 bg-gray-50 font-semibold min-w-[100px] min-h-[40px]"
                                        contenteditable="true"
                                        x-init="$nextTick(() => { if (cell.content !== undefined && cell.content !== null) $el.innerHTML = cell.content || ''; })"
                                        x-effect="if (cell.content !== undefined && cell.content !== null && document.activeElement !== $el && $el.innerHTML !== (cell.content || '')) { $el.innerHTML = cell.content || ''; }"
                                        @input="updateTableCellContent('${childId}', cell.id, $event.target.innerHTML)"
                                        @blur="commitTableCellContent('${childId}', cell.id, $event.target.innerHTML)"
                                        @focus="selectBlock('${childId}'); initTableCellContent($event.target, cell)"
                                    ></td>
                                </template>
                            </tr>
                        </template>
                    </tfoot>
                </table>
            </div>
        `;
    },
    
    // Initialisierung
    initialize(block, blockIdCounter) {
        const tableData = TableManagement.initializeTable(blockIdCounter, 3, 3, true, false);
        block.tableData = tableData;
        block.tableData.lastCellIdCounter = tableData.lastCellIdCounter;
        return block;
    },
    
    // Sicherstellen dass Block initialisiert ist
    ensureInitialized(block, blockIdCounter) {
        if (!block.tableData) {
            const tableData = TableManagement.initializeTable(blockIdCounter, 3, 3, true, false);
            block.tableData = tableData;
            block.tableData.lastCellIdCounter = tableData.lastCellIdCounter;
        }
        return block;
    },
    
    // Cleanup beim Typ-Wechsel
    cleanup(block) {
        delete block.tableData;
        return block;
    },
    
    // Einstellungen HTML für Sidebar
    getSettingsHTML(block, context = {}) {
        const blockId = block.id || '';
        const hasHeader = block.tableData?.hasHeader || false;
        const hasFooter = block.tableData?.hasFooter || false;
        const rowCount = block.tableData?.cells?.length || 0;
        const colCount = block.tableData?.cells?.[0]?.length || 0;
        
        return `
            <!-- Table Management -->
            <div class="pt-4 border-t border-gray-200" @click.stop>
                <label class="block text-sm font-semibold text-gray-700 mb-2">
                    Tabellen-Einstellungen:
                </label>
                
                <!-- Header/Footer Toggle -->
                <div class="mb-4 space-y-2">
                    <div class="flex items-center gap-2">
                        <input 
                            type="checkbox"
                            :checked="${hasHeader}"
                            @change="toggleTableHeader('${blockId}')"
                            @click.stop
                            class="w-4 h-4"
                        />
                        <label class="text-sm text-gray-700">Header aktivieren</label>
                    </div>
                    <div class="flex items-center gap-2">
                        <input 
                            type="checkbox"
                            :checked="${hasFooter}"
                            @change="toggleTableFooter('${blockId}')"
                            @click.stop
                            class="w-4 h-4"
                        />
                        <label class="text-sm text-gray-700">Footer aktivieren</label>
                    </div>
                </div>

                <!-- Row Management -->
                <div class="mb-4">
                    <label class="block text-xs font-semibold text-gray-600 mb-2">Zeilen:</label>
                    <div class="flex gap-2">
                        <button 
                            @click.stop="addTableRow('${blockId}', 'top')"
                            class="flex-1 px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600"
                        >
                            + Oben
                        </button>
                        <button 
                            @click.stop="addTableRow('${blockId}', 'bottom')"
                            class="flex-1 px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600"
                        >
                            + Unten
                        </button>
                    </div>
                    <div class="mt-2 flex gap-2">
                        <button 
                            @click.stop="removeTableRow('${blockId}', 0)"
                            class="flex-1 px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                            :disabled="${rowCount <= 1}"
                        >
                            - Erste Zeile
                        </button>
                        <button 
                            @click.stop="removeTableRow('${blockId}', ${rowCount - 1})"
                            class="flex-1 px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                            :disabled="${rowCount <= 1}"
                        >
                            - Letzte Zeile
                        </button>
                    </div>
                </div>

                <!-- Column Management -->
                <div class="mb-4">
                    <label class="block text-xs font-semibold text-gray-600 mb-2">Spalten:</label>
                    <div class="flex gap-2">
                        <button 
                            @click.stop="addTableColumn('${blockId}', 'left')"
                            class="flex-1 px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                        >
                            + Links
                        </button>
                        <button 
                            @click.stop="addTableColumn('${blockId}', 'right')"
                            class="flex-1 px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                        >
                            + Rechts
                        </button>
                    </div>
                    <div class="mt-2 flex gap-2">
                        <button 
                            @click.stop="removeTableColumn('${blockId}', 0)"
                            class="flex-1 px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                            :disabled="${colCount <= 1}"
                        >
                            - Erste Spalte
                        </button>
                        <button 
                            @click.stop="removeTableColumn('${blockId}', ${colCount - 1})"
                            class="flex-1 px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                            :disabled="${colCount <= 1}"
                        >
                            - Letzte Spalte
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
};




