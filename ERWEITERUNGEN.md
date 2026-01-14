# Editor Erweiterungen - Anleitung

Diese Anleitung zeigt, wie du den Block Editor erweitern kannst.

## 📋 Inhaltsverzeichnis

1. [Neuen Block-Typ hinzufügen](#1-neuen-block-typ-hinzufügen)
2. [Neue Features hinzufügen](#2-neue-features-hinzufügen)
3. [UI-Komponenten erweitern](#3-ui-komponenten-erweitern)
4. [Best Practices](#4-best-practices)

---

## 1. Neuen Block-Typ hinzufügen

### Schritt-für-Schritt Anleitung

#### Schritt 1: Block-Typ in `block-types.js` definieren

Öffne `components/block-types.js` und füge deinen neuen Block-Typ hinzu:

```javascript
export const BLOCK_TYPES = {
    // ... bestehende Block-Typen ...
    
    button: {
        label: '🔘 Button',
        tag: 'button',
        placeholder: 'Button-Text...',
        classes: 'px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors',
        canHaveChildren: false,
        hasButtonData: true  // Für spezielle Datenstruktur
    }
};
```

#### Schritt 2: Block-Komponente erstellen

Erstelle eine neue Datei `components/blocks/button.js`:

```javascript
/**
 * Button Block Component
 */
import { BLOCK_TYPES } from '../block-types.js';

export const ButtonBlock = {
    type: 'button',
    
    options: BLOCK_TYPES.button,
    
    structure: {
        id: '',
        type: 'button',
        content: 'Klick mich',
        buttonUrl: '',
        buttonTarget: '_self',
        buttonStyle: 'primary', // 'primary', 'secondary', 'outline'
        style: '',
        classes: '',
        htmlId: '',
        createdAt: '',
        updatedAt: ''
    },
    
    renderHTML(block, context = {}) {
        const { selectedBlockId } = context;
        const isSelected = selectedBlockId === block.id;
        
        // Button-Styles
        const styleClasses = {
            primary: 'bg-blue-600 hover:bg-blue-700 text-white',
            secondary: 'bg-gray-600 hover:bg-gray-700 text-white',
            outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50'
        };
        
        const buttonClass = styleClasses[block.buttonStyle] || styleClasses.primary;
        
        return `
            <div x-show="block.type === 'button'">
                <button 
                    :data-block-id="block.id"
                    :id="block.htmlId || null"
                    :href="block.buttonUrl || '#'"
                    :target="block.buttonTarget || '_self'"
                    :style="block.style || ''"
                    :class="['px-4 py-2 rounded transition-colors', buttonClass, block.classes || '']"
                    contenteditable="true"
                    data-placeholder="${this.options.placeholder}"
                    x-init="$nextTick(() => initBlockContent($el, block))"
                    @input="updateBlockContent(block.id, $event.target.textContent)"
                    @click.stop="openButtonSettingsModal(block.id)"
                ></button>
            </div>
        `;
    },
    
    renderChildHTML(child, context = {}) {
        // Ähnlich wie renderHTML, aber kompakter für verschachtelte Blöcke
        return this.renderHTML(child, context);
    },
    
    initialize(block, blockIdCounter) {
        block.content = block.content || 'Klick mich';
        block.buttonUrl = block.buttonUrl || '';
        block.buttonTarget = block.buttonTarget || '_self';
        block.buttonStyle = block.buttonStyle || 'primary';
        return block;
    },
    
    ensureInitialized(block, blockIdCounter) {
        if (!block.hasOwnProperty('buttonUrl')) block.buttonUrl = '';
        if (!block.hasOwnProperty('buttonTarget')) block.buttonTarget = '_self';
        if (!block.hasOwnProperty('buttonStyle')) block.buttonStyle = 'primary';
        return block;
    },
    
    cleanup(block) {
        delete block.buttonUrl;
        delete block.buttonTarget;
        delete block.buttonStyle;
        return block;
    }
};
```

#### Schritt 3: Block in `blocks/index.js` registrieren

Öffne `components/blocks/index.js`:

```javascript
// Import hinzufügen
import { ButtonBlock } from './button.js';

// In BlockComponents Objekt hinzufügen
export const BlockComponents = {
    // ... bestehende Blöcke ...
    button: ButtonBlock
};
```

#### Schritt 4: Rendering-Funktion in `block-editor.js` hinzufügen

Öffne `block-editor.js` und suche nach den `render*Block` Funktionen:

```javascript
// Füge diese Funktion hinzu:
renderButtonBlock(block) {
    const component = getBlockComponent('button');
    return component.renderHTML(block, {
        selectedBlockId: this.selectedBlockId,
        draggingBlockId: this.draggingBlockId,
        hoveredBlockId: this.hoveredBlockId
    });
}
```

#### Schritt 5: HTML-Template in `index.html` hinzufügen

Öffne `index.html` und suche nach dem Block-Content-Bereich (ca. Zeile 766):

```html
<!-- Button -->
<div x-show="block.type === 'button'" x-html="renderButtonBlock(block)"></div>
```

#### Schritt 6: Child-Rendering hinzufügen (optional)

Falls der Block in Spalten verwendet werden kann, füge auch Child-Rendering hinzu:

```html
<!-- Button in Spalte -->
<div x-show="child.type === 'button'" x-html="renderButtonChild(child, column, childIndex)"></div>
```

Und in `block-editor.js`:

```javascript
renderButtonChild(child, parent, childIndex) {
    const component = getBlockComponent('button');
    return component.renderChildHTML(child, {
        block: parent,
        childIndex: childIndex
    });
}
```

#### Schritt 7: Settings-Modal (optional)

Falls der Block spezielle Einstellungen benötigt (wie der Image-Block), erstelle ein Modal in `index.html` und die entsprechenden Funktionen in `block-editor.js`.

---

## 2. Neue Features hinzufügen

### Beispiel: Undo/Redo Funktionalität

#### Schritt 1: History-Management in `block-editor.js`

```javascript
function blockEditor() {
    return {
        // ... bestehende Properties ...
        history: [],
        historyIndex: -1,
        maxHistorySize: 50,
        
        // Snapshot erstellen
        createSnapshot() {
            const snapshot = JSON.parse(JSON.stringify(this.blocks));
            // Entferne alte Einträge wenn zu viele
            if (this.history.length >= this.maxHistorySize) {
                this.history.shift();
                this.historyIndex--;
            }
            // Entferne Einträge nach dem aktuellen Index (wenn nach Undo neue Änderung)
            this.history = this.history.slice(0, this.historyIndex + 1);
            this.history.push(snapshot);
            this.historyIndex++;
        },
        
        // Undo
        undo() {
            if (this.historyIndex > 0) {
                this.historyIndex--;
                this.blocks = JSON.parse(JSON.stringify(this.history[this.historyIndex]));
                this.$nextTick(() => {
                    this.initAllBlockContents();
                });
                this.showNotification('Rückgängig gemacht', 'success');
            }
        },
        
        // Redo
        redo() {
            if (this.historyIndex < this.history.length - 1) {
                this.historyIndex++;
                this.blocks = JSON.parse(JSON.stringify(this.history[this.historyIndex]));
                this.$nextTick(() => {
                    this.initAllBlockContents();
                });
                this.showNotification('Wiederhergestellt', 'success');
            }
        },
        
        init() {
            // ... bestehende Init-Logik ...
            this.createSnapshot(); // Initialer Snapshot
        }
    };
}
```

#### Schritt 2: Snapshot bei Änderungen erstellen

Füge `this.createSnapshot()` in relevante Funktionen ein:

```javascript
updateBlockContent(blockId, content) {
    BlockManagement.updateBlockContent(this.blocks, blockId, content);
    this.createSnapshot(); // Snapshot nach Änderung
}
```

#### Schritt 3: UI-Buttons hinzufügen

In `index.html` in der Toolbar:

```html
<button 
    @click="undo()"
    :disabled="historyIndex <= 0"
    class="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50"
    title="Rückgängig (Strg+Z)"
>
    ↶ Undo
</button>
<button 
    @click="redo()"
    :disabled="historyIndex >= history.length - 1"
    class="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50"
    title="Wiederholen (Strg+Y)"
>
    ↷ Redo
</button>
```

#### Schritt 4: Keyboard Shortcuts

```javascript
init() {
    // ... bestehende Init-Logik ...
    
    // Keyboard Shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey || e.metaKey) {
            if (e.key === 'z' && !e.shiftKey) {
                e.preventDefault();
                this.undo();
            } else if ((e.key === 'y') || (e.key === 'z' && e.shiftKey)) {
                e.preventDefault();
                this.redo();
            }
        }
    });
}
```

---

## 3. UI-Komponenten erweitern

### Beispiel: Dark Mode Toggle

#### Schritt 1: State hinzufügen

```javascript
function blockEditor() {
    return {
        // ... bestehende Properties ...
        darkMode: false,
        
        toggleDarkMode() {
            this.darkMode = !this.darkMode;
            localStorage.setItem('blockEditorDarkMode', this.darkMode);
            document.documentElement.classList.toggle('dark', this.darkMode);
        },
        
        init() {
            // ... bestehende Init-Logik ...
            // Dark Mode aus LocalStorage laden
            const savedDarkMode = localStorage.getItem('blockEditorDarkMode') === 'true';
            this.darkMode = savedDarkMode;
            if (this.darkMode) {
                document.documentElement.classList.add('dark');
            }
        }
    };
}
```

#### Schritt 2: Tailwind Dark Mode konfigurieren

In `index.html` im `<head>`:

```html
<script>
    tailwind.config = {
        darkMode: 'class'
    }
</script>
```

#### Schritt 3: Toggle-Button hinzufügen

```html
<button 
    @click="toggleDarkMode()"
    class="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
    title="Dark Mode"
>
    <span x-show="!darkMode">🌙</span>
    <span x-show="darkMode">☀️</span>
</button>
```

---

## 4. Best Practices

### ✅ Do's

1. **Modulare Struktur**: Jeder Block-Typ sollte eine eigene Datei haben
2. **Konsistente Namensgebung**: Verwende klare, beschreibende Namen
3. **Dokumentation**: Kommentiere komplexe Logik
4. **Error Handling**: Behandle Fehler graceful
5. **Performance**: Verwende Debouncing für häufige Operationen
6. **Accessibility**: Füge ARIA-Labels und Keyboard-Navigation hinzu

### ❌ Don'ts

1. **Keine globalen Variablen**: Nutze Alpine.js State Management
2. **Keine direkten DOM-Manipulationen**: Nutze Alpine.js Direktiven
3. **Keine harten Pfade**: Nutze relative Imports
4. **Keine duplizierten Funktionen**: Nutze Utility-Funktionen

### 📝 Code-Struktur Checkliste

Beim Hinzufügen eines neuen Block-Typs:

- [ ] Block-Typ in `block-types.js` definiert
- [ ] Block-Komponente in `components/blocks/` erstellt
- [ ] Block in `blocks/index.js` registriert
- [ ] Rendering-Funktion in `block-editor.js` hinzugefügt
- [ ] HTML-Template in `index.html` hinzugefügt
- [ ] Child-Rendering hinzugefügt (falls nötig)
- [ ] Initialisierung implementiert
- [ ] Cleanup implementiert
- [ ] Getestet

### 🔧 Debugging Tipps

1. **Browser Console**: Nutze `console.log()` für Debugging
2. **Alpine.js DevTools**: Installiere Alpine.js DevTools Extension
3. **State Inspection**: Nutze `x-data` direkt im HTML für State-Inspektion
4. **Breakpoints**: Nutze Browser DevTools für Breakpoints

---

## 🎯 Weitere Erweiterungsmöglichkeiten

### Block-Typen
- Video Block (YouTube, Vimeo, etc.)
- Audio Block
- Embed Block (iframe)
- Gallery Block
- Accordion Block
- Tabs Block
- Progress Bar Block
- Countdown Timer Block

### Features
- Markdown Import/Export
- PDF Export
- HTML Export
- Collaboration (WebSockets)
- Version History
- Templates Library
- Block Presets
- Custom CSS Editor
- Responsive Preview
- Print Preview

### Integrationen
- Cloud Storage (Google Drive, Dropbox)
- Image CDN Integration
- API Integration
- WordPress Export
- Medium Export

---

## 📚 Ressourcen

- [Alpine.js Dokumentation](https://alpinejs.dev/)
- [Tailwind CSS Dokumentation](https://tailwindcss.com/docs)
- [MDN Web Docs](https://developer.mozilla.org/)

---

**Viel Erfolg beim Erweitern! 🚀**
