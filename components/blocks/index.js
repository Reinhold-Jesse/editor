/**
 * Block Components Index
 * Exportiert alle Block-Komponenten zentral
 * 
 * WICHTIG: Alle Block-Typen aus BLOCK_TYPES müssen hier vorhanden sein!
 */
import { ParagraphBlock } from './paragraph.js';
import { ImageBlock } from './image.js';
import { Heading1Block, Heading2Block, Heading3Block } from './heading.js';
import { CodeBlock } from './code.js';
import { QuoteBlock } from './quote.js';
import { DividerBlock } from './divider.js';
import { TwoColumnBlock } from './two-column.js';
import { ThreeColumnBlock } from './three-column.js';
import { TableBlock } from './table.js';
import { ChecklistBlock } from './checklist.js';
import { LinkBlock } from './link.js';

// Exportiere alle Block-Komponenten als Objekt
// Diese müssen mit BLOCK_TYPES in block-types.js übereinstimmen!
export const BlockComponents = {
    paragraph: ParagraphBlock,
    heading1: Heading1Block,
    heading2: Heading2Block,
    heading3: Heading3Block,
    code: CodeBlock,
    quote: QuoteBlock,
    divider: DividerBlock,
    twoColumn: TwoColumnBlock,
    threeColumn: ThreeColumnBlock,
    table: TableBlock,
    image: ImageBlock,
    checklist: ChecklistBlock,
    link: LinkBlock
};

/**
 * Gibt die passende Block-Komponente für einen Block-Typ zurück
 */
export function getBlockComponent(blockType) {
    return BlockComponents[blockType] || BlockComponents.paragraph;
}

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
    if (oldType && BlockComponents[oldType]) {
        const component = BlockComponents[oldType];
        component.cleanup(block);
    }
    return block;
}

