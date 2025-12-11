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
        createdAt: '',
        updatedAt: ''
    },
    
    // HTML-Template für Rendering
    renderHTML(block, context = {}) {
        return `
            <div x-show="block.type === 'table'" class="overflow-x-auto">
                <table 
                    :data-block-id="block.id"
                    :style="block.style || ''"
                    :class="['w-full border-collapse border border-gray-300', block.classes || '']"
                >
                    <!-- Header -->
                    <thead x-show="block.tableData && block.tableData.hasHeader">
                        <template x-for="(row, rowIndex) in (block.tableData?.cells || []).filter(r => r[0]?.isHeader)" :key="rowIndex">
                            <tr>
                                <template x-for="(cell, colIndex) in row" :key="cell.id">
                                    <th 
                                        x-show="!cell.merged"
                                        :colspan="cell.colspan > 1 ? cell.colspan : null"
                                        :rowspan="cell.rowspan > 1 ? cell.rowspan : null"
                                        :data-cell-id="cell.id"
                                        :data-block-id="block.id"
                                        :data-row-index="rowIndex"
                                        :data-col-index="colIndex"
                                        class="border border-gray-300 p-2 bg-gray-100 font-semibold text-left min-w-[100px] min-h-[40px]"
                                        contenteditable="true"
                                        @input="updateTableCellContent(block.id, cell.id, $event.target.innerHTML)"
                                        @focus="selectBlock(block.id); initTableCellContent($event.target, cell)"
                                    ></th>
                                </template>
                            </tr>
                        </template>
                    </thead>
                    
                    <!-- Body -->
                    <tbody>
                        <template x-for="(row, rowIndex) in (block.tableData?.cells || []).filter(r => !r[0]?.isHeader && !r[0]?.isFooter)" :key="rowIndex">
                            <tr>
                                <template x-for="(cell, colIndex) in row" :key="cell.id">
                                    <td 
                                        x-show="!cell.merged"
                                        :colspan="cell.colspan > 1 ? cell.colspan : null"
                                        :rowspan="cell.rowspan > 1 ? cell.rowspan : null"
                                        :data-cell-id="cell.id"
                                        :data-block-id="block.id"
                                        :data-row-index="rowIndex"
                                        :data-col-index="colIndex"
                                        class="border border-gray-300 p-2 min-w-[100px] min-h-[40px]"
                                        contenteditable="true"
                                        @input="updateTableCellContent(block.id, cell.id, $event.target.innerHTML)"
                                        @focus="selectBlock(block.id); initTableCellContent($event.target, cell)"
                                    ></td>
                                </template>
                            </tr>
                        </template>
                    </tbody>
                    
                    <!-- Footer -->
                    <tfoot x-show="block.tableData && block.tableData.hasFooter">
                        <template x-for="(row, rowIndex) in (block.tableData?.cells || []).filter(r => r[0]?.isFooter)" :key="rowIndex">
                            <tr>
                                <template x-for="(cell, colIndex) in row" :key="cell.id">
                                    <td 
                                        x-show="!cell.merged"
                                        :colspan="cell.colspan > 1 ? cell.colspan : null"
                                        :rowspan="cell.rowspan > 1 ? cell.rowspan : null"
                                        :data-cell-id="cell.id"
                                        :data-block-id="block.id"
                                        :data-row-index="rowIndex"
                                        :data-col-index="colIndex"
                                        class="border border-gray-300 p-2 bg-gray-50 font-semibold min-w-[100px] min-h-[40px]"
                                        contenteditable="true"
                                        @input="updateTableCellContent(block.id, cell.id, $event.target.innerHTML)"
                                        @focus="selectBlock(block.id); initTableCellContent($event.target, cell)"
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
        // Tabellen werden normalerweise nicht als Child-Blöcke verwendet
        return this.renderHTML(child, context);
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
    }
};

