// Block Management Functions - als Objekt organisiert
import { Utils } from './utils.js';
import { TableManagement } from './table-management.js';
import { ChecklistManagement } from './checklist-management.js';
import { BlockTypes } from './block-types.js';

export const BlockManagement = {
    createBlock(blockIdCounter, type, content = '') {
        const block = {
            id: Utils.generateId(blockIdCounter),
            type: type,
            content: content,
            style: '',
            classes: '',
            createdAt: new Date().toISOString()
        };
        
        // Initialize table data if it's a table
        if (type === 'table') {
            const tableData = TableManagement.initializeTable(blockIdCounter, 3, 3, true, false);
            block.tableData = tableData;
            block.tableData.lastCellIdCounter = tableData.lastCellIdCounter;
        }
        
        // Initialize image data if it's an image
        if (type === 'image') {
            block.imageUrl = '';
            block.imageAlt = '';
            block.imageTitle = '';
        }
        
        // Initialize checklist data if it's a checklist
        if (type === 'checklist') {
            const checklistData = ChecklistManagement.initializeChecklist(blockIdCounter, 3);
            block.checklistData = checklistData;
            block.checklistData.lastItemIdCounter = checklistData.lastItemIdCounter;
        }
        
        // Initialize children array ONLY for container blocks
        // Spalten werden später von ensureColumnStructure() erstellt
        if (BlockTypes.isContainerBlock(type)) {
            block.children = [];
        }
        // Non-container blocks should NOT have children array
        
        return block;
    },

    addBlock(blocks, selectedBlockId, blockIdCounter, type, content = '') {
        const block = this.createBlock(blockIdCounter, type, content);
        
        // Immer am Ende einfügen, unabhängig vom ausgewählten Block
        blocks.push(block);
        
        return block;
    },

    addBlockAfter(blocks, blockId, blockIdCounter, type = 'paragraph') {
        const index = blocks.findIndex(b => b.id === blockId);
        const block = this.createBlock(blockIdCounter, type, '');
        blocks.splice(index + 1, 0, block);
        return block;
    },

    updateBlockContent(blocks, blockId, content) {
        const { block } = Utils.findBlockById(blocks, blockId);
        
        if (block) {
            block.content = content;
            block.updatedAt = new Date().toISOString();
        }
    },

    deleteBlock(blocks, blockId) {
        const index = blocks.findIndex(b => b.id === blockId);
        if (index !== -1) {
            blocks.splice(index, 1);
            return { deleted: true, newSelectedIndex: index > 0 ? index - 1 : 0 };
        }
        return { deleted: false, newSelectedIndex: null };
    },

    changeBlockType(blocks, blockId, newType, blockIdCounter = 0) {
        const { block } = Utils.findBlockById(blocks, blockId);
        if (block) {
            const oldContent = block.content;
            const oldType = block.type;
            
            block.type = newType;
            block.content = oldContent;
            block.updatedAt = new Date().toISOString();
            
            // Initialize image data if changing to image type
            if (newType === 'image' && oldType !== 'image') {
                block.imageUrl = '';
                block.imageAlt = '';
                block.imageTitle = '';
            }
            
            // Clean up image data if changing away from image type
            if (oldType === 'image' && newType !== 'image') {
                delete block.imageUrl;
                delete block.imageAlt;
                delete block.imageTitle;
            }
            
            // Initialize table data if changing to table type
            if (newType === 'table' && oldType !== 'table') {
                const tableData = TableManagement.initializeTable(blockId, 3, 3, true, false);
                block.tableData = tableData;
                block.tableData.lastCellIdCounter = tableData.lastCellIdCounter;
            }
            
            // Clean up table data if changing away from table type
            if (oldType === 'table' && newType !== 'table') {
                delete block.tableData;
            }
            
            // Initialize checklist data if changing to checklist type
            if (newType === 'checklist' && oldType !== 'checklist') {
                const checklistData = ChecklistManagement.initializeChecklist(blockId, 3);
                block.checklistData = checklistData;
                block.checklistData.lastItemIdCounter = checklistData.lastItemIdCounter;
            }
            
            // Clean up checklist data if changing away from checklist type
            if (oldType === 'checklist' && newType !== 'checklist') {
                delete block.checklistData;
            }
            
            // Clean up column structure if changing away from column layouts
            if ((oldType === 'twoColumn' || oldType === 'threeColumn') && newType !== 'twoColumn' && newType !== 'threeColumn') {
                delete block.children;
            }
            
            // Initialize children array for container blocks (wenn noch nicht vorhanden)
            if (BlockTypes.isContainerBlock(newType) && !block.children) {
                block.children = [];
            }
            
            // Spalten werden später von ensureColumnStructure() erstellt/korrigiert
        }
    },

    updateBlockStyle(blocks, blockId, style) {
        const { block } = Utils.findBlockById(blocks, blockId);
        if (block) {
            block.style = style;
            block.updatedAt = new Date().toISOString();
        }
    },

    clearBlockStyle(blocks, blockId) {
        const { block } = Utils.findBlockById(blocks, blockId);
        if (block) {
            block.style = '';
            block.updatedAt = new Date().toISOString();
        }
    },

    updateBlockClasses(blocks, blockId, classes) {
        const { block } = Utils.findBlockById(blocks, blockId);
        if (block) {
            block.classes = classes;
            block.updatedAt = new Date().toISOString();
        }
    },

    clearBlockClasses(blocks, blockId) {
        const { block } = Utils.findBlockById(blocks, blockId);
        if (block) {
            block.classes = '';
            block.updatedAt = new Date().toISOString();
        }
    },

    moveBlock(blocks, index, direction) {
        if (direction === 'up' && index > 0) {
            [blocks[index - 1], blocks[index]] = [blocks[index], blocks[index - 1]];
        } else if (direction === 'down' && index < blocks.length - 1) {
            [blocks[index], blocks[index + 1]] = [blocks[index + 1], blocks[index]];
        }
    },

    updateImageUrl(blocks, blockId, imageUrl) {
        const { block } = Utils.findBlockById(blocks, blockId);
        if (block && block.type === 'image') {
            block.imageUrl = imageUrl;
            block.updatedAt = new Date().toISOString();
        }
    },

    updateImageAlt(blocks, blockId, imageAlt) {
        const { block } = Utils.findBlockById(blocks, blockId);
        if (block && block.type === 'image') {
            block.imageAlt = imageAlt;
            block.updatedAt = new Date().toISOString();
        }
    },

    updateImageTitle(blocks, blockId, imageTitle) {
        const { block } = Utils.findBlockById(blocks, blockId);
        if (block && block.type === 'image') {
            block.imageTitle = imageTitle;
            block.updatedAt = new Date().toISOString();
        }
    },

    // Stellt sicher, dass Column-Blöcke die richtige Anzahl von Spalten haben
    ensureColumnStructure(blocks) {
        const self = this;
        function fixBlockColumns(block) {
            if (!block) return;
            
            // Für Container-Blöcke: Stelle sicher, dass die richtige Struktur vorhanden ist
            if (BlockTypes.isContainerBlock(block.type)) {
                const columnCount = BlockTypes.getColumnCount(block.type);
                if (columnCount > 0) {
                    // Column-Blöcke (twoColumn, threeColumn)
                    if (!block.children) {
                        block.children = [];
                    }
                    
                    // Stelle sicher, dass genau die richtige Anzahl von Spalten vorhanden ist
                    while (block.children.length < columnCount) {
                        const columnIndex = block.children.length;
                        block.children.push({
                            id: `col-${block.id}-${columnIndex}`,
                            type: 'column',
                            content: '',
                            style: '',
                            classes: '',
                            children: [],
                            createdAt: new Date().toISOString()
                        });
                    }
                    
                    // Entferne überschüssige Spalten (WICHTIG: Dies korrigiert falsche Spaltenanzahl)
                    if (block.children.length > columnCount) {
                        block.children = block.children.slice(0, columnCount);
                    }
                } else if (block.type === 'table') {
                    // Table-Blöcke: children sollte ein Array sein (für zukünftige Erweiterungen)
                    if (!block.children) {
                        block.children = [];
                    }
                } else if (block.type === 'checklist') {
                    // Checklist-Blöcke: sollten KEINE children haben (verwenden checklistData.items)
                    if (block.children && block.children.length > 0) {
                        delete block.children;
                    }
                }
            } else {
                // Entferne children Array von nicht-Container-Blöcken
                // image, divider, checklist und andere void/non-container Blöcke sollten KEINE children haben
                if (block.children && block.children.length > 0) {
                    // Nur Container-Blöcke sollten children haben
                    delete block.children;
                }
            }
            
            // Rekursiv für verschachtelte Blöcke
            if (block.children && Array.isArray(block.children)) {
                block.children.forEach(child => {
                    // Prüfe ob es eine Spalte ist (dann rekursiv für deren children)
                    if (child.type === 'column') {
                        // Column-Blöcke: rekursiv für deren children
                        if (child.children && Array.isArray(child.children)) {
                            child.children.forEach(grandChild => {
                                fixBlockColumns(grandChild);
                            });
                        }
                    } else {
                        // Normales Child (kann auch ein Container-Block sein) - rekursiv behandeln
                        fixBlockColumns(child);
                    }
                });
            }
        }
        
        blocks.forEach(block => {
            fixBlockColumns(block);
        });
    }
};

