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
    
    // Initialize link data if it's a link
    if (type === 'link') {
        block.linkText = content || 'Link-Text';
        block.linkUrl = '';
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
        const oldType = block.type;
        
        block.type = newType;
        block.content = oldContent;
        block.updatedAt = new Date().toISOString();
        
        // Initialize link data if changing to link type
        if (newType === 'link' && oldType !== 'link') {
            block.linkText = oldContent || 'Link-Text';
            block.linkUrl = '';
        }
        
        // Clean up link data if changing away from link type
        if (oldType === 'link' && newType !== 'link') {
            delete block.linkText;
            delete block.linkUrl;
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

export function updateLinkText(blocks, blockId, linkText) {
    const { block } = findBlockById(blocks, blockId);
    if (block && block.type === 'link') {
        block.linkText = linkText;
        block.content = linkText; // Keep content in sync for compatibility
        block.updatedAt = new Date().toISOString();
    }
}

export function updateLinkUrl(blocks, blockId, linkUrl) {
    const { block } = findBlockById(blocks, blockId);
    if (block && block.type === 'link') {
        block.linkUrl = linkUrl;
        block.updatedAt = new Date().toISOString();
    }
}

