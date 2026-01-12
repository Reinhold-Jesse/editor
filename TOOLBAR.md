# Toolbar-Definition und Dokumentation

## Was ist eine Toolbar?

Eine **Toolbar** (Werkzeugleiste) ist eine grafische Benutzeroberfläche, die dem Benutzer schnellen Zugriff auf häufig verwendete Funktionen und Werkzeuge bietet. Im Block Editor gibt es zwei verschiedene Toolbar-Typen, die je nach Kontext angezeigt werden:

1. **Block-Auswahl-Toolbar** - Zum Hinzufügen neuer Blöcke
2. **Floating Toolbar** - Zur Formatierung von markiertem Text

---

## 1. Block-Auswahl-Toolbar

### Definition
Die Block-Auswahl-Toolbar ist eine kontextbezogene Werkzeugleiste, die erscheint, wenn der Benutzer einen neuen Block hinzufügen möchte. Sie bietet eine Übersicht aller verfügbaren Block-Typen und Theme-Vorlagen.

### Aktivierung
- Die Toolbar wird durch Klick auf den "+ Block hinzufügen" Button aktiviert
- Steuerung über die Alpine.js Variable: `showToolbar`
- Position: Direkt über dem Editor-Container

### Verfügbare Funktionen

#### Block-Typen zur Auswahl:

1. **Paragraph** (`paragraph`)
   - Standard-Textblock für normalen Fließtext
   - Verwendung: Allgemeine Textinhalte

2. **Überschriften**
   - **H1 Überschrift** (`heading1`) - Hauptüberschrift
   - **H2 Überschrift** (`heading2`) - Unterüberschrift
   - **H3 Überschrift** (`heading3`) - Unter-Unterüberschrift
   - Verwendung: Strukturierung von Dokumenten

3. **Code Block** (`code`)
   - Für Code-Snippets und technische Inhalte
   - Behält Formatierung bei
   - Verwendung: Programmcode, Konfigurationen

4. **Zitat** (`quote`)
   - Für Zitate und hervorgehobene Textpassagen
   - Visuell abgesetzt
   - Verwendung: Zitate, wichtige Hinweise

5. **Link** (`link`)
   - Spezieller Block-Typ für Links
   - Enthält Link-Text und URL
   - Verwendung: Externe Verweise, interne Links

6. **Trennlinie** (`divider`)
   - Horizontale Trennlinie
   - Visuelle Trennung von Abschnitten
   - Verwendung: Strukturierung von Inhalten

7. **Layout-Blöcke**
   - **Zwei Spalten** (`twoColumn`) - Zwei-spaltiges Layout
   - **Drei Spalten** (`threeColumn`) - Drei-spaltiges Layout
   - Verwendung: Mehrspaltige Layouts für strukturierte Inhalte

8. **Tabelle** (`table`)
   - Tabellen mit Zeilen und Spalten
   - Erweiterte Tabellen-Funktionen verfügbar
   - Verwendung: Strukturierte Daten, Vergleichstabellen

#### Theme-Vorlagen

Die Toolbar bietet auch Zugriff auf gespeicherte Theme-Vorlagen:

- **Anzeigen/Ausblenden** - Dropdown zum Ein-/Ausblenden der Theme-Liste
- **Theme laden** - Direktes Laden einer gespeicherten Theme-Vorlage
- **Theme-Informationen** - Anzeige der Anzahl der Blöcke pro Theme

### Technische Implementierung

```javascript
// Steuerung der Toolbar
showToolbar: false,  // Alpine.js State Variable

// Block hinzufügen
addBlock(type, content = '') {
    // Erstellt neuen Block vom angegebenen Typ
    // Setzt showToolbar = false nach Hinzufügen
}

// Theme aus Toolbar laden
loadThemeFromToolbar(themeName) {
    // Lädt Theme-Vorlage direkt aus der Toolbar
}
```

### HTML-Struktur

```html
<div x-show="showToolbar" class="mb-4 p-2 bg-gray-100 rounded-lg">
    <!-- Block-Typen Buttons -->
    <div class="flex gap-2 flex-wrap mb-3">
        <!-- Verschiedene Block-Typ Buttons -->
    </div>
    
    <!-- Theme-Vorlagen Dropdown -->
    <div class="border-t border-gray-300 pt-3">
        <!-- Theme-Liste -->
    </div>
</div>
```

---

## 2. Floating Toolbar (Text-Formatierungs-Toolbar)

### Definition
Die Floating Toolbar ist eine schwebende Werkzeugleiste, die automatisch erscheint, wenn der Benutzer Text in einem Block markiert. Sie bietet Formatierungsoptionen für den markierten Text.

