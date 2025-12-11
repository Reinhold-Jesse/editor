# Toolbar-Komponenten

Dieser Ordner enthält alle Toolbar-Komponenten als saubere, modulare Objekte.

## Struktur

Jede Toolbar-Komponente ist ein Objekt mit folgenden Eigenschaften:

### Eigenschaften

- **`name`** (string): Der Toolbar-Name (z.B. 'blockSelection', 'floating')
- **`stateVariable`** (string): Alpine.js State Variable (z.B. 'showToolbar')
- **`options`** (object): Konfiguration und Optionen
- **`renderHTML(context)`** (function): HTML-Template-Funktion für das Rendering
- **`handlers`** (object): Event-Handler Funktionen

## Beispiel

```javascript
export const BlockSelectionToolbar = {
    name: 'blockSelection',
    stateVariable: 'showToolbar',
    
    options: {
        showThemeDropdown: false,
        themeDropdownStateVariable: 'showThemeDropdown'
    },
    
    renderHTML(context = {}) {
        return `<div>...</div>`;
    },
    
    handlers: {
        open() {
            return `${this.stateVariable} = true`;
        },
        close() {
            return `${this.stateVariable} = false`;
        }
    }
};
```

## Verfügbare Toolbars

### BlockSelectionToolbar
Toolbar zum Hinzufügen neuer Blöcke mit Theme-Vorlagen.

### FloatingToolbar
Floating Toolbar für Text-Formatierung bei Text-Selektion.

## Verwendung

Alle Toolbar-Komponenten werden in `index.js` exportiert:

```javascript
import { ToolbarComponents, getToolbarComponent } from './components/toolbar/index.js';

// Toolbar-Komponente abrufen
const toolbar = getToolbarComponent('blockSelection');

// HTML rendern
const html = toolbar.renderHTML({ childBlockTypes: {}, themes: [] });
```

## Neue Toolbar-Komponente hinzufügen

1. Erstelle eine neue Datei in `components/toolbar/` (z.B. `my-toolbar.js`)
2. Definiere das Toolbar-Objekt mit allen erforderlichen Eigenschaften
3. Exportiere es in `components/toolbar/index.js`

