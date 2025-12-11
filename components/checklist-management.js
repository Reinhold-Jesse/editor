// Checklist Management Functions - als Objekt organisiert
import { Utils } from './utils.js';

export const ChecklistManagement = {
    // Initialize a checklist with default items
    initializeChecklist(blockIdCounter, initialItems = 3) {
        const items = [];
        let itemIdCounter = blockIdCounter;
        
        // Create initial items
        for (let i = 0; i < initialItems; i++) {
            items.push({
                id: Utils.generateId(itemIdCounter++),
                text: '',
                checked: false
            });
        }
        
        return {
            items,
            lastItemIdCounter: itemIdCounter - 1
        };
    },

    // Add a checklist item
    addChecklistItem(blocks, blockId, blockIdCounter, position = 'bottom') {
        const { block } = Utils.findBlockById(blocks, blockId);
        if (!block || block.type !== 'checklist') {
            // Initialize checklist data if it doesn't exist
            if (block && block.type === 'checklist' && !block.checklistData) {
                block.checklistData = this.initializeChecklist(blockIdCounter, 0);
            } else {
                return null;
            }
        }
        
        if (!block.checklistData) {
            block.checklistData = this.initializeChecklist(blockIdCounter, 0);
        }
        
        const { items } = block.checklistData;
        
        const newItem = {
            id: Utils.generateId(blockIdCounter),
            text: '',
            checked: false
        };
        
        if (position === 'top') {
            items.unshift(newItem);
        } else {
            items.push(newItem);
        }
        
        block.updatedAt = new Date().toISOString();
        
        return { lastItemIdCounter: blockIdCounter };
    },

    // Remove a checklist item
    removeChecklistItem(blocks, blockId, itemIndex) {
        const { block } = Utils.findBlockById(blocks, blockId);
        if (!block || block.type !== 'checklist' || !block.checklistData) return;
        
        const { items } = block.checklistData;
        
        // Don't remove if it's the only item
        if (items.length <= 1) return;
        
        items.splice(itemIndex, 1);
        block.updatedAt = new Date().toISOString();
    },

    // Toggle checked state of an item
    toggleChecklistItem(blocks, blockId, itemIndex) {
        const { block } = Utils.findBlockById(blocks, blockId);
        if (!block || block.type !== 'checklist' || !block.checklistData) return;
        
        const { items } = block.checklistData;
        if (items[itemIndex]) {
            items[itemIndex].checked = !items[itemIndex].checked;
            block.updatedAt = new Date().toISOString();
        }
    },

    // Update item text
    updateChecklistItemText(blocks, blockId, itemId, text) {
        const { block } = Utils.findBlockById(blocks, blockId);
        if (!block || block.type !== 'checklist' || !block.checklistData) return;
        
        const { items } = block.checklistData;
        const item = items.find(i => i.id === itemId);
        
        if (item) {
            item.text = text;
            block.updatedAt = new Date().toISOString();
        }
    },

    // Move item up
    moveChecklistItemUp(blocks, blockId, itemIndex) {
        const { block } = Utils.findBlockById(blocks, blockId);
        if (!block || block.type !== 'checklist' || !block.checklistData) return;
        
        const { items } = block.checklistData;
        if (itemIndex > 0 && itemIndex < items.length) {
            [items[itemIndex - 1], items[itemIndex]] = [items[itemIndex], items[itemIndex - 1]];
            block.updatedAt = new Date().toISOString();
        }
    },

    // Move item down
    moveChecklistItemDown(blocks, blockId, itemIndex) {
        const { block } = Utils.findBlockById(blocks, blockId);
        if (!block || block.type !== 'checklist' || !block.checklistData) return;
        
        const { items } = block.checklistData;
        if (itemIndex >= 0 && itemIndex < items.length - 1) {
            [items[itemIndex], items[itemIndex + 1]] = [items[itemIndex + 1], items[itemIndex]];
            block.updatedAt = new Date().toISOString();
        }
    }
};

// Legacy Exports für Rückwärtskompatibilität
export const initializeChecklist = ChecklistManagement.initializeChecklist.bind(ChecklistManagement);
export const addChecklistItem = ChecklistManagement.addChecklistItem.bind(ChecklistManagement);
export const removeChecklistItem = ChecklistManagement.removeChecklistItem.bind(ChecklistManagement);
export const toggleChecklistItem = ChecklistManagement.toggleChecklistItem.bind(ChecklistManagement);
export const updateChecklistItemText = ChecklistManagement.updateChecklistItemText.bind(ChecklistManagement);
export const moveChecklistItemUp = ChecklistManagement.moveChecklistItemUp.bind(ChecklistManagement);
export const moveChecklistItemDown = ChecklistManagement.moveChecklistItemDown.bind(ChecklistManagement);