### Aktivierung
- Automatische Aktivierung bei Text-Selektion
- Steuerung über die Alpine.js Variable: `showFloatingToolbar`
- Position: Dynamisch positioniert über dem markierten Text
- Erscheint auch bei Rechtsklick auf markierten Text

### Verfügbare Funktionen

#### Text-Formatierungen:

1. **Fett** (`bold`)
   - Macht markierten Text fettgedruckt
   - Toggle-Funktion: Ein/Aus
   - Verwendung: Hervorhebung wichtiger Begriffe

2. **Kursiv** (`italic`)
   - Macht markierten Text kursiv
   - Toggle-Funktion: Ein/Aus
   - Verwendung: Betonung, Zitate

3. **Unterstrichen** (`underline`)
   - Unterstreicht markierten Text
   - Toggle-Funktion: Ein/Aus
   - Verwendung: Hervorhebung

4. **Link hinzufügen/bearbeiten**
   - Öffnet Modal zum Hinzufügen oder Bearbeiten von Links
   - URL-Eingabe erforderlich
   - Verwendung: Externe/Interne Verweise

5. **Formatierung entfernen**
   - Entfernt alle Formatierungen vom markierten Text
   - Entfernt auch Links
   - Verwendung: Zurücksetzen auf Standard-Formatierung

### Zusätzliche Features

- **Selektion anzeigen**: Die Toolbar zeigt den markierten Text an
- **Positionierung**: Automatische Positionierung über dem markierten Text
- **Responsive**: Passt sich an die Bildschirmgröße an

### Technische Implementierung

```javascript
// Steuerung der Floating Toolbar
showFloatingToolbar: false,  // Alpine.js State Variable
floatingToolbarPosition: { top: 0, left: 0 },  // Position
selectedText: '',  // Markierter Text
selectedRange: null,  // Range-Objekt der Selektion
selectedBlockId: null,  // ID des Blocks mit Selektion

// Text-Selektion erkennen
handleTextSelection() {
    // Erkennt Text-Selektion und zeigt Toolbar
    // Positioniert Toolbar über markiertem Text
}

// Formatierung anwenden
applyTextFormat(format) {
    // Wendet Formatierung auf markierten Text an
    // Unterstützt: 'bold', 'italic', 'underline'
}

// Formatierung entfernen
removeFormatting() {
    // Entfernt alle Formatierungen
    // Verwendet document.execCommand('removeFormat')
}
```

### HTML-Struktur

```html
<div 
    x-show="showFloatingToolbar"
    class="floating-toolbar fixed z-50 bg-white rounded-lg shadow-lg"
    :style="'top: ' + floatingToolbarPosition.top + 'px; left: ' + floatingToolbarPosition.left + 'px;'"
>
    <!-- Formatierungs-Buttons -->
    <div class="flex gap-1 items-center flex-wrap">
        <!-- Bold, Italic, Underline, Link, Remove Formatting -->
    </div>
    
    <!-- Markierter Text Anzeige -->
    <div class="w-full pt-2 border-t border-gray-200">
        <div x-text="selectedText"></div>
    </div>
</div>
```

### Unterstützte Block-Typen

Die Floating Toolbar wird nur für bestimmte Block-Typen angezeigt:

✅ **Unterstützt:**
- Paragraph
- Heading1, Heading2, Heading3
- Quote

❌ **Nicht unterstützt:**
- Code Block
- Table
- Divider
- Link Block

---

## Erweiterungsmöglichkeiten

### 1. Weitere Formatierungsoptionen

#### Text-Ausrichtung
```javascript
// In Floating Toolbar hinzufügen
applyTextAlignment(alignment) {
    // 'left', 'center', 'right', 'justify'
    // Wird bereits als Block-Funktion unterstützt
}
```

#### Text-Farbe und Hintergrund
```javascript
// Neue Funktionen hinzufügen
applyTextColor(color) {
    document.execCommand('foreColor', false, color);
}

applyBackgroundColor(color) {
    document.execCommand('backColor', false, color);
}
```

#### Schriftgröße
```javascript
applyFontSize(size) {
    // Verwendet CSS font-size
    // Kann über document.execCommand oder direkte DOM-Manipulation
}
```

### 2. Erweiterte Link-Funktionen

#### Link-Optionen
- **Target** (`_blank`, `_self`, etc.)
- **Rel-Attribute** (`nofollow`, `noopener`, etc.)
- **Title-Attribut** für Tooltips

#### Link-Vorschau
- Vorschau der Link-URL
- Validierung der URL
- Öffnen in neuem Tab

### 3. Zusätzliche Formatierungsoptionen

