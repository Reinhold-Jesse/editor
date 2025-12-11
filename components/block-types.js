// Block Type Definitions and Helpers - als Objekt organisiert
export const BLOCK_TYPES = {
    paragraph: {
        label: '📝 Paragraph',
        tag: 'div',
        placeholder: 'Schreibe einen Absatz...',
        classes: 'block-placeholder min-h-[1.5rem]',
        canHaveChildren: false
    },
    heading1: {
        label: 'H1 Überschrift',
        tag: 'h1',
        placeholder: 'Überschrift 1...',
        classes: 'block-placeholder text-3xl font-bold mb-2 min-h-[2rem]',
        canHaveChildren: false
    },
    heading2: {
        label: 'H2 Überschrift',
        tag: 'h2',
        placeholder: 'Überschrift 2...',
        classes: 'block-placeholder text-2xl font-bold mb-2 min-h-[1.75rem]',
        canHaveChildren: false
    },
    heading3: {
        label: 'H3 Überschrift',
        tag: 'h3',
        placeholder: 'Überschrift 3...',
        classes: 'block-placeholder text-xl font-bold mb-2 min-h-[1.5rem]',
        canHaveChildren: false
    },
    code: {
        label: '💻 Code Block',
        tag: 'pre',
        placeholder: 'Schreibe Code...',
        classes: 'block-placeholder bg-gray-900 text-green-400 p-4 rounded font-mono text-sm min-h-[4rem] whitespace-pre-wrap',
        isTextContent: true,
        canHaveChildren: false
    },
    quote: {
        label: '💬 Zitat',
        tag: 'blockquote',
        placeholder: 'Zitat...',
        classes: 'block-placeholder border-l-4 border-blue-500 pl-4 italic text-gray-700 min-h-[1.5rem]',
        canHaveChildren: false
    },
    divider: {
        label: '➖ Trennlinie',
        tag: 'hr',
        placeholder: '',
        classes: 'border-t-2 border-gray-300 my-4',
        isVoid: true,
        canHaveChildren: false
    },
    twoColumn: {
        label: '📊 Zwei Spalten',
        tag: 'div',
        placeholder: '',
        classes: 'grid grid-cols-2 gap-4 p-4 border-2 border-dashed border-gray-300 rounded-lg min-h-[200px]',
        isContainer: true,
        columnCount: 2,
        canHaveChildren: true
    },
    threeColumn: {
        label: '📊 Drei Spalten',
        tag: 'div',
        placeholder: '',
        classes: 'grid grid-cols-3 gap-4 p-4 border-2 border-dashed border-gray-300 rounded-lg min-h-[200px]',
        isContainer: true,
        columnCount: 3,
        canHaveChildren: true
    },
    table: {
        label: '📋 Tabelle',
        tag: 'table',
        placeholder: '',
        classes: 'w-full border-collapse border border-gray-300',
        isContainer: true,
        canHaveChildren: true
    },
    image: {
        label: '🖼️ Bild',
        tag: 'img',
        placeholder: '',
        classes: 'max-w-full h-auto rounded',
        isVoid: true,
        hasImageData: true,
        canHaveChildren: false
    },
    checklist: {
        label: '☑️ Checkliste',
        tag: 'div',
        placeholder: '',
        classes: 'space-y-2 p-4 border border-gray-300 rounded-lg',
        isContainer: false,
        canHaveChildren: false,
        hasChecklistData: true
    }
};

export const BlockTypes = {
    getBlockTypeConfig(type) {
        return BLOCK_TYPES[type] || BLOCK_TYPES.paragraph;
    },

    // Gibt die Anzahl der Spalten für einen Block-Typ zurück
    getColumnCount(blockType) {
        const config = this.getBlockTypeConfig(blockType);
        return config.columnCount || 0;
    },

    // Prüft ob ein Block-Typ ein Container ist
    isContainerBlock(blockType) {
        const config = this.getBlockTypeConfig(blockType);
        return config.isContainer === true;
    },

    // Prüft ob ein Block-Typ Kinder haben darf
    canBlockHaveChildren(blockType) {
        // Column-Blöcke können immer Kinder haben (spezialfall)
        if (blockType === 'column') {
            return true;
        }
        
        const config = this.getBlockTypeConfig(blockType);
        return config.canHaveChildren === true;
    }
};

// Legacy Exports für Rückwärtskompatibilität
export const getBlockTypeConfig = BlockTypes.getBlockTypeConfig.bind(BlockTypes);
export const getColumnCount = BlockTypes.getColumnCount.bind(BlockTypes);
export const isContainerBlock = BlockTypes.isContainerBlock.bind(BlockTypes);
export const canBlockHaveChildren = BlockTypes.canBlockHaveChildren.bind(BlockTypes);
