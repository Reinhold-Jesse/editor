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

