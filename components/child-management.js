// Child Block Management Functions
import { generateId } from './utils.js';

export function addChild(blocks, parentBlockId, blockIdCounter, childType) {
    const parentBlock = blocks.find(b => b.id === parentBlockId);
    if (parentBlock) {
        if (!parentBlock.children) {
            parentBlock.children = [];
        }
        
        const childBlock = {
            id: generateId(blockIdCounter),
            type: childType,
            content: '',
            style: '',
            classes: '',
            children: [],
            createdAt: new Date().toISOString()
        };
        
        // Initialize image data if it's an image
        if (childType === 'image') {
            childBlock.imageUrl = '';
            childBlock.imageAlt = '';
            childBlock.imageTitle = '';
        }
        
        parentBlock.children.push(childBlock);
        parentBlock.updatedAt = new Date().toISOString();
        return childBlock;
    }
    return null;
}

export function addChildAfter(blocks, parentBlockId, childIndex, blockIdCounter, childType) {
    const parentBlock = blocks.find(b => b.id === parentBlockId);
    if (parentBlock && parentBlock.children) {
        const childBlock = {
            id: generateId(blockIdCounter),
            type: childType,
            content: '',
            style: '',
            classes: '',
            children: [],
            createdAt: new Date().toISOString()
        };
        
        // Initialize image data if it's an image
        if (childType === 'image') {
            childBlock.imageUrl = '';
            childBlock.imageAlt = '';
            childBlock.imageTitle = '';
        }
        
        parentBlock.children.splice(childIndex + 1, 0, childBlock);
        parentBlock.updatedAt = new Date().toISOString();
        return childBlock;
    }
    return null;
}

export function removeChild(blocks, parentBlockId, childIndex) {
    const parentBlock = blocks.find(b => b.id === parentBlockId);
    if (parentBlock && parentBlock.children) {
        parentBlock.children.splice(childIndex, 1);
        parentBlock.updatedAt = new Date().toISOString();
        if (parentBlock.children.length === 0) {
            delete parentBlock.children;
        }
    }
}

export function removeChildFromColumn(blocks, parentBlockId, columnIndex, childIndex) {
    const parentBlock = blocks.find(b => b.id === parentBlockId);
    if (parentBlock && parentBlock.children && parentBlock.children[columnIndex]) {
        const columnBlock = parentBlock.children[columnIndex];
        if (columnBlock.children) {
            columnBlock.children.splice(childIndex, 1);
            parentBlock.updatedAt = new Date().toISOString();
            if (columnBlock.children.length === 0) {
                columnBlock.children = [];
            }
        }
    }
}

export function moveChildBlock(blocks, parentBlockId, childIndex, direction) {
    const parentBlock = blocks.find(b => b.id === parentBlockId);
    if (parentBlock && parentBlock.children) {
        if (direction === 'up' && childIndex > 0) {
            [parentBlock.children[childIndex - 1], parentBlock.children[childIndex]] = 
            [parentBlock.children[childIndex], parentBlock.children[childIndex - 1]];
        } else if (direction === 'down' && childIndex < parentBlock.children.length - 1) {
            [parentBlock.children[childIndex], parentBlock.children[childIndex + 1]] = 
            [parentBlock.children[childIndex + 1], parentBlock.children[childIndex]];
        }
    }
}

export function addChildToColumn(blocks, parentBlockId, blockIdCounter, childType, columnIndex, totalColumns) {
    const parentBlock = blocks.find(b => b.id === parentBlockId);
    if (parentBlock && (parentBlock.type === 'twoColumn' || parentBlock.type === 'threeColumn')) {
        // Ensure children array exists and has column blocks
        if (!parentBlock.children || parentBlock.children.length === 0) {
            // Initialize column blocks if they don't exist
            parentBlock.children = [];
            for (let i = 0; i < totalColumns; i++) {
                parentBlock.children.push({
                    id: generateId(blockIdCounter + i),
                    type: 'column',
                    content: '',
                    style: '',
                    classes: '',
                    children: [],
                    createdAt: new Date().toISOString()
                });
            }
        }
        
        // Find the column block at the specified index
        const columnBlock = parentBlock.children[columnIndex];
        if (!columnBlock) {
            return null;
        }
        
        // Ensure column block has children array
        if (!columnBlock.children) {
            columnBlock.children = [];
        }
        
        // Create the new child block
        const childBlock = {
            id: generateId(blockIdCounter),
            type: childType,
            content: '',
            style: '',
            classes: '',
            children: [],
            createdAt: new Date().toISOString()
        };
        
        // Initialize image data if it's an image
        if (childType === 'image') {
            childBlock.imageUrl = '';
            childBlock.imageAlt = '';
            childBlock.imageTitle = '';
        }
        
        // Initialize children array for container blocks
        if (childType === 'twoColumn' || childType === 'threeColumn' || childType === 'table') {
            childBlock.children = [];
        }
        
        // Add the child block to the column's children
        columnBlock.children.push(childBlock);
        parentBlock.updatedAt = new Date().toISOString();
        return childBlock;
    }
    return null;
}

