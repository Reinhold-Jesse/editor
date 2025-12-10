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
        
        // Calculate insertion index based on column
        // For two-column: column 0 -> indices 0,2,4... (even), column 1 -> indices 1,3,5... (odd)
        // For three-column: column 0 -> 0,3,6..., column 1 -> 1,4,7..., column 2 -> 2,5,8...
        const currentChildren = parentBlock.children.length;
        let insertIndex;
        
        if (totalColumns === 2) {
            // Find the next available index for this column
            // Count how many items are already in this column
            let itemsInColumn = 0;
            for (let i = 0; i < currentChildren; i++) {
                if (i % 2 === columnIndex) {
                    itemsInColumn++;
                }
            }
            // Calculate the target index: column 0 -> 0,2,4... column 1 -> 1,3,5...
            insertIndex = itemsInColumn * totalColumns + columnIndex;
        } else if (totalColumns === 3) {
            // Count how many items are already in this column
            let itemsInColumn = 0;
            for (let i = 0; i < currentChildren; i++) {
                if (i % 3 === columnIndex) {
                    itemsInColumn++;
                }
            }
            // Calculate the target index: column 0 -> 0,3,6... column 1 -> 1,4,7... column 2 -> 2,5,8...
            insertIndex = itemsInColumn * totalColumns + columnIndex;
        } else {
            // Default: append to end
            insertIndex = currentChildren;
        }
        
        parentBlock.children.splice(insertIndex, 0, childBlock);
        parentBlock.updatedAt = new Date().toISOString();
        return childBlock;
    }
    return null;
}

