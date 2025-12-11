// Block Components - Dynamische Initialisierung und Verwaltung pro Block-Typ
// Importiere die neuen Block-Komponenten aus dem blocks/ Ordner
import { BlockComponents as NewBlockComponents, getBlockComponent as getNewBlockComponent } from './blocks/index.js';

/**
 * Block-Komponenten: Jeder Block-Typ hat seine eigene Initialisierungs- und Cleanup-Logik
 * 
 * WICHTIG: Diese Datei dient als Kompatibilitätsschicht.
 * Alle Block-Komponenten verwenden jetzt die neuen Komponenten aus blocks/
 */
export const BlockComponents = {
    // Standard-Block (Paragraph, Headings, Quote, Code, etc.)
    default: {
        initialize(block, blockIdCounter) {
            // Versuche neue Komponente zu verwenden, sonst Standard-Verhalten
            const component = getNewBlockComponent(block.type);
            if (component && component !== NewBlockComponents.paragraph) {
                return component.initialize(block, blockIdCounter);
            }
            return block;
        },
        
        ensureInitialized(block, blockIdCounter) {
            const component = getNewBlockComponent(block.type);
            if (component && component !== NewBlockComponents.paragraph) {
                return component.ensureInitialized(block, blockIdCounter);
            }
            return block;
        },
        
        cleanup(block) {
            const component = getNewBlockComponent(block.type);
            if (component && component !== NewBlockComponents.paragraph) {
                return component.cleanup(block);
            }
            return block;
        }
    },
    
    // Image Block - verwendet neue Komponente
    image: NewBlockComponents.image,
    
    // Table Block - verwendet neue Komponente
    table: NewBlockComponents.table,
    
    // Checklist Block - verwendet neue Komponente
    checklist: NewBlockComponents.checklist,
    
    // Container Blocks (twoColumn, threeColumn) - verwenden neue Komponenten
    container: {
        initialize(block, blockIdCounter) {
            // Versuche neue Komponente zu verwenden
            const component = getNewBlockComponent(block.type);
            if (component && (component === NewBlockComponents.twoColumn || component === NewBlockComponents.threeColumn)) {
                return component.initialize(block, blockIdCounter);
            }
            // Fallback: Container-Blöcke bekommen children Array
            if (!block.children) {
                block.children = [];
            }
            return block;
        },
        
        ensureInitialized(block, blockIdCounter) {
            // Versuche neue Komponente zu verwenden
            const component = getNewBlockComponent(block.type);
            if (component && (component === NewBlockComponents.twoColumn || component === NewBlockComponents.threeColumn)) {
                return component.ensureInitialized(block, blockIdCounter);
            }
            // Fallback: Container-Blöcke bekommen children Array
            if (!block.children) {
                block.children = [];
            }
            return block;
        },
        
        cleanup(block) {
            // Versuche neue Komponente zu verwenden
            const component = getNewBlockComponent(block.type);
            if (component && (component === NewBlockComponents.twoColumn || component === NewBlockComponents.threeColumn)) {
                return component.cleanup(block);
            }
            // Fallback: Entferne children beim Typ-Wechsel
            if (block.children) {
                delete block.children;
            }
            return block;
        }
    },
    
    // Divider Block - verwendet neue Komponente
    divider: NewBlockComponents.divider
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
 * 
 * WICHTIG: Verwendet jetzt ausschließlich die neuen Komponenten aus blocks/
 */
export function getBlockComponent(blockType) {
    // Versuche neue Komponente zu verwenden
    const newComponent = getNewBlockComponent(blockType);
    if (newComponent && newComponent !== NewBlockComponents.paragraph) {
        // Wrapper für Kompatibilität
        return {
            initialize: (block, blockIdCounter) => newComponent.initialize(block, blockIdCounter),
            ensureInitialized: (block, blockIdCounter) => newComponent.ensureInitialized(block, blockIdCounter),
            cleanup: (block) => newComponent.cleanup(block)
        };
    }
    
    // Container-Blöcke
    if (blockType === 'twoColumn' || blockType === 'threeColumn' || blockType === 'column') {
        return BlockComponents.container;
    }
    
    // Standard für alle anderen Block-Typen
    return BlockComponents.default;
}

