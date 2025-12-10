// Child Block Management Functions
import { generateId, findBlockById } from './utils.js';
import { getColumnCount, isContainerBlock, canBlockHaveChildren } from './block-types.js';

export function addChild(blocks, parentBlockId, blockIdCounter, childType) {
    const parentBlock = blocks.find(b => b.id === parentBlockId);
    if (parentBlock) {
        // Prüfe ob der Parent-Block Kinder haben darf
        if (!canBlockHaveChildren(parentBlock.type)) {
            return null;
        }
        
        if (!parentBlock.children) {
            parentBlock.children = [];
        }
        
        const childBlock = {
            id: generateId(blockIdCounter),
            type: childType,
            content: '',
            style: '',
            classes: '',
            createdAt: new Date().toISOString()
        };
        
        // Initialize image data if it's an image
        if (childType === 'image') {
            childBlock.imageUrl = '';
            childBlock.imageAlt = '';
            childBlock.imageTitle = '';
        }
        
        // Initialize children array ONLY for container blocks
        if (isContainerBlock(childType)) {
            if (childType === 'table') {
                childBlock.children = [];
            } else if (childType === 'twoColumn' || childType === 'threeColumn') {
                const childColumnCount = getColumnCount(childType);
                if (childColumnCount > 0) {
                    childBlock.children = [];
                    for (let i = 0; i < childColumnCount; i++) {
                        childBlock.children.push({
                            id: generateId(blockIdCounter + i + 1),
                            type: 'column',
                            content: '',
                            style: '',
                            classes: '',
                            children: [],
                            createdAt: new Date().toISOString()
                        });
                    }
                } else {
                    childBlock.children = [];
                }
            } else {
                childBlock.children = [];
            }
        }
        // Non-container blocks should NOT have children array
        
        parentBlock.children.push(childBlock);
        parentBlock.updatedAt = new Date().toISOString();
        
        // Validate that the child block has correct column structure
        if (isContainerBlock(childType) && (childType === 'twoColumn' || childType === 'threeColumn')) {
            const expectedColumnCount = getColumnCount(childType);
            if (childBlock.children && childBlock.children.length !== expectedColumnCount) {
                // Fix column count if incorrect
                if (childBlock.children.length > expectedColumnCount) {
                    childBlock.children = childBlock.children.slice(0, expectedColumnCount);
                } else {
                    while (childBlock.children.length < expectedColumnCount) {
                        const idx = childBlock.children.length;
                        childBlock.children.push({
                            id: generateId(blockIdCounter + idx + 1),
                            type: 'column',
                            content: '',
                            style: '',
                            classes: '',
                            children: [],
                            createdAt: new Date().toISOString()
                        });
                    }
                }
            }
        }
        
        return childBlock;
    }
    return null;
}

