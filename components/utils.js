// Utility Functions
export function generateId(blockIdCounter) {
    // Note: blockIdCounter should be incremented by the caller
    return `block-${blockIdCounter}-${Date.now()}`;
}

export function findBlockById(blocks, blockId) {
    // Suche in Haupt-Blöcken
    let block = blocks.find(b => b.id === blockId);
    
    // Wenn nicht gefunden, suche in Children
    if (!block) {
        for (let parentBlock of blocks) {
            if (parentBlock.children) {
                block = parentBlock.children.find(c => c.id === blockId);
                if (block) return { block, parent: parentBlock };
            }
        }
    }
    
    return { block, parent: null };
}

export function getAllBlocks(blocks) {
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
}

export function initBlockContent(element, block, isTextContent = false) {
    // Setze Inhalt nur wenn Element leer ist und Block Inhalt hat
    if (!element.textContent) {
        let content = block.content;
        
        // Für Link-Blöcke verwende linkText
        if (block.type === 'link' && block.linkText) {
            content = block.linkText;
        }
        
        if (content) {
            if (isTextContent) {
                element.textContent = content;
            } else {
                element.innerHTML = content;
            }
        }
    }
}

export function initAllBlockContents(blocks) {
    blocks.forEach(block => {
        const element = document.querySelector(`[data-block-id="${block.id}"]`);
        if (element && !element.textContent) {
            let content = block.content;
            
            // Für Link-Blöcke verwende linkText
            if (block.type === 'link' && block.linkText) {
                content = block.linkText;
            }
            
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
                row.forEach(cell => {
                    const cellElement = document.querySelector(`[data-cell-id="${cell.id}"]`);
                    if (cellElement && !cellElement.textContent && cell.content) {
                        cellElement.innerHTML = cell.content;
                    }
                });
            });
        }
        
        // Initialisiere Children
        if (block.children) {
            block.children.forEach(child => {
                const childElement = document.querySelector(`[data-block-id="${child.id}"]`);
                if (childElement && !childElement.textContent) {
                    let content = child.content;
                    
                    // Für Link-Blöcke verwende linkText
                    if (child.type === 'link' && child.linkText) {
                        content = child.linkText;
                    }
                    
                    if (content) {
                        if (child.type === 'code') {
                            childElement.textContent = content;
                        } else {
                            childElement.innerHTML = content;
                        }
                    }
                }
            });
        }
    });
}

