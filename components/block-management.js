// Block Management Functions
import { generateId, findBlockById } from './utils.js';
import { initializeTable } from './table-management.js';

export function createBlock(blockIdCounter, type, content = '') {
    const block = {
        id: generateId(blockIdCounter),
        type: type,
        content: content,
        style: '',
        classes: '',
        children: [],
        createdAt: new Date().toISOString()
    };
    
    // Initialize table data if it's a table
    if (type === 'table') {
        const tableData = initializeTable(blockIdCounter, 3, 3, true, false);
        block.tableData = tableData;
        block.tableData.lastCellIdCounter = tableData.lastCellIdCounter;
    }
    
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

export function changeBlockType(blocks, blockId, newType) {
    const { block } = findBlockById(blocks, blockId);
    if (block) {
        const oldContent = block.content;
        block.type = newType;
        block.content = oldContent;
        block.updatedAt = new Date().toISOString();
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