// Legacy Exports für Rückwärtskompatibilität
export const createBlock = BlockManagement.createBlock.bind(BlockManagement);
export const addBlock = BlockManagement.addBlock.bind(BlockManagement);
export const addBlockAfter = BlockManagement.addBlockAfter.bind(BlockManagement);
export const updateBlockContent = BlockManagement.updateBlockContent.bind(BlockManagement);
export const deleteBlock = BlockManagement.deleteBlock.bind(BlockManagement);
export const changeBlockType = BlockManagement.changeBlockType.bind(BlockManagement);
export const updateBlockStyle = BlockManagement.updateBlockStyle.bind(BlockManagement);
export const clearBlockStyle = BlockManagement.clearBlockStyle.bind(BlockManagement);
export const updateBlockClasses = BlockManagement.updateBlockClasses.bind(BlockManagement);
export const clearBlockClasses = BlockManagement.clearBlockClasses.bind(BlockManagement);
export const moveBlock = BlockManagement.moveBlock.bind(BlockManagement);
export const updateImageUrl = BlockManagement.updateImageUrl.bind(BlockManagement);
export const updateImageAlt = BlockManagement.updateImageAlt.bind(BlockManagement);
export const updateImageTitle = BlockManagement.updateImageTitle.bind(BlockManagement);
export const ensureColumnStructure = BlockManagement.ensureColumnStructure.bind(BlockManagement);
