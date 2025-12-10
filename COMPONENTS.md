# Komponenten-Übersicht

## Eingebundene Komponenten

### ✅ `components/utils.js`
- `generateId()` - ID-Generierung für Blöcke
- `findBlockById()` - Block-Suche in Haupt- und Child-Blöcken
- `getAllBlocks()` - Alle Blöcke zurückgeben
- `initBlockContent()` - Block-Inhalt initialisieren
- `initAllBlockContents()` - Alle Block-Inhalte initialisieren

**Status:** ✅ Eingebunden in `block-editor.js` (Zeile 2-7)

### ✅ `components/block-management.js`
- `createBlock()` - Block erstellen
- `addBlock()` - Block hinzufügen
- `addBlockAfter()` - Block danach hinzufügen
- `updateBlockContent()` - Block-Inhalt aktualisieren
- `deleteBlock()` - Block löschen
- `changeBlockType()` - Block-Typ ändern
- `updateBlockStyle()` - Block-Style aktualisieren
- `clearBlockStyle()` - Block-Style zurücksetzen
- `moveBlock()` - Block verschieben

**Status:** ✅ Eingebunden in `block-editor.js` (Zeile 8-17)

### ✅ `components/child-management.js`
- `addChild()` - Child-Block hinzufügen
- `addChildAfter()` - Child-Block danach hinzufügen
- `removeChild()` - Child-Block entfernen
- `moveChildBlock()` - Child-Block verschieben

**Status:** ✅ Eingebunden in `block-editor.js` (Zeile 18-23)

### ✅ `components/drag-drop.js`
- `handleDragStart()` - Drag-Start behandeln
- `handleDragOver()` - Drag-Over behandeln
- `handleDrop()` - Drop behandeln

**Status:** ✅ Eingebunden in `block-editor.js` (Zeile 24-28)

### ✅ `components/storage.js`
- `saveToJSON()` - In localStorage speichern
- `loadFromJSON()` - Aus localStorage laden
- `importJSON()` - JSON importieren
- `exportJSON()` - JSON exportieren

**Status:** ✅ Eingebunden in `block-editor.js` (Zeile 29-34)

### ✅ `components/block-types.js`
- `BLOCK_TYPES` - Block-Typ-Konfigurationen
- `CHILD_BLOCK_TYPES` - Child-Block-Typ-Konfigurationen
- `getBlockTypeConfig()` - Block-Typ-Konfiguration abrufen

**Status:** ⚠️ Erstellt, aber noch nicht verwendet (kann für zukünftige Erweiterungen genutzt werden)

## Verwendung in block-editor.js

Alle Komponenten werden als ES6-Module importiert und in der `blockEditor()` Funktion verwendet:

```javascript
// Beispiel: addBlock verwendet addBlockUtil aus block-management.js
addBlock(type, content = '') {
    this.blockIdCounter++;
    const block = addBlockUtil(this.blocks, this.selectedBlockId, this.blockIdCounter, type, content);
    // ...
}
```

## Globale Registrierung

Die `blockEditor()` Funktion wird am Ende von `block-editor.js` global registriert:

```javascript
window.blockEditor = blockEditor;
```

Dies ermöglicht Alpine.js, die Funktion über `x-data="blockEditor()"` zu verwenden.

