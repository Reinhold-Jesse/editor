# Block-Komponenten

Dieser Ordner enthält alle Block-Komponenten als saubere, modulare Objekte.

## Struktur

Jede Block-Komponente ist ein Objekt mit folgenden Eigenschaften:

### Eigenschaften

- **`type`** (string): Der Block-Typ Name (z.B. 'paragraph', 'image')
- **`options`** (object): Konfiguration aus `block-types.js`
  - `label`: Anzeigename
  - `tag`: HTML-Tag
  - `placeholder`: Platzhalter-Text
  - `classes`: CSS-Klassen
  - `canHaveChildren`: Ob der Block Kinder haben kann
- **`structure`** (object): Datenstruktur-Definition für den Block
- **`renderHTML(block, context)`** (function): HTML-Template-Funktion für das Rendering
- **`renderChildHTML(child, context)`** (function): HTML-Template für Child-Versionen
- **`initialize(block, blockIdCounter)`** (function): Initialisierungslogik
- **`ensureInitialized(block, blockIdCounter)`** (function): Sicherstellen dass Block initialisiert ist
- **`cleanup(block)`** (function): Cleanup-Logik beim Typ-Wechsel

## Beispiel

```javascript
export const ParagraphBlock = {
    type: 'paragraph',
    
    options: {
        label: '📝 Paragraph',
        tag: 'div',
        placeholder: 'Schreibe einen Absatz...',
        classes: 'block-placeholder min-h-[1.5rem]',
        canHaveChildren: false
    },
    
    structure: {
        id: '',
        type: 'paragraph',
        content: '',
        style: '',
        classes: '',
        createdAt: '',
        updatedAt: ''
    },
    
    renderHTML(block, context = {}) {
        return `<div>...</div>`;
    },
    
    renderChildHTML(child, context = {}) {
        return `<div>...</div>`;
    },
    
    initialize(block, blockIdCounter) {
        return block;
    },
    
    ensureInitialized(block, blockIdCounter) {
        return block;
    },
    
    cleanup(block) {
        return block;
    }
};
```

## Verwendung

Alle Block-Komponenten werden in `index.js` exportiert:

```javascript
import { BlockComponents, getBlockComponent } from '../blocks/index.js';

// Komponente abrufen
const component = getBlockComponent('paragraph');

// HTML rendern
const html = component.renderHTML(block, { selectedBlockId: '...' });
```

## Neue Block-Komponente hinzufügen

1. Erstelle eine neue Datei in `components/blocks/` (z.B. `my-block.js`)
2. Definiere das Block-Objekt mit allen erforderlichen Eigenschaften
3. Exportiere es in `components/blocks/index.js`