export function addChildAfter(blocks, parentBlockId, childIndex, blockIdCounter, childType) {
    const parentBlock = blocks.find(b => b.id === parentBlockId);
    if (parentBlock && parentBlock.children) {
        // Prüfe ob der Parent-Block Kinder haben darf
        if (!canBlockHaveChildren(parentBlock.type)) {
            return null;
        }
        const childBlock = {
            id: generateId(blockIdCounter),
            type: childType,
            content: '',
            style: '',
            classes: '',
            createdAt: new Date().toISOString()
        };
        
        // Initialize image data if it's an image
        if (childType === 'image') {
            childBlock.imageUrl = '';
            childBlock.imageAlt = '';
            childBlock.imageTitle = '';
        }
        
        // Initialize children array ONLY for container blocks
        if (isContainerBlock(childType)) {
            if (childType === 'table') {
                childBlock.children = [];
            } else if (childType === 'twoColumn' || childType === 'threeColumn') {
                const childColumnCount = getColumnCount(childType);
                if (childColumnCount > 0) {
                    childBlock.children = [];
                    for (let i = 0; i < childColumnCount; i++) {
                        childBlock.children.push({
                            id: generateId(blockIdCounter + i + 1),
                            type: 'column',
                            content: '',
                            style: '',
                            classes: '',
                            children: [],
                            createdAt: new Date().toISOString()
                        });
                    }
                } else {
                    childBlock.children = [];
                }
            } else {
                childBlock.children = [];
            }
        }
        // Non-container blocks should NOT have children array
        
        parentBlock.children.splice(childIndex + 1, 0, childBlock);
        parentBlock.updatedAt = new Date().toISOString();
        
        // Validate that the child block has correct column structure
        if (isContainerBlock(childType) && (childType === 'twoColumn' || childType === 'threeColumn')) {
            const expectedColumnCount = getColumnCount(childType);
            if (childBlock.children && childBlock.children.length !== expectedColumnCount) {
                // Fix column count if incorrect
                if (childBlock.children.length > expectedColumnCount) {
                    childBlock.children = childBlock.children.slice(0, expectedColumnCount);
                } else {
                    while (childBlock.children.length < expectedColumnCount) {
                        const idx = childBlock.children.length;
                        childBlock.children.push({
                            id: generateId(blockIdCounter + idx + 1),
                            type: 'column',
                            content: '',
                            style: '',
                            classes: '',
                            children: [],
                            createdAt: new Date().toISOString()
                        });
                    }
                }
            }
        }
        
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

export function addChildToColumn(blocks, parentBlockId, blockIdCounter, childType, columnIndex) {
    const { block: parentBlock } = findBlockById(blocks, parentBlockId);
    if (!parentBlock) {
        return null;
    }
    
    // If parent is already a column block, add child directly to it
    if (parentBlock.type === 'column') {
        // Column-Blöcke können immer Kinder haben, keine Prüfung nötig
        // Ensure column block has children array
        if (!parentBlock.children) {
            parentBlock.children = [];
        }
        
        // Create the new child block
        const childBlock = {
            id: generateId(blockIdCounter),
            type: childType,
            content: '',
            style: '',
            classes: '',
            createdAt: new Date().toISOString()
        };
        
        // Initialize image data if it's an image
        if (childType === 'image') {
            childBlock.imageUrl = '';
            childBlock.imageAlt = '';
            childBlock.imageTitle = '';
        }
        
        // Initialize children array ONLY for container blocks
        if (isContainerBlock(childType)) {
            if (childType === 'table') {
                childBlock.children = [];
            } else if (childType === 'twoColumn' || childType === 'threeColumn') {
                // Initialize column structure for twoColumn and threeColumn
                const childColumnCount = getColumnCount(childType);
                if (childColumnCount > 0) {
                    childBlock.children = [];
                    for (let i = 0; i < childColumnCount; i++) {
                        childBlock.children.push({
                            id: generateId(blockIdCounter + i + 1), // Increment counter for each column
                            type: 'column',
                            content: '',
                            style: '',
                            classes: '',
                            children: [],
                            createdAt: new Date().toISOString()
                        });
                    }
                } else {
                    childBlock.children = [];
                }
            } else {
                // Other container blocks (like future container types)
                childBlock.children = [];
            }
        }
        // Non-container blocks should NOT have children array
        
        // Add the child block to the column's children
        parentBlock.children.push(childBlock);
        parentBlock.updatedAt = new Date().toISOString();
        
        // Validate that the child block has correct column structure
        if (isContainerBlock(childType) && (childType === 'twoColumn' || childType === 'threeColumn')) {
            const expectedColumnCount = getColumnCount(childType);
            if (childBlock.children && childBlock.children.length !== expectedColumnCount) {
                // Fix column count if incorrect
                if (childBlock.children.length > expectedColumnCount) {
                    childBlock.children = childBlock.children.slice(0, expectedColumnCount);
                } else {
                    while (childBlock.children.length < expectedColumnCount) {
                        const idx = childBlock.children.length;
                        childBlock.children.push({
                            id: generateId(blockIdCounter + idx + 1),
                            type: 'column',
                            content: '',
                            style: '',
                            classes: '',
                            children: [],
                            createdAt: new Date().toISOString()
                        });
                    }
                }
            }
        }
        
        return childBlock;
    }
    
    // If parent is twoColumn or threeColumn, use existing logic
    if (parentBlock.type === 'twoColumn' || parentBlock.type === 'threeColumn') {
        // Prüfe ob der Parent-Block Kinder haben darf
        if (!canBlockHaveChildren(parentBlock.type)) {
            return null;
        }
        
        // Get the correct column count from the block type
        const requiredColumnCount = getColumnCount(parentBlock.type);
        
        // Ensure children array exists and has column blocks
        if (!parentBlock.children || parentBlock.children.length === 0) {
            // Initialize column blocks if they don't exist
            parentBlock.children = [];
            for (let i = 0; i < requiredColumnCount; i++) {
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
        } else {
            // Only fix column count if it's wrong - don't modify if correct
            if (parentBlock.children.length !== requiredColumnCount) {
                // Add missing columns
                while (parentBlock.children.length < requiredColumnCount) {
                    const idx = parentBlock.children.length;
                    parentBlock.children.push({
                        id: generateId(blockIdCounter + idx),
                        type: 'column',
                        content: '',
                        style: '',
                        classes: '',
                        children: [],
                        createdAt: new Date().toISOString()
                    });
                }
                // Remove excess columns (only if there are too many)
                if (parentBlock.children.length > requiredColumnCount) {
                    parentBlock.children = parentBlock.children.slice(0, requiredColumnCount);
                }
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
            createdAt: new Date().toISOString()
        };
        
        // Initialize image data if it's an image
        if (childType === 'image') {
            childBlock.imageUrl = '';
            childBlock.imageAlt = '';
            childBlock.imageTitle = '';
        }
        
        // Initialize children array ONLY for container blocks
        if (isContainerBlock(childType)) {
            if (childType === 'table') {
                childBlock.children = [];
            } else if (childType === 'twoColumn' || childType === 'threeColumn') {
                // Initialize column structure for twoColumn and threeColumn
                const childColumnCount = getColumnCount(childType);
                if (childColumnCount > 0) {
                    childBlock.children = [];
                    for (let i = 0; i < childColumnCount; i++) {
                        childBlock.children.push({
                            id: generateId(blockIdCounter + i + 1), // Increment counter for each column
                            type: 'column',
                            content: '',
                            style: '',
                            classes: '',
                            children: [],
                            createdAt: new Date().toISOString()
                        });
                    }
                } else {
                    childBlock.children = [];
                }
            } else {
                // Other container blocks (like future container types)
                childBlock.children = [];
            }
        }
        // Non-container blocks should NOT have children array
        
        // Add the child block to the column's children
        columnBlock.children.push(childBlock);
        parentBlock.updatedAt = new Date().toISOString();
        
        // Validate that the child block has correct column structure
        if (isContainerBlock(childType) && (childType === 'twoColumn' || childType === 'threeColumn')) {
            const expectedColumnCount = getColumnCount(childType);
            if (childBlock.children && childBlock.children.length !== expectedColumnCount) {
                // Fix column count if incorrect
                if (childBlock.children.length > expectedColumnCount) {
                    childBlock.children = childBlock.children.slice(0, expectedColumnCount);
                } else {
                    while (childBlock.children.length < expectedColumnCount) {
                        const idx = childBlock.children.length;
                        childBlock.children.push({
                            id: generateId(blockIdCounter + idx + 1),
                            type: 'column',
                            content: '',
                            style: '',
                            classes: '',
                            children: [],
                            createdAt: new Date().toISOString()
                        });
                    }
                }
            }
        }
        
        return childBlock;
    }
    
    return null;
}