#### Listen
```javascript
// In Floating Toolbar hinzufügen
applyList(type) {
    // 'insertOrderedList' oder 'insertUnorderedList'
    document.execCommand(type, false, null);
}
```

#### Text-Stile
- **Durchgestrichen** (`strikethrough`)
- **Hochgestellt** (`superscript`)
- **Tiefgestellt** (`subscript`)

### 4. Block-Auswahl-Toolbar Erweiterungen

#### Kategorisierung
```html
<!-- Block-Typen in Kategorien gruppieren -->
<div class="block-category">
    <h3>Text-Blöcke</h3>
    <!-- Paragraph, Headings -->
</div>
<div class="block-category">
    <h3>Layout-Blöcke</h3>
    <!-- Columns, Table -->
</div>
```

#### Suche/Filter
```javascript
// Suchfunktion für Block-Typen
filterBlockTypes(searchTerm) {
    // Filtert verfügbare Block-Typen
}
```

#### Favoriten
```javascript
// Häufig verwendete Block-Typen als Favoriten markieren
favoriteBlockTypes: ['paragraph', 'heading1', 'code']
```

### 5. Kontextbezogene Toolbars

#### Block-spezifische Toolbars
- **Tabelle-Toolbar**: Zeigt Tabellen-spezifische Funktionen (Zeilen/Spalten hinzufügen, Zellen zusammenführen)
- **Code-Block-Toolbar**: Syntax-Highlighting, Sprache auswählen
- **Link-Block-Toolbar**: Link-Einstellungen direkt bearbeiten

### 6. Keyboard Shortcuts

#### Shortcuts für Toolbar-Funktionen
```javascript
// Keyboard Shortcuts hinzufügen
handleKeyboardShortcuts(event) {
    // Ctrl+B = Bold
    // Ctrl+I = Italic
    // Ctrl+K = Link
    // etc.
}
```

### 7. Toolbar-Positionierung verbessern

#### Intelligente Positionierung
```javascript
// Toolbar automatisch positionieren, wenn sie außerhalb des Viewports wäre
calculateToolbarPosition(range) {
    const rect = range.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    
    // Anpassung wenn Toolbar außerhalb des Viewports
    if (rect.top < 100) {
        // Toolbar unter dem Text anzeigen
    }
    if (rect.left + 300 > viewportWidth) {
        // Toolbar nach links verschieben
    }
}
```

### 8. Toolbar-Anpassbarkeit

#### Benutzerdefinierte Toolbar-Konfiguration
```javascript
// Konfigurierbare Toolbar
toolbarConfig: {
    floatingToolbar: {
        showBold: true,
        showItalic: true,
        showUnderline: true,
        showLink: true,
        showRemoveFormatting: true
    },
    blockToolbar: {
        showParagraph: true,
        showHeadings: true,
        showCode: true,
        // etc.
    }
}
```

### 9. Drag & Drop für Toolbar

#### Block-Typen per Drag & Drop hinzufügen
```javascript
// Drag & Drop von Toolbar-Buttons zu Editor
handleToolbarDragStart(event, blockType) {
    // Startet Drag-Operation
}

handleEditorDrop(event) {
    // Fügt Block an Drop-Position hinzu
}
```

### 10. Toolbar-Animationen

#### Erweiterte Animationen
- Slide-in Animationen
- Fade-Effekte
- Hover-Effekte auf Buttons
- Tooltip-Animationen

---

## Best Practices

### 1. Performance
- Toolbar nur bei Bedarf rendern (`x-show` statt `x-if` für bessere Performance)
- Event-Listener effizient nutzen
- Debouncing bei häufigen Events (z.B. Text-Selektion)

### 2. Benutzerfreundlichkeit
- Klare Icons und Beschriftungen
- Tooltips für alle Buttons
- Keyboard Shortcuts dokumentieren
- Responsive Design für mobile Geräte

### 3. Zugänglichkeit
- ARIA-Labels für Screen Reader
- Keyboard-Navigation unterstützen
- Fokus-Management beachten

### 4. Wartbarkeit
- Funktionen in separate Module auslagern
- Konsistente Namenskonventionen
- Dokumentation der Funktionen

---

## Zusammenfassung

Die Toolbar im Block Editor bietet zwei Hauptfunktionen:

1. **Block-Auswahl-Toolbar**: Schneller Zugriff auf alle verfügbaren Block-Typen und Theme-Vorlagen
2. **Floating Toolbar**: Formatierungsoptionen für markierten Text

Beide Toolbars sind kontextbezogen und erscheinen nur, wenn sie benötigt werden. Die Erweiterungsmöglichkeiten sind vielfältig und können je nach Anforderungen angepasst werden.






