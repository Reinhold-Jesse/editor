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
    }
};

export const CHILD_BLOCK_TYPES = {
    paragraph: {
        label: '📝 Paragraph',
        tag: 'div',
        placeholder: 'Child Absatz...',
        classes: 'block-placeholder min-h-[1.5rem] text-sm'
    },
    heading1: {
        label: 'H1 Überschrift',
        tag: 'h1',
        placeholder: 'Child Überschrift 1...',
        classes: 'block-placeholder text-2xl font-bold mb-2 min-h-[1.75rem]'
    },
    heading2: {
        label: 'H2 Überschrift',
        tag: 'h2',
        placeholder: 'Child Überschrift 2...',
        classes: 'block-placeholder text-xl font-bold mb-2 min-h-[1.5rem]'
    },
    heading3: {
        label: 'H3 Überschrift',
        tag: 'h3',
        placeholder: 'Child Überschrift 3...',
        classes: 'block-placeholder text-lg font-bold mb-2 min-h-[1.5rem]'
    },
    code: {
        label: '💻 Code Block',
        tag: 'pre',
        placeholder: 'Child Code...',
        classes: 'block-placeholder bg-gray-900 text-green-400 p-3 rounded font-mono text-xs min-h-[3rem] whitespace-pre-wrap',
        isTextContent: true
    },
    quote: {
        label: '💬 Zitat',
        tag: 'blockquote',
        placeholder: 'Child Zitat...',
        classes: 'block-placeholder border-l-4 border-blue-500 pl-3 italic text-gray-700 min-h-[1.5rem] text-sm'
    }
};

export function getBlockTypeConfig(type, isChild = false) {
    const types = isChild ? CHILD_BLOCK_TYPES : BLOCK_TYPES;
    return types[type] || types.paragraph;
}

