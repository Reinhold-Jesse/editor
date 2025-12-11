// JSON Renderer - Zentrale Funktion für das Rendering aller Elemente aus dem JSON
import { BlockComponents } from './block-components.js';
import { BlockManagement } from './block-management.js';
import { BLOCK_TYPES } from './block-types.js';

/**
 * Zentrale Funktion zum Rendering aller Elemente aus dem JSON
 * Diese Funktion stellt sicher, dass alle Block-Typen und verschachtelten Strukturen korrekt initialisiert sind
 * Es gibt nur diese EINE Rendering-Funktion - alle Logik ist hier integriert
 * 
 * @param {Array} blocks - Array von Block-Objekten aus dem JSON
 * @param {number} blockIdCounter - Aktueller Block-ID Counter
 * @returns {Array} - Bereinigte und initialisierte Blöcke
 */
export function renderJSONBlocks(blocks, blockIdCounter = 0) {
    if (!Array.isArray(blocks)) {
        console.error('renderJSONBlocks: blocks muss ein Array sein');
        return [];
    }

    // Rendere alle Blöcke rekursiv
    const renderedBlocks = blocks.map(block => {
        // Validiere Block
        if (!block || typeof block !== 'object') {
            console.warn('renderJSONBlocks: Ungültiger Block gefunden');
            return null;
        }

        if (!block.id) {
            console.warn('renderJSONBlocks: Block ohne ID gefunden');
            return null;
        }

        if (!block.type) {
            console.warn('renderJSONBlocks: Block ohne Typ gefunden', block.id);
            return null;
        }

        // Validiere Block-Typ
        if (!BLOCK_TYPES[block.type]) {
            console.warn(`renderJSONBlocks: Unbekannter Block-Typ "${block.type}"`, block.id);
            block.type = 'paragraph';
        }

        // Initialisiere Block-Komponente
        let component = null;
        if (block.type === 'image') {
            component = BlockComponents.image;
        } else if (block.type === 'table') {
            component = BlockComponents.table;
        } else if (block.type === 'checklist') {
            component = BlockComponents.checklist;
        } else if (block.type === 'divider') {
            component = BlockComponents.divider;
        } else if (block.type === 'twoColumn' || block.type === 'threeColumn' || block.type === 'column') {
            component = BlockComponents.container;
        } else {
            component = BlockComponents.default;
        }

        if (component) {
            block = component.ensureInitialized(block, blockIdCounter);
        }

        // Stelle sicher, dass Column-Struktur korrekt ist (BEVOR rekursive Verarbeitung)
        if (block.type === 'twoColumn' || block.type === 'threeColumn') {
            BlockManagement.ensureColumnStructure([block]);
        }

        // Rendere verschachtelte Strukturen basierend auf Block-Typ
        if (block.type === 'twoColumn' || block.type === 'threeColumn') {
            // Column-Block Rendering - verarbeite Spalten und deren Children
            if (!block.children || !Array.isArray(block.children)) {
                block.children = [];
            }

            block.children = block.children.map(column => {
                if (!column || typeof column !== 'object') {
                    return {
                        id: `col-${Date.now()}-${Math.random()}`,
                        type: 'column',
                        children: []
                    };
                }

                if (!column.id) {
                    column.id = `col-${Date.now()}-${Math.random()}`;
                }
                if (!column.type) {
                    column.type = 'column';
                }
                if (!column.children || !Array.isArray(column.children)) {
                    column.children = [];
                }

                // Rekursiv alle Children in der Spalte rendern
                column.children = column.children
                    .map(child => {
                        if (!child || typeof child !== 'object' || !child.id || !child.type) {
                            return null;
                        }
                        // Stelle sicher, dass verschachtelte Column-Blöcke korrekt strukturiert sind
                        if (child.type === 'twoColumn' || child.type === 'threeColumn') {
                            BlockManagement.ensureColumnStructure([child]);
                        }
                        // Rekursiver Aufruf für Children
                        const childResult = renderJSONBlocks([child], blockIdCounter);
                        return childResult.length > 0 ? childResult[0] : null;
                    })
                    .filter(child => child !== null);

                return column;
            });
        } else if (block.type === 'table') {
            // Table-Block Rendering
            if (!block.tableData) {
                const tableComponent = BlockComponents.table;
                if (tableComponent) {
                    block = tableComponent.ensureInitialized(block, blockIdCounter);
                }
            }

            if (block.tableData) {
                if (!block.tableData.cells || !Array.isArray(block.tableData.cells)) {
                    block.tableData.cells = [];
                }

                block.tableData.cells = block.tableData.cells.map(row => {
                    if (!Array.isArray(row)) {
                        return [];
                    }
                    return row.map(cell => {
                        if (!cell || typeof cell !== 'object') {
                            return null;
                        }
                        if (!cell.id) {
                            cell.id = `cell-${Date.now()}-${Math.random()}`;
                        }
                        if (cell.content === undefined) {
                            cell.content = '';
                        }
                        if (cell.merged === undefined) {
                            cell.merged = false;
                        }
                        if (cell.colspan === undefined) {
                            cell.colspan = 1;
                        }
                        if (cell.rowspan === undefined) {
                            cell.rowspan = 1;
                        }
                        return cell;
                    }).filter(cell => cell !== null);
                }).filter(row => row.length > 0);

                if (block.tableData.hasHeader === undefined) {
                    block.tableData.hasHeader = false;
                }
                if (block.tableData.hasFooter === undefined) {
                    block.tableData.hasFooter = false;
                }
            }
        } else if (block.type === 'checklist') {
            // Checklist-Block Rendering
            if (!block.checklistData) {
                const checklistComponent = BlockComponents.checklist;
                if (checklistComponent) {
                    block = checklistComponent.ensureInitialized(block, blockIdCounter);
                }
            }

            if (block.checklistData) {
                if (!block.checklistData.items || !Array.isArray(block.checklistData.items)) {
                    block.checklistData.items = [];
                }

                block.checklistData.items = block.checklistData.items.map(item => {
                    if (!item || typeof item !== 'object') {
                        return null;
                    }
                    if (!item.id) {
                        item.id = `item-${Date.now()}-${Math.random()}`;
                    }
                    if (item.text === undefined) {
                        item.text = '';
                    }
                    if (item.checked === undefined) {
                        item.checked = false;
                    }
                    return item;
                }).filter(item => item !== null);
            }
        } else {
            // Standard-Blöcke: Rendere Children falls vorhanden
            if (block.children && Array.isArray(block.children)) {
                block.children = block.children
                    .map(child => {
                        if (!child || typeof child !== 'object' || !child.id || !child.type) {
                            return null;
                        }
                        // Stelle sicher, dass verschachtelte Column-Blöcke korrekt strukturiert sind
                        if (child.type === 'twoColumn' || child.type === 'threeColumn') {
                            BlockManagement.ensureColumnStructure([child]);
                        }
                        // Rekursiver Aufruf für Children
                        const childResult = renderJSONBlocks([child], blockIdCounter);
                        return childResult.length > 0 ? childResult[0] : null;
                    })
                    .filter(child => child !== null);
            }
        }

        return block;
    }).filter(block => block !== null);
    
    // Stelle sicher, dass alle Column-Strukturen korrekt sind (auch verschachtelte)
    BlockManagement.ensureColumnStructure(renderedBlocks);

    return renderedBlocks;
}

/**
 * Validiert die Struktur eines Blocks
 * 
 * @param {Object} block - Block-Objekt
 * @returns {boolean} - true wenn Block gültig ist
 */
export function validateBlock(block) {
    if (!block || typeof block !== 'object') {
        return false;
    }

    if (!block.id || typeof block.id !== 'string') {
        return false;
    }

    if (!block.type || typeof block.type !== 'string') {
        return false;
    }

    // Prüfe ob Block-Typ existiert
    if (!BLOCK_TYPES[block.type]) {
        return false;
    }

    return true;
}

/**
 * Validiert die Struktur aller Blöcke in einem Array
 * 
 * @param {Array} blocks - Array von Block-Objekten
 * @returns {Object} - { valid: boolean, errors: Array }
 */
export function validateBlocks(blocks) {
    if (!Array.isArray(blocks)) {
        return {
            valid: false,
            errors: ['blocks muss ein Array sein']
        };
    }

    const errors = [];
    
    blocks.forEach((block, index) => {
        if (!validateBlock(block)) {
            errors.push(`Block ${index + 1} ist ungültig: fehlende oder ungültige id/type`);
        }
    });

    return {
        valid: errors.length === 0,
        errors: errors
    };
}
