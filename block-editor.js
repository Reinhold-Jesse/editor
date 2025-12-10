// Block Editor Komponente
import { 
    initAllBlockContents, 
    initBlockContent, 
    findBlockById, 
    getAllBlocks 
} from './components/utils.js';
import {
    addBlock as addBlockUtil,
    addBlockAfter as addBlockAfterUtil,
    updateBlockContent as updateBlockContentUtil,
    deleteBlock as deleteBlockUtil,
    changeBlockType as changeBlockTypeUtil,
    updateBlockStyle as updateBlockStyleUtil,
    clearBlockStyle as clearBlockStyleUtil,
    updateBlockClasses as updateBlockClassesUtil,
    clearBlockClasses as clearBlockClassesUtil,
    moveBlock as moveBlockUtil
} from './components/block-management.js';
import {
    addChild as addChildUtil,
    addChildAfter as addChildAfterUtil,
    removeChild as removeChildUtil,
    moveChildBlock as moveChildBlockUtil,
    addChildToColumn as addChildToColumnUtil
} from './components/child-management.js';
import {
    handleDragStart as handleDragStartUtil,
    handleDragOver as handleDragOverUtil,
    handleDrop as handleDropUtil
} from './components/drag-drop.js';
import {
    saveToJSON as saveToJSONUtil,
    loadFromJSON as loadFromJSONUtil,
    importJSON as importJSONUtil,
    exportJSON as exportJSONUtil
} from './components/storage.js';
import {
    addTableRow,
    removeTableRow,
    addTableColumn,
    removeTableColumn,
    mergeTableCells,
    unmergeTableCells,
    updateTableCellContent,
    toggleTableHeader,
    toggleTableFooter
} from './components/table-management.js';

