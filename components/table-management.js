// Table Management Functions - als Objekt organisiert
import { Utils } from './utils.js';

export const TableManagement = {
    // Initialize a table with default structure
    initializeTable(blockIdCounter, rows = 3, cols = 3, hasHeader = true, hasFooter = false) {
        const cells = [];
        let cellIdCounter = blockIdCounter;
        
        // Create header row if needed
        if (hasHeader) {
            const headerRow = [];
            for (let c = 0; c < cols; c++) {
                headerRow.push({
                    id: Utils.generateId(cellIdCounter++),
                    content: '',
                    colspan: 1,
                    rowspan: 1,
                    isHeader: true
                });
            }
            cells.push(headerRow);
        }
        
        // Create body rows
        const bodyStartRow = hasHeader ? 1 : 0;
        for (let r = bodyStartRow; r < rows + bodyStartRow; r++) {
            const row = [];
            for (let c = 0; c < cols; c++) {
                row.push({
                    id: Utils.generateId(cellIdCounter++),
                    content: '',
                    colspan: 1,
                    rowspan: 1,
                    isHeader: false
                });
            }
            cells.push(row);
        }
        
        // Create footer row if needed
        if (hasFooter) {
            const footerRow = [];
            for (let c = 0; c < cols; c++) {
                footerRow.push({
                    id: Utils.generateId(cellIdCounter++),
                    content: '',
                    colspan: 1,
                    rowspan: 1,
                    isHeader: false,
                    isFooter: true
                });
            }
            cells.push(footerRow);
        }
        
        return {
            cells,
            hasHeader,
            hasFooter,
            lastCellIdCounter: cellIdCounter - 1
        };
    },

    // Add a row to the table
    addTableRow(blocks, blockId, blockIdCounter, position = 'bottom') {
        const block = blocks.find(b => b.id === blockId);
        if (!block || block.type !== 'table' || !block.tableData) return null;
        
        const { cells, hasHeader, hasFooter } = block.tableData;
        const numCols = cells[0] ? cells[0].length : 3;
        
        // Calculate where to insert the row
        let insertIndex;
        if (position === 'top') {
            insertIndex = hasHeader ? 1 : 0;
        } else if (position === 'bottom') {
            insertIndex = hasFooter ? cells.length - 1 : cells.length;
        } else {
            // Insert after selected row (default to bottom)
            insertIndex = hasFooter ? cells.length - 1 : cells.length;
        }
        
        // Create new row
        const newRow = [];
        newRow._rowIndex = insertIndex;
        newRow._rowType = 'body';
        for (let c = 0; c < numCols; c++) {
            newRow.push({
                id: Utils.generateId(blockIdCounter++),
                content: '',
                colspan: 1,
                rowspan: 1,
                isHeader: false,
                isFooter: false,
                rowType: 'body'
            });
        }
        
        cells.splice(insertIndex, 0, newRow);
        
        // Update row indices
        cells.forEach((row, idx) => {
            row._rowIndex = idx;
        });
        block.updatedAt = new Date().toISOString();
        
        return { lastCellIdCounter: blockIdCounter - 1 };
    },

    // Remove a row from the table
    removeTableRow(blocks, blockId, rowIndex) {
        const block = blocks.find(b => b.id === blockId);
        if (!block || block.type !== 'table' || !block.tableData) return;
        
        const { cells, hasHeader, hasFooter } = block.tableData;
        
        // Don't remove if it's the only row
        if (cells.length <= 1) return;
        
        // Don't remove header/footer if they're the only rows
        if (hasHeader && rowIndex === 0 && cells.length === 1) return;
        if (hasFooter && rowIndex === cells.length - 1 && cells.length === 1) return;
        
        cells.splice(rowIndex, 1);
        block.updatedAt = new Date().toISOString();
    },

    // Add a column to the table
    addTableColumn(blocks, blockId, blockIdCounter, position = 'right') {
        const block = blocks.find(b => b.id === blockId);
        if (!block || block.type !== 'table' || !block.tableData) return null;
        
        const { cells } = block.tableData;
        const insertIndex = position === 'left' ? 0 : cells[0] ? cells[0].length : 0;
        
        // Add column to all rows
        cells.forEach(row => {
            const newCell = {
                id: Utils.generateId(blockIdCounter++),
                content: '',
                colspan: 1,
                rowspan: 1,
                isHeader: row[0]?.isHeader || false,
                isFooter: row[0]?.isFooter || false,
                rowType: row[0]?.rowType || 'body'
            };
            row.splice(insertIndex, 0, newCell);
        });
        
        block.updatedAt = new Date().toISOString();
        
        return { lastCellIdCounter: blockIdCounter - 1 };
    },

    // Remove a column from the table
    removeTableColumn(blocks, blockId, colIndex) {
        const block = blocks.find(b => b.id === blockId);
        if (!block || block.type !== 'table' || !block.tableData) return;
        
        const { cells } = block.tableData;
        
        // Don't remove if it's the only column
        if (cells[0] && cells[0].length <= 1) return;
        
        // Remove column from all rows
        cells.forEach(row => {
            if (row[colIndex]) {
                row.splice(colIndex, 1);
            }
        });
        
        block.updatedAt = new Date().toISOString();
    },

    // Merge cells (colspan and rowspan)
    mergeTableCells(blocks, blockId, startRow, startCol, endRow, endCol) {
        const block = blocks.find(b => b.id === blockId);
        if (!block || block.type !== 'table' || !block.tableData) return;
        
        const { cells } = block.tableData;
        
        // Ensure valid indices
        if (startRow < 0 || startCol < 0 || endRow >= cells.length || endCol >= (cells[0]?.length || 0)) {
            return;
        }
        
        // Ensure start is before end
        if (startRow > endRow) [startRow, endRow] = [endRow, startRow];
        if (startCol > endCol) [startCol, endCol] = [endCol, startCol];
        
        const startCell = cells[startRow][startCol];
        if (!startCell) return;
        
        // Calculate colspan and rowspan
        const colspan = endCol - startCol + 1;
        const rowspan = endRow - startRow + 1;
        
        // Update start cell
        startCell.colspan = colspan;
        startCell.rowspan = rowspan;
        
        // Collect content from merged cells
        let mergedContent = startCell.content || '';
        for (let r = startRow; r <= endRow; r++) {
            for (let c = startCol; c <= endCol; c++) {
                if (r === startRow && c === startCol) continue;
                const cell = cells[r]?.[c];
                if (cell && cell.content) {
                    mergedContent += (mergedContent ? ' ' : '') + cell.content;
                }
            }
        }
        startCell.content = mergedContent;
        
        // Mark other cells as merged (remove them from rendering)
        for (let r = startRow; r <= endRow; r++) {
            for (let c = startCol; c <= endCol; c++) {
                if (r === startRow && c === startCol) continue;
                const cell = cells[r]?.[c];
                if (cell) {
                    cell.merged = true;
                    cell.mergedInto = { row: startRow, col: startCol };
                }
            }
        }
        
        block.updatedAt = new Date().toISOString();
    },

    // Unmerge cells
    unmergeTableCells(blocks, blockId, row, col) {
        const block = blocks.find(b => b.id === blockId);
        if (!block || block.type !== 'table' || !block.tableData) return;
        
        const { cells } = block.tableData;
        const cell = cells[row]?.[col];
        if (!cell || (cell.colspan === 1 && cell.rowspan === 1)) return;
        
        const colspan = cell.colspan;
        const rowspan = cell.rowspan;
        
        // Reset cell
        cell.colspan = 1;
        cell.rowspan = 1;
        
        // Unmerge other cells
        for (let r = row; r < row + rowspan; r++) {
            for (let c = col; c < col + colspan; c++) {
                if (r === row && c === col) continue;
                const mergedCell = cells[r]?.[c];
                if (mergedCell) {
                    mergedCell.merged = false;
                    mergedCell.mergedInto = null;
                }
            }
        }
        
        block.updatedAt = new Date().toISOString();
    },

    // Update cell content
    updateTableCellContent(blocks, blockId, cellId, content) {
        const block = blocks.find(b => b.id === blockId);
        if (!block || block.type !== 'table' || !block.tableData) return;
        
        const { cells } = block.tableData;
        
        for (let row of cells) {
            for (let cell of row) {
                if (cell.id === cellId) {
                    cell.content = content;
                    block.updatedAt = new Date().toISOString();
                    return;
                }
            }
        }
    },

    // Toggle header
    toggleTableHeader(blocks, blockId) {
        const block = blocks.find(b => b.id === blockId);
        if (!block || block.type !== 'table') return;
        
        if (!block.tableData) {
            block.tableData = this.initializeTable(0, 3, 3, true, false);
        }
        
        block.tableData.hasHeader = !block.tableData.hasHeader;
        
        if (block.tableData.hasHeader) {
            // Add header row at the beginning
            const numCols = block.tableData.cells[0]?.length || 3;
            const headerRow = [];
            for (let c = 0; c < numCols; c++) {
                headerRow.push({
                    id: Utils.generateId(Date.now() + c),
                    content: '',
                    colspan: 1,
                    rowspan: 1,
                    isHeader: true,
                    isFooter: false,
                    rowType: 'header'
                });
            }
            block.tableData.cells.unshift(headerRow);
        } else {
            // Remove header row
            const headerIndex = block.tableData.cells.findIndex(row => row[0]?.isHeader);
            if (headerIndex !== -1) {
                block.tableData.cells.splice(headerIndex, 1);
            }
        }
        
        // Update row indices
        block.tableData.cells.forEach((row, idx) => {
            row._rowIndex = idx;
        });
        
        block.updatedAt = new Date().toISOString();
    },

    // Toggle footer
    toggleTableFooter(blocks, blockId) {
        const block = blocks.find(b => b.id === blockId);
        if (!block || block.type !== 'table') return;
        
        if (!block.tableData) {
            block.tableData = this.initializeTable(0, 3, 3, false, true);
        }
        
        block.tableData.hasFooter = !block.tableData.hasFooter;
        
        if (block.tableData.hasFooter) {
            // Add footer row at the end
            const numCols = block.tableData.cells[0]?.length || 3;
            const footerRow = [];
            for (let c = 0; c < numCols; c++) {
                footerRow.push({
                    id: Utils.generateId(Date.now() + c),
                    content: '',
                    colspan: 1,
                    rowspan: 1,
                    isHeader: false,
                    isFooter: true,
                    rowType: 'footer'
                });
            }
            block.tableData.cells.push(footerRow);
        } else {
            // Remove footer row
            const footerIndex = block.tableData.cells.findIndex(row => row[0]?.isFooter);
            if (footerIndex !== -1) {
                block.tableData.cells.splice(footerIndex, 1);
            }
        }
        
        // Update row indices
        block.tableData.cells.forEach((row, idx) => {
            row._rowIndex = idx;
        });
        
        block.updatedAt = new Date().toISOString();
    }
};

// Legacy Exports für Rückwärtskompatibilität
export const initializeTable = TableManagement.initializeTable.bind(TableManagement);
export const addTableRow = TableManagement.addTableRow.bind(TableManagement);
export const removeTableRow = TableManagement.removeTableRow.bind(TableManagement);
export const addTableColumn = TableManagement.addTableColumn.bind(TableManagement);
export const removeTableColumn = TableManagement.removeTableColumn.bind(TableManagement);
export const mergeTableCells = TableManagement.mergeTableCells.bind(TableManagement);
export const unmergeTableCells = TableManagement.unmergeTableCells.bind(TableManagement);
export const updateTableCellContent = TableManagement.updateTableCellContent.bind(TableManagement);
export const toggleTableHeader = TableManagement.toggleTableHeader.bind(TableManagement);
export const toggleTableFooter = TableManagement.toggleTableFooter.bind(TableManagement);
