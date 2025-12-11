// Block Components - Dynamische Initialisierung und Verwaltung pro Block-Typ
import { TableManagement } from './table-management.js';
import { ChecklistManagement } from './checklist-management.js';
import { Utils } from './utils.js';

/**
 * Block-Komponenten: Jeder Block-Typ hat seine eigene Initialisierungs- und Cleanup-Logik
 */
export const BlockComponents = {
    // Standard-Block (Paragraph, Headings, Quote, Code, etc.)
    default: {
        initialize(block, blockIdCounter) {
            // Standard-Blöcke benötigen keine spezielle Initialisierung
            return block;
        },
        
        ensureInitialized(block, blockIdCounter) {
            // Standard-Blöcke sind immer initialisiert
            return block;
        },
        
        cleanup(block) {
            // Keine Cleanup-Logik für Standard-Blöcke
            return block;
        }
    },
    
    // Image Block
    image: {
        initialize(block, blockIdCounter) {
            block.imageUrl = '';
            block.imageAlt = '';
            block.imageTitle = '';
            return block;
        },
        
        ensureInitialized(block, blockIdCounter) {
            if (!block.hasOwnProperty('imageUrl')) {
                block.imageUrl = '';
            }
            if (!block.hasOwnProperty('imageAlt')) {
                block.imageAlt = '';
            }
            if (!block.hasOwnProperty('imageTitle')) {
                block.imageTitle = '';
            }
            return block;
        },
        
        cleanup(block) {
            delete block.imageUrl;
            delete block.imageAlt;
            delete block.imageTitle;
            return block;
        }
    },
    
    // Table Block
    table: {
        initialize(block, blockIdCounter) {
            const tableData = TableManagement.initializeTable(blockIdCounter, 3, 3, true, false);
            block.tableData = tableData;
            block.tableData.lastCellIdCounter = tableData.lastCellIdCounter;
            return block;
        },
        
        ensureInitialized(block, blockIdCounter) {
            if (!block.tableData) {
                const tableData = TableManagement.initializeTable(blockIdCounter, 3, 3, true, false);
                block.tableData = tableData;
                block.tableData.lastCellIdCounter = tableData.lastCellIdCounter;
            }
            return block;
        },
        
        cleanup(block) {
            delete block.tableData;
            return block;
        }
    },
    
    // Checklist Block
    checklist: {
        initialize(block, blockIdCounter) {
            const checklistData = ChecklistManagement.initializeChecklist(blockIdCounter, 0);
            block.checklistData = checklistData;
            block.checklistData.lastItemIdCounter = checklistData.lastItemIdCounter;
            return block;
        },
        
        ensureInitialized(block, blockIdCounter) {
            if (!block.checklistData) {
                const checklistData = ChecklistManagement.initializeChecklist(blockIdCounter, 0);
                block.checklistData = checklistData;
                block.checklistData.lastItemIdCounter = checklistData.lastItemIdCounter;
            } else if (!block.checklistData.items) {
                // Falls checklistData existiert aber items fehlt
                block.checklistData.items = [];
            }
            return block;
        },
        
        cleanup(block) {
            delete block.checklistData;
            return block;
        }
    },
    
    // Container Blocks (twoColumn, threeColumn)
    container: {
        initialize(block, blockIdCounter) {
            // Container-Blöcke bekommen children Array
            if (!block.children) {
                block.children = [];
            }
            return block;
        },
        
        ensureInitialized(block, blockIdCounter) {
            // Container-Blöcke bekommen children Array
            if (!block.children) {
                block.children = [];
            }
            return block;
        },
        
        cleanup(block) {
            // Entferne children beim Typ-Wechsel
            if (block.children) {
                delete block.children;
            }
            return block;
        }
    },
    
    // Divider Block (void element)
    divider: {
        initialize(block, blockIdCounter) {
            // Divider benötigt keine Initialisierung
            return block;
        },
        
        ensureInitialized(block, blockIdCounter) {
            // Divider ist immer initialisiert
            return block;
        },
        
        cleanup(block) {
            // Keine Cleanup-Logik
            return block;
        }
    }
};

/**
 * Ruft die Initialisierungsfunktion für einen Block-Typ auf
 */
export function initializeBlock(block, blockIdCounter) {
    const component = getBlockComponent(block.type);
    return component.initialize(block, blockIdCounter);
}

/**
 * Stellt sicher, dass ein Block initialisiert ist (für geladene Blöcke)
 */
export function ensureBlockInitialized(block, blockIdCounter) {
    const component = getBlockComponent(block.type);
    return component.ensureInitialized(block, blockIdCounter);
}

/**
 * Führt Cleanup für einen Block durch (beim Typ-Wechsel)
 */
export function cleanupBlock(block, oldType) {
    if (oldType) {
        const component = getBlockComponent(oldType);
        component.cleanup(block);
    }
    return block;
}

/**
 * Gibt die passende Block-Komponente für einen Block-Typ zurück
 */
export function getBlockComponent(blockType) {
    // Spezifische Komponenten
    if (blockType === 'image') {
        return BlockComponents.image;
    }
    if (blockType === 'table') {
        return BlockComponents.table;
    }
    if (blockType === 'checklist') {
        return BlockComponents.checklist;
    }
    if (blockType === 'divider') {
        return BlockComponents.divider;
    }
    
    // Container-Blöcke
    if (blockType === 'twoColumn' || blockType === 'threeColumn' || blockType === 'column') {
        return BlockComponents.container;
    }
    
    // Standard für alle anderen Block-Typen
    return BlockComponents.default;
}

