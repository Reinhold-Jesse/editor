# Block Editor

Ein moderner Block-basierter Editor, ähnlich wie Block Note, entwickelt mit Alpine.js und Tailwind CSS v4.

## Features

- ✅ **Verschiedene Block-Typen:**
  - Paragraph (Absatz)
  - Überschriften (H1, H2, H3)
  - Code-Blöcke
  - Zitate
  - Trennlinien

- ✅ **Block-Management:**
  - Blöcke hinzufügen
  - Blöcke bearbeiten (inline editing)
  - Blöcke löschen
  - Blöcke verschieben (Pfeil-Buttons oder Drag & Drop)
  - Block-Auswahl mit visueller Hervorhebung
  - **Block-Typ ändern** - Klick auf "T" Button zum Ändern des Block-Typs
  - **Inline CSS bearbeiten** - Klick auf "CSS" Button zum Hinzufügen von Custom-Styles
  - **Children (Verschachtelte Blöcke)** - Jeder Block kann verschachtelte Child-Blöcke enthalten

- ✅ **JSON-Speicherung:**
  - Speichern im LocalStorage
  - Laden aus LocalStorage
  - JSON-Export als Datei
  - JSON-Import aus Datei

- ✅ **Benutzerfreundlichkeit:**
  - Placeholder-Text für leere Blöcke
  - Enter-Taste erstellt neuen Block
  - Backspace löscht leere Blöcke
  - Hover-Effekte für bessere UX
  - Responsive Design

## Verwendung

1. Öffne `index.html` in einem modernen Webbrowser
2. Klicke auf "+ Block hinzufügen" um einen neuen Block zu erstellen
3. Wähle den Block-Typ aus der Toolbar
4. Klicke auf einen Block um ihn zu bearbeiten
5. **Block-Typ ändern**: Klicke auf einen Block, öffne die Sidebar links, wähle im Dropdown den gewünschten Typ
6. **CSS bearbeiten**: Klicke auf einen Block, öffne die Sidebar links, gib deine CSS-Eigenschaften ein (z.B. `color: red; background-color: yellow;`)
7. **Children hinzufügen**: Klicke auf einen Block, öffne die Sidebar links, wähle einen Child-Typ und klicke auf "+ Child"
8. **Children bearbeiten**: Child-Blöcke werden unter dem Parent-Block mit Einrückung angezeigt und können wie normale Blöcke bearbeitet werden
9. Verwende die Pfeil-Buttons oder Drag & Drop um Blöcke zu verschieben
10. Speichere deine Arbeit mit "Speichern" oder "JSON Export"

## Block-Typen

### Paragraph
Standard-Textblock für normale Absätze.

### Überschriften (H1, H2, H3)
Verschiedene Überschriftenebenen für Strukturierung.

### Code Block
Syntax-hervorgehobener Code-Block mit dunklem Hintergrund.

### Quote
Zitat-Block mit linker Border und kursiver Schrift.

### Divider
Horizontale Trennlinie zur visuellen Trennung von Bereichen.

## JSON-Struktur

Die Blöcke werden als JSON-Array gespeichert:

```json
[
  {
    "id": "block-1-1234567890",
    "type": "heading1",
    "content": "Meine Überschrift",
    "style": "color: blue; font-size: 32px;",
    "children": [
      {
        "id": "block-2-1234567891",
        "type": "paragraph",
        "content": "Verschachtelter Absatz",
        "style": "",
        "children": [],
        "createdAt": "2025-12-10T08:01:00.000Z"
      }
    ],
    "createdAt": "2025-12-10T08:00:00.000Z",
    "updatedAt": "2025-12-10T08:05:00.000Z"
  },
  {
    "id": "block-3-1234567892",
    "type": "paragraph",
    "content": "Mein Absatz",
    "style": "",
    "children": [],
    "createdAt": "2025-12-10T08:01:00.000Z"
  }
]
```

## Technologien

- **Alpine.js 3.x** - Reaktive UI-Logik
- **Tailwind CSS 4** - Modernes Styling
- **Vanilla JavaScript** - Keine zusätzlichen Dependencies

## Browser-Unterstützung

Moderne Browser mit Unterstützung für:
- ES6+
- LocalStorage API
- Drag & Drop API
- ContentEditable API

## Entwicklung

Der Editor ist eine Single-Page-Anwendung (SPA) und benötigt keinen Build-Prozess. Einfach die `index.html` Datei in einem Browser öffnen.

## Erweiterungsmöglichkeiten

- Weitere Block-Typen (Listen, Tabellen, Bilder, etc.)
- Rich Text Formatting (Bold, Italic, Links)
- Markdown-Unterstützung
- Zusammenarbeit (Collaborative Editing)
- Versionshistorie
- Cloud-Speicherung

## Lizenz

Freie Verwendung für eigene Projekte.