function blockEditor() {
    return {
        blocks: [],
        selectedBlockId: null,
        hoveredBlockId: null,
        draggingBlockId: null,
        showToolbar: false,
        blockIdCounter: 0,
        dragStartIndex: null,
        dragOverIndex: null,
        showSidebar: false,

        init() {
            // Start mit einem leeren Paragraph
            if (this.blocks.length === 0) {
                this.addBlock('paragraph');
            }
            // Initialisiere Block-Inhalte nach dem Rendering
            this.$nextTick(() => {
                this.initAllBlockContents();
            });
        },

        initAllBlockContents() {
            initAllBlockContents(this.blocks);
        },

        initBlockContent(element, block, isTextContent = false) {
            initBlockContent(element, block, isTextContent);
        },

        initTableCellContent(element, cell) {
            // Nur initialisieren wenn Element leer ist und Cell Inhalt hat
            if (!element.textContent && cell && cell.content) {
                element.innerHTML = cell.content;
                // Cursor ans Ende setzen
                this.$nextTick(() => {
                    const range = document.createRange();
                    const sel = window.getSelection();
                    range.selectNodeContents(element);
                    range.collapse(false);
                    sel.removeAllRanges();
                    sel.addRange(range);
                });
            }
        },

        openSidebar(blockId = null) {
            if (blockId) {
                this.selectedBlockId = blockId;
            }
            this.showSidebar = true;
        },

        closeSidebar() {
            this.showSidebar = false;
            // this.selectedBlockId = null; // Optional: Block-Auswahl beibehalten
        },

        addBlock(type, content = '') {
            this.blockIdCounter++;
            const block = addBlockUtil(this.blocks, this.selectedBlockId, this.blockIdCounter, type, content);
            this.selectedBlockId = block.id;
            this.showToolbar = false;
            
            // Focus auf den neuen Block
            this.$nextTick(() => {
                const element = document.querySelector(`[data-block-id="${block.id}"]`);
                if (element) {
                    element.focus();
                    // Setze Cursor ans Ende
                    const range = document.createRange();
                    const sel = window.getSelection();
                    range.selectNodeContents(element);
                    range.collapse(false);
                    sel.removeAllRanges();
                    sel.addRange(range);
                }
            });
        },

        addBlockAfter(blockId, type = 'paragraph') {
            this.blockIdCounter++;
            const block = addBlockAfterUtil(this.blocks, blockId, this.blockIdCounter, type);
            this.selectedBlockId = block.id;
            
            this.$nextTick(() => {
                const element = document.querySelector(`[data-block-id="${block.id}"]`);
                if (element) {
                    element.focus();
                    // Setze Cursor ans Ende
                    const range = document.createRange();
                    const sel = window.getSelection();
                    range.selectNodeContents(element);
                    range.collapse(false);
                    sel.removeAllRanges();
                    sel.addRange(range);
                }
            });
        },

        updateBlockContent(blockId, content) {
            updateBlockContentUtil(this.blocks, blockId, content);
        },

        deleteBlock(blockId) {
            const result = deleteBlockUtil(this.blocks, blockId);
            if (result.deleted) {
                this.selectedBlockId = null;
                
                // Wenn keine Blöcke mehr vorhanden, einen neuen Paragraph hinzufügen
                if (this.blocks.length === 0) {
                    this.addBlock('paragraph');
                } else {
                    // Focus auf den vorherigen oder nächsten Block
                    this.selectedBlockId = this.blocks[result.newSelectedIndex].id;
                }
            }
        },

        selectBlock(blockId) {
            this.selectedBlockId = blockId;
        },

        deselectAll() {
            this.selectedBlockId = null;
            this.showToolbar = false;
        },

        moveBlock(index, direction) {
            moveBlockUtil(this.blocks, index, direction);
        },

        handleBackspace(blockId, event) {
            const { block, parent } = this.findBlockById(blockId);
            if (block && event.target.textContent === '') {
                if (parent) {
                    // Es ist ein Child-Block
                    const childIndex = parent.children.findIndex(c => c.id === blockId);
                    if (childIndex !== -1 && parent.children.length > 1) {
                        event.preventDefault();
                        this.removeChild(parent.id, childIndex);
                    }
                } else {
                    // Es ist ein Haupt-Block
                    if (this.blocks.length > 1) {
                        event.preventDefault();
                        this.deleteBlock(blockId);
                    }
                }
            }
        },

        handleDragStart(event, index, childIndex = null) {
            const result = handleDragStartUtil(event, this.blocks, index, childIndex);
            this.dragStartIndex = result.dragStartIndex;
            this.draggingBlockId = result.draggingBlockId;
        },

        handleDragOver(event, index, childIndex = null) {
            this.dragOverIndex = handleDragOverUtil(event, index, childIndex);
        },

        handleDrop(event, dropIndex, dropChildIndex = null) {
            handleDropUtil(event, this.blocks, this.dragStartIndex, dropIndex, dropChildIndex);
            this.dragStartIndex = null;
            this.dragOverIndex = null;
        },

        handleDragEnd() {
            this.draggingBlockId = null;
            this.dragStartIndex = null;
            this.dragOverIndex = null;
        },

        changeBlockType(blockId, newType) {
            changeBlockTypeUtil(this.blocks, blockId, newType);
            
            // Focus auf den Block nach Typ-Änderung
            this.$nextTick(() => {
                const element = document.querySelector(`[data-block-id="${blockId}"]`);
                if (element) {
                    element.focus();
                }
            });
        },

        updateBlockStyle(blockId, style) {
            updateBlockStyleUtil(this.blocks, blockId, style);
        },

        clearBlockStyle(blockId) {
            clearBlockStyleUtil(this.blocks, blockId);
        },

        updateBlockClasses(blockId, classes) {
            updateBlockClassesUtil(this.blocks, blockId, classes);
        },

        clearBlockClasses(blockId) {
            clearBlockClassesUtil(this.blocks, blockId);
        },

        addChild(parentBlockId, childType) {
            this.blockIdCounter++;
            const childBlock = addChildUtil(this.blocks, parentBlockId, this.blockIdCounter, childType);
            if (childBlock) {
                this.selectedBlockId = childBlock.id;
                
                this.$nextTick(() => {
                    const element = document.querySelector(`[data-block-id="${childBlock.id}"]`);
                    if (element) {
                        element.focus();
                    }
                });
            }
        },

        addChildAfter(parentBlockId, childIndex, childType) {
            this.blockIdCounter++;
            const childBlock = addChildAfterUtil(this.blocks, parentBlockId, childIndex, this.blockIdCounter, childType);
            if (childBlock) {
                this.selectedBlockId = childBlock.id;
                
                this.$nextTick(() => {
                    const element = document.querySelector(`[data-block-id="${childBlock.id}"]`);
                    if (element) {
                        element.focus();
                    }
                });
            }
        },

        removeChild(parentBlockId, childIndex) {
            removeChildUtil(this.blocks, parentBlockId, childIndex);
        },

        moveChildBlock(parentBlockId, childIndex, direction) {
            moveChildBlockUtil(this.blocks, parentBlockId, childIndex, direction);
        },

        addChildToColumn(parentBlockId, childType, columnIndex, totalColumns) {
            this.blockIdCounter++;
            const childBlock = addChildToColumnUtil(this.blocks, parentBlockId, this.blockIdCounter, childType, columnIndex, totalColumns);
            if (childBlock) {
                this.selectedBlockId = childBlock.id;
                
                this.$nextTick(() => {
                    const element = document.querySelector(`[data-block-id="${childBlock.id}"]`);
                    if (element) {
                        element.focus();
                    }
                });
            }
        },

        findBlockById(blockId) {
            return findBlockById(this.blocks, blockId);
        },

        getAllBlocks() {
            return getAllBlocks(this.blocks);
        },

        saveToJSON() {
            saveToJSONUtil(this.blocks);
        },

        loadFromJSON() {
            const result = loadFromJSONUtil(this.blocks, this.blockIdCounter, this.$nextTick.bind(this), initAllBlockContents);
            if (result.blocks) {
                this.selectedBlockId = null;
                this.blockIdCounter = result.blockIdCounter;
            }
        },

        importJSON() {
            const updateCounter = (newCounter) => {
                this.blockIdCounter = newCounter;
            };
            importJSONUtil(this.blocks, this.blockIdCounter, this.$nextTick.bind(this), initAllBlockContents, updateCounter);
        },

        exportJSON() {
            exportJSONUtil(this.blocks);
        },

        // Table Management Functions
        addTableRow(blockId, position = 'bottom') {
            const result = addTableRow(this.blocks, blockId, this.blockIdCounter, position);
            if (result) {
                this.blockIdCounter = result.lastCellIdCounter + 1;
            }
        },

        removeTableRow(blockId, rowIndex) {
            removeTableRow(this.blocks, blockId, rowIndex);
        },

        addTableColumn(blockId, position = 'right') {
            const result = addTableColumn(this.blocks, blockId, this.blockIdCounter, position);
            if (result) {
                this.blockIdCounter = result.lastCellIdCounter + 1;
            }
        },

        removeTableColumn(blockId, colIndex) {
            removeTableColumn(this.blocks, blockId, colIndex);
        },

        mergeTableCells(blockId, startRow, startCol, endRow, endCol) {
            mergeTableCells(this.blocks, blockId, startRow, startCol, endRow, endCol);
        },

        unmergeTableCells(blockId, row, col) {
            unmergeTableCells(this.blocks, blockId, row, col);
        },

        updateTableCellContent(blockId, cellId, content) {
            updateTableCellContent(this.blocks, blockId, cellId, content);
        },

        toggleTableHeader(blockId) {
            toggleTableHeader(this.blocks, blockId);
        },

        toggleTableFooter(blockId) {
            toggleTableFooter(this.blocks, blockId);
        },

        getSelectedTableCell() {
            const selection = window.getSelection();
            if (selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                let cell = range.commonAncestorContainer;
                while (cell && cell.nodeName !== 'TD' && cell.nodeName !== 'TH') {
                    cell = cell.parentNode;
                }
                if (cell) {
                    return {
                        cell: cell,
                        rowIndex: cell.parentNode.rowIndex,
                        colIndex: cell.cellIndex
                    };
                }
            }
            return null;
        }
    }
}

// Registriere die Komponente global für Alpine.js
window.blockEditor = blockEditor;

