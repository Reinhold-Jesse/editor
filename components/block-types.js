// Block Type Definitions and Helpers
export const BLOCK_TYPES = {
    paragraph: {
        label: '📝 Paragraph',
        tag: 'div',
        placeholder: 'Schreibe einen Absatz...',
        classes: 'block-placeholder min-h-[1.5rem]'
    },
    heading1: {
        label: 'H1 Überschrift',
        tag: 'h1',
        placeholder: 'Überschrift 1...',
        classes: 'block-placeholder text-3xl font-bold mb-2 min-h-[2rem]'
    },
    heading2: {
        label: 'H2 Überschrift',
        tag: 'h2',
        placeholder: 'Überschrift 2...',
        classes: 'block-placeholder text-2xl font-bold mb-2 min-h-[1.75rem]'
    },
    heading3: {
        label: 'H3 Überschrift',
        tag: 'h3',
        placeholder: 'Überschrift 3...',
        classes: 'block-placeholder text-xl font-bold mb-2 min-h-[1.5rem]'
    },
    code: {
        label: '💻 Code Block',
        tag: 'pre',
        placeholder: 'Schreibe Code...',
        classes: 'block-placeholder bg-gray-900 text-green-400 p-4 rounded font-mono text-sm min-h-[4rem] whitespace-pre-wrap',
        isTextContent: true
    },
    quote: {
        label: '💬 Zitat',
        tag: 'blockquote',
        placeholder: 'Zitat...',
        classes: 'block-placeholder border-l-4 border-blue-500 pl-4 italic text-gray-700 min-h-[1.5rem]'
    },
    divider: {
        label: '➖ Trennlinie',
        tag: 'hr',
        placeholder: '',
        classes: 'border-t-2 border-gray-300 my-4',
        isVoid: true
    },
    twoColumn: {
        label: '📊 Zwei Spalten',
        tag: 'div',
        placeholder: '',
        classes: 'grid grid-cols-2 gap-4 p-4 border-2 border-dashed border-gray-300 rounded-lg min-h-[200px]',
        isContainer: true,
        columnCount: 2
    },
    threeColumn: {
        label: '📊 Drei Spalten',
        tag: 'div',
        placeholder: '',
        classes: 'grid grid-cols-3 gap-4 p-4 border-2 border-dashed border-gray-300 rounded-lg min-h-[200px]',
        isContainer: true,
        columnCount: 3
    },
    table: {
        label: '📋 Tabelle',
        tag: 'table',
        placeholder: '',
        classes: 'w-full border-collapse border border-gray-300',
        isContainer: true
    },
    image: {
        label: '🖼️ Bild',
        tag: 'img',
        placeholder: '',
        classes: 'max-w-full h-auto rounded',
        isVoid: true,
        hasImageData: true
    }
};

export function getBlockTypeConfig(type) {
    return BLOCK_TYPES[type] || BLOCK_TYPES.paragraph;
}

// Gibt die Anzahl der Spalten für einen Block-Typ zurück
export function getColumnCount(blockType) {
    const config = getBlockTypeConfig(blockType);
    return config.columnCount || 0;
}

// Prüft ob ein Block-Typ ein Container ist
export function isContainerBlock(blockType) {
    const config = getBlockTypeConfig(blockType);
    return config.isContainer === true;
}

