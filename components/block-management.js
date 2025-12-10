// Block Management Functions
import { generateId, findBlockById } from './utils.js';
import { initializeTable } from './table-management.js';
import { getColumnCount, isContainerBlock } from './block-types.js';

export function createBlock(blockIdCounter, type, content = '') {
    const block = {
        id: generateId(blockIdCounter),
        type: type,
        content: content,
        style: '',
        classes: '',
        createdAt: new Date().toISOString()
    };
    
    // Initialize table data if it's a table
    if (type === 'table') {
        const tableData = initializeTable(blockIdCounter, 3, 3, true, false);
        block.tableData = tableData;
        block.tableData.lastCellIdCounter = tableData.lastCellIdCounter;
    }
    
    // Initialize image data if it's an image
    if (type === 'image') {
        block.imageUrl = '';
        block.imageAlt = '';
        block.imageTitle = '';
    }
    
    // Initialize children array ONLY for container blocks
    if (isContainerBlock(type)) {
        const columnCount = getColumnCount(type);
        if (columnCount > 0) {
            // Initialize column structure for twoColumn and threeColumn
            block.children = [];
            for (let i = 0; i < columnCount; i++) {
                block.children.push({
                    id: generateId(blockIdCounter + i + 1),
                    type: 'column',
                    content: '',
                    style: '',
                    classes: '',
                    children: [],
                    createdAt: new Date().toISOString()
                });
            }
        } else if (type === 'table') {
            block.children = [];
        } else {
            // Other container blocks
            block.children = [];
        }
    }
    // Non-container blocks should NOT have children array
    
    return block;
}

export function addBlock(blocks, selectedBlockId, blockIdCounter, type, content = '') {
    const block = createBlock(blockIdCounter, type, content);
    
    if (selectedBlockId) {
        const index = blocks.findIndex(b => b.id === selectedBlockId);
        blocks.splice(index + 1, 0, block);
    } else {
        blocks.push(block);
    }
    
    return block;
}

export function addBlockAfter(blocks, blockId, blockIdCounter, type = 'paragraph') {
    const index = blocks.findIndex(b => b.id === blockId);
    const block = createBlock(blockIdCounter, type, '');
    blocks.splice(index + 1, 0, block);
    return block;
}

export function updateBlockContent(blocks, blockId, content) {
    const { block } = findBlockById(blocks, blockId);
    
    if (block) {
        block.content = content;
        block.updatedAt = new Date().toISOString();
    }
}

export function deleteBlock(blocks, blockId) {
    const index = blocks.findIndex(b => b.id === blockId);
    if (index !== -1) {
        blocks.splice(index, 1);
        return { deleted: true, newSelectedIndex: index > 0 ? index - 1 : 0 };
    }
    return { deleted: false, newSelectedIndex: null };
}

export function changeBlockType(blocks, blockId, newType, blockIdCounter = 0) {
    const { block } = findBlockById(blocks, blockId);
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
            const tableData = initializeTable(blockId, 3, 3, true, false);
            block.tableData = tableData;
            block.tableData.lastCellIdCounter = tableData.lastCellIdCounter;
        }
        
        // Clean up table data if changing away from table type
        if (oldType === 'table' && newType !== 'table') {
            delete block.tableData;
        }
        
        // Initialize column structure if changing to twoColumn or threeColumn
        const columnCount = getColumnCount(newType);
        if (columnCount > 0 && (oldType !== 'twoColumn' && oldType !== 'threeColumn')) {
            block.children = [];
            for (let i = 0; i < columnCount; i++) {
                block.children.push({
                    id: generateId(blockIdCounter + i + 1),
                    type: 'column',
                    content: '',
                    style: '',
                    classes: '',
                    children: [],
                    createdAt: new Date().toISOString()
                });
            }
        }
        
        // Clean up column structure if changing away from column layouts
        if ((oldType === 'twoColumn' || oldType === 'threeColumn') && newType !== 'twoColumn' && newType !== 'threeColumn') {
            delete block.children;
        }
    }
}

export function updateBlockStyle(blocks, blockId, style) {
    const { block } = findBlockById(blocks, blockId);
    if (block) {
        block.style = style;
        block.updatedAt = new Date().toISOString();
    }
}

export function clearBlockStyle(blocks, blockId) {
    const { block } = findBlockById(blocks, blockId);
    if (block) {
        block.style = '';
        block.updatedAt = new Date().toISOString();
    }
}

export function updateBlockClasses(blocks, blockId, classes) {
    const { block } = findBlockById(blocks, blockId);
    if (block) {
        block.classes = classes;
        block.updatedAt = new Date().toISOString();
    }
}

export function clearBlockClasses(blocks, blockId) {
    const { block } = findBlockById(blocks, blockId);
    if (block) {
        block.classes = '';
        block.updatedAt = new Date().toISOString();
    }
}

export function moveBlock(blocks, index, direction) {
    if (direction === 'up' && index > 0) {
        [blocks[index - 1], blocks[index]] = [blocks[index], blocks[index - 1]];
    } else if (direction === 'down' && index < blocks.length - 1) {
        [blocks[index], blocks[index + 1]] = [blocks[index + 1], blocks[index]];
    }
}

export function updateImageUrl(blocks, blockId, imageUrl) {
    const { block } = findBlockById(blocks, blockId);
    if (block && block.type === 'image') {
        block.imageUrl = imageUrl;
        block.updatedAt = new Date().toISOString();
    }
}

export function updateImageAlt(blocks, blockId, imageAlt) {
    const { block } = findBlockById(blocks, blockId);
    if (block && block.type === 'image') {
        block.imageAlt = imageAlt;
        block.updatedAt = new Date().toISOString();
    }
}

export function updateImageTitle(blocks, blockId, imageTitle) {
    const { block } = findBlockById(blocks, blockId);
    if (block && block.type === 'image') {
        block.imageTitle = imageTitle;
        block.updatedAt = new Date().toISOString();
    }
}

// Stellt sicher, dass Column-Blöcke die richtige Anzahl von Spalten haben
export function ensureColumnStructure(blocks) {
    function fixBlockColumns(block) {
        // Entferne children Array von nicht-Container-Blöcken
        if (!isContainerBlock(block.type)) {
            if (block.children && block.children.length > 0) {
                delete block.children;
            }
        } else {
            // Für Container-Blöcke: Stelle sicher, dass die richtige Struktur vorhanden ist
            const columnCount = getColumnCount(block.type);
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
                
                // Entferne überschüssige Spalten
                if (block.children.length > columnCount) {
                    block.children = block.children.slice(0, columnCount);
                }
            } else if (block.type === 'table') {
                // Table-Blöcke: children sollte ein Array sein (für zukünftige Erweiterungen)
                if (!block.children) {
                    block.children = [];
                }
            }
        }
        
        // Rekursiv für verschachtelte Blöcke
        if (block.children && Array.isArray(block.children)) {
            block.children.forEach(child => {
                // Prüfe ob es eine Spalte ist (dann rekursiv für deren children)
                if (child.type === 'column' && child.children) {
                    child.children.forEach(grandChild => {
                        fixBlockColumns(grandChild);
                    });
                } else {
                    // Normales Child
                    fixBlockColumns(child);
                }
            });
        }
    }
    
    blocks.forEach(block => {
        fixBlockColumns(block);
    });
}

