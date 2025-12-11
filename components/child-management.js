// Child Block Management Functions - als Objekt organisiert
import { Utils } from './utils.js';
import { BlockTypes } from './block-types.js';
import { initializeBlock } from './block-components.js';

export const ChildManagement = {
    addChild(blocks, parentBlockId, blockIdCounter, childType) {
        const parentBlock = blocks.find(b => b.id === parentBlockId);
        if (parentBlock) {
            // Prüfe ob der Parent-Block Kinder haben darf
            if (!BlockTypes.canBlockHaveChildren(parentBlock.type)) {
                return null;
            }
            
            if (!parentBlock.children) {
                parentBlock.children = [];
            }
            
            const childBlock = {
                id: Utils.generateId(blockIdCounter),
                type: childType,
                content: '',
                style: '',
                classes: '',
                createdAt: new Date().toISOString()
            };
            
            // Dynamische Initialisierung über Block-Komponenten
            initializeBlock(childBlock, blockIdCounter);
            
            // Initialize children array ONLY for container blocks
            // Spalten werden später von ensureColumnStructure() erstellt
            if (BlockTypes.isContainerBlock(childType)) {
                if (!childBlock.children) {
                    childBlock.children = [];
                }
            }
            // Non-container blocks should NOT have children array
            
            parentBlock.children.push(childBlock);
            parentBlock.updatedAt = new Date().toISOString();
            
            return childBlock;
        }
        return null;
    },

    addChildAfter(blocks, parentBlockId, childIndex, blockIdCounter, childType) {
        const parentBlock = blocks.find(b => b.id === parentBlockId);
        if (parentBlock && parentBlock.children) {
            // Prüfe ob der Parent-Block Kinder haben darf
            if (!BlockTypes.canBlockHaveChildren(parentBlock.type)) {
                return null;
            }
            const childBlock = {
                id: Utils.generateId(blockIdCounter),
                type: childType,
                content: '',
                style: '',
                classes: '',
                createdAt: new Date().toISOString()
            };
            
            // Dynamische Initialisierung über Block-Komponenten
            initializeBlock(childBlock, blockIdCounter);
            
            // Initialize children array ONLY for container blocks
            // Spalten werden später von ensureColumnStructure() erstellt
            if (BlockTypes.isContainerBlock(childType)) {
                if (!childBlock.children) {
                    childBlock.children = [];
                }
            }
            // Non-container blocks should NOT have children array
            
            parentBlock.children.splice(childIndex + 1, 0, childBlock);
            parentBlock.updatedAt = new Date().toISOString();
            
            return childBlock;
        }
        return null;
    },

    removeChild(blocks, parentBlockId, childIndex) {
        const parentBlock = blocks.find(b => b.id === parentBlockId);
        if (parentBlock && parentBlock.children) {
            parentBlock.children.splice(childIndex, 1);
            parentBlock.updatedAt = new Date().toISOString();
            if (parentBlock.children.length === 0) {
                delete parentBlock.children;
            }
        }
    },

    removeChildFromColumn(blocks, parentBlockId, columnIndex, childIndex) {
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
    },

    moveChildBlock(blocks, parentBlockId, childIndex, direction) {
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
    },

    addChildToColumn(blocks, parentBlockId, blockIdCounter, childType, columnIndex) {
        const { block: parentBlock } = Utils.findBlockById(blocks, parentBlockId);
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
                id: Utils.generateId(blockIdCounter),
                type: childType,
                content: '',
                style: '',
                classes: '',
                createdAt: new Date().toISOString()
            };
            
            // Dynamische Initialisierung über Block-Komponenten
            initializeBlock(childBlock, blockIdCounter);
            
            // Initialize children array ONLY for container blocks
            // Spalten werden später von ensureColumnStructure() erstellt
            if (BlockTypes.isContainerBlock(childType)) {
                if (!childBlock.children) {
                    childBlock.children = [];
                }
            }
            // Non-container blocks should NOT have children array
            
            // Add the child block to the column's children
            parentBlock.children.push(childBlock);
            parentBlock.updatedAt = new Date().toISOString();
            
            return childBlock;
        }
        
        // If parent is twoColumn or threeColumn, use existing logic
        if (parentBlock.type === 'twoColumn' || parentBlock.type === 'threeColumn') {
            // Prüfe ob der Parent-Block Kinder haben darf
            if (!BlockTypes.canBlockHaveChildren(parentBlock.type)) {
                return null;
            }
            
            // Ensure children array exists (Spalten werden später von ensureColumnStructure() erstellt)
            if (!parentBlock.children) {
                parentBlock.children = [];
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
                id: Utils.generateId(blockIdCounter),
                type: childType,
                content: '',
                style: '',
                classes: '',
                createdAt: new Date().toISOString()
            };
            
            // Dynamische Initialisierung über Block-Komponenten
            initializeBlock(childBlock, blockIdCounter);
            
            // Initialize children array ONLY for container blocks
            // Spalten werden später von ensureColumnStructure() erstellt
            if (BlockTypes.isContainerBlock(childType)) {
                if (!childBlock.children) {
                    childBlock.children = [];
                }
            }
            // Non-container blocks should NOT have children array
            
            // Add the child block to the column's children
            columnBlock.children.push(childBlock);
            parentBlock.updatedAt = new Date().toISOString();
            
            return childBlock;
        }
        
        return null;
    }
};

// Legacy Exports für Rückwärtskompatibilität
export const addChild = ChildManagement.addChild.bind(ChildManagement);
export const addChildAfter = ChildManagement.addChildAfter.bind(ChildManagement);
export const removeChild = ChildManagement.removeChild.bind(ChildManagement);
export const removeChildFromColumn = ChildManagement.removeChildFromColumn.bind(ChildManagement);
export const moveChildBlock = ChildManagement.moveChildBlock.bind(ChildManagement);
export const addChildToColumn = ChildManagement.addChildToColumn.bind(ChildManagement);
