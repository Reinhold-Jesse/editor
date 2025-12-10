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
    if (!element.textContent && block.content) {
        if (isTextContent) {
            element.textContent = block.content;
        } else {
            element.innerHTML = block.content;
        }
    }
}

export function initAllBlockContents(blocks) {
    blocks.forEach(block => {
        const element = document.querySelector(`[data-block-id="${block.id}"]`);
        if (element && !element.textContent && block.content) {
            if (block.type === 'code') {
                element.textContent = block.content;
            } else {
                element.innerHTML = block.content;
            }
        }
        
        // Initialisiere Children
        if (block.children) {
            block.children.forEach(child => {
                const childElement = document.querySelector(`[data-block-id="${child.id}"]`);
                if (childElement && !childElement.textContent && child.content) {
                    if (child.type === 'code') {
                        childElement.textContent = child.content;
                    } else {
                        childElement.innerHTML = child.content;
                    }
                }
            });
        }
    });
}

