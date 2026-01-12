// Utility Functions - als Objekt organisiert
export const Utils = {
    generateId(blockIdCounter) {
        // Note: blockIdCounter should be incremented by the caller
        return `block-${blockIdCounter}-${Date.now()}`;
    },

    findBlockById(blocks, blockId) {
        // Suche in Haupt-Blöcken
        let block = blocks.find(b => b.id === blockId);
        if (block) return { block, parent: null };
        
        // Rekursive Suche in verschachtelten Strukturen
        function searchInChildren(children, parent) {
            if (!children) return null;
            
            for (let child of children) {
                if (child.id === blockId) {
                    return { block: child, parent: parent };
                }
                
                // Rekursiv in children suchen
                if (child.children) {
                    const result = searchInChildren(child.children, child);
                    if (result) return result;
                }
            }
            
            return null;
        }
        
        // Suche in allen Haupt-Blöcken und ihren Children
        for (let parentBlock of blocks) {
            if (parentBlock.children) {
                const result = searchInChildren(parentBlock.children, parentBlock);
                if (result) return result;
            }
        }
        
        return { block: null, parent: null };
    },

    getAllBlocks(blocks) {
        // Gibt alle Blöcke zurück (Haupt-Blöcke + Children)
        const allBlocks = [];
        blocks.forEach(block => {
            allBlocks.push(block);
            if (block.children && block.children.length > 0) {
                block.children.forEach(child => {
                    allBlocks.push(child);
                });
            }
        });
        return allBlocks;
    },

    initBlockContent(element, block, isTextContent = false) {
        // Prüfe ob Element existiert
        if (!element || !block) return;
        
        // Setze Inhalt nur wenn Element leer ist und Block Inhalt hat
        if (!element.textContent) {
            let content = block.content;
            
            if (content) {
                try {
                    if (isTextContent) {
                        element.textContent = content;
                    } else {
                        element.innerHTML = content;
                    }
                } catch (error) {
                    console.warn('Fehler beim Initialisieren des Block-Inhalts:', error);
                }
            }
        }
    },

    initAllBlockContents(blocks) {
        if (!blocks || !Array.isArray(blocks)) return;
        
        blocks.forEach(block => {
            if (!block || !block.id) return;
            
            try {
                const element = document.querySelector(`[data-block-id="${block.id}"]`);
                if (element && !element.textContent) {
                    let content = block.content;
                    
                    if (content) {
                        if (block.type === 'code') {
                            element.textContent = content;
                        } else {
                            element.innerHTML = content;
                        }
                    }
                }
                
                // Initialisiere Tabellenzellen
                if (block.type === 'table' && block.tableData && block.tableData.cells) {
                    block.tableData.cells.forEach(row => {
                        if (!Array.isArray(row)) return;
                        row.forEach(cell => {
                            if (!cell || !cell.id) return;
                            try {
                                const cellElement = document.querySelector(`[data-cell-id="${cell.id}"]`);
                                if (cellElement && !cellElement.textContent && cell.content) {
                                    cellElement.innerHTML = cell.content;
                                }
                            } catch (error) {
                                console.warn('Fehler beim Initialisieren der Tabellenzelle:', error);
                            }
                        });
                    });
                }
                
                // Initialisiere Children
                if (block.children && Array.isArray(block.children)) {
                    block.children.forEach(child => {
                        if (!child || !child.id) return;
                        try {
                            const childElement = document.querySelector(`[data-block-id="${child.id}"]`);
                            if (childElement && !childElement.textContent) {
                                let content = child.content;
                                
                                if (content) {
                                    if (child.type === 'code') {
                                        childElement.textContent = content;
                                    } else {
                                        childElement.innerHTML = content;
                                    }
                                }
                            }
                        } catch (error) {
                            console.warn('Fehler beim Initialisieren des Child-Blocks:', error);
                        }
                    });
                }
            } catch (error) {
                console.warn('Fehler beim Initialisieren des Blocks:', error);
            }
        });
    }
};

// Legacy Export für Rückwärtskompatibilität
export const generateId = Utils.generateId.bind(Utils);
export const findBlockById = Utils.findBlockById.bind(Utils);
export const getAllBlocks = Utils.getAllBlocks.bind(Utils);
export const initBlockContent = Utils.initBlockContent.bind(Utils);
export const initAllBlockContents = Utils.initAllBlockContents.bind(Utils);
