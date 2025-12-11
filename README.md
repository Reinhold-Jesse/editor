# Block Editor

Ein moderner Block-basierter Editor, ähnlich wie Block Note, entwickelt mit Alpine.js und Tailwind CSS v4.

## 🚀 Schnellstart

```bash
# 1. Repository klonen oder herunterladen
git clone <repository-url>
cd editor

# 2. Lokalen Webserver starten (Python)
python -m http.server 8000

# 3. Im Browser öffnen
# http://localhost:8000
```

**Oder einfach:** Öffne `index.html` direkt im Browser (für Development).

## Installation

### Voraussetzungen

- Ein moderner Webbrowser (Chrome, Firefox, Edge, Safari)
- Optional: Ein lokaler Webserver (für Production-Einsatz empfohlen)

### Schnellstart (Entwicklung)

1. **Repository klonen oder herunterladen:**
   ```bash
   git clone <repository-url>
   cd editor
   ```

2. **Dateien öffnen:**
   - Öffne einfach die `index.html` Datei direkt im Browser
   - Oder nutze einen lokalen Webserver (siehe unten)

### Lokaler Webserver (Empfohlen)

Für die beste Performance und um CORS-Probleme zu vermeiden, wird die Verwendung eines lokalen Webservers empfohlen:

#### Option 1: Python HTTP Server

```bash
# Python 3
python -m http.server 8000

# Oder Python 2
python -m SimpleHTTPServer 8000
```

Dann öffne im Browser: `http://localhost:8000`

#### Option 2: Node.js (http-server)

```bash
# Installation
npm install -g http-server

# Server starten
http-server -p 8000
```

Dann öffne im Browser: `http://localhost:8000`

#### Option 3: PHP Built-in Server

```bash
php -S localhost:8000
```

Dann öffne im Browser: `http://localhost:8000`

#### Option 4: VS Code Live Server

1. Installiere die Extension "Live Server" in VS Code
2. Rechtsklick auf `index.html` → "Open with Live Server"

### Projektstruktur

```
editor/
├── index.html              # Haupt-HTML-Datei
├── block-editor.js         # Haupt-JavaScript-Datei
├── components/             # JavaScript-Module
│   ├── utils.js
│   ├── block-management.js
│   ├── block-types.js
│   ├── child-management.js
│   ├── drag-drop.js
│   ├── storage.js
│   └── table-management.js
├── themes/                 # Gespeicherte Themes
├── example.json           # Beispiel-JSON
├── README.md              # Diese Datei
├── COMPONENTS.md          # Komponenten-Dokumentation
└── TOOLBAR.md             # Toolbar-Dokumentation
```

### Abhängigkeiten

Der Block Editor verwendet folgende externe Bibliotheken (via CDN):

- **Alpine.js 3.15.2** - Reaktive UI-Logik
- **Tailwind CSS 3.4.17** - CSS-Framework (CDN-Version)

**Hinweis:** Die Tailwind CSS CDN-Version ist für Development geeignet. Für Production sollte Tailwind CSS als PostCSS-Plugin installiert werden (siehe [Tailwind CSS Dokumentation](https://tailwindcss.com/docs/installation)).

### Production-Build (Optional)

Für Production-Einsatz empfohlen:

1. **Tailwind CSS installieren:**
   ```bash
   npm install -D tailwindcss
   npx tailwindcss init
   ```

2. **Tailwind konfigurieren:**
   - Erstelle eine `tailwind.config.js` mit den benötigten Klassen
   - Ersetze die CDN-Version in `index.html` durch eine kompilierte CSS-Datei

3. **Alpine.js:**
   - Alpine.js kann weiterhin via CDN verwendet werden
   - Oder als npm-Paket installieren: `npm install alpinejs`

### Browser-Unterstützung

Der Editor funktioniert in allen modernen Browsern mit Unterstützung für:
- ES6+ (JavaScript Modules)
- LocalStorage API
- Drag & Drop API
- ContentEditable API

**Getestet in:**
- Chrome/Edge (neueste Version)
- Firefox (neueste Version)
- Safari (neueste Version)

## Features

- ✅ **Verschiedene Block-Typen:**
  - Paragraph (Absatz)
  - Überschriften (H1, H2, H3)
  - Code-Blöcke
  - Zitate
  - Bilder (Upload oder URL)
  - Trennlinien
  - Zwei-Spalten-Layout
  - Drei-Spalten-Layout
  - Tabellen (mit Header/Footer, Zellen zusammenführen)

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

- ✅ **Theme-System:**
  - Themes speichern und laden
  - Theme-Import/Export
  - Theme-Bearbeitung
  - Schneller Zugriff über Toolbar

- ✅ **Rich Text Formatting:**
  - Floating Toolbar für Text-Formatierung
  - Textfarbe ändern
  - Hintergrundfarbe ändern
  - Links einfügen und bearbeiten

- ✅ **Tabellen:**
  - Vollständige Tabellen-Verwaltung
  - Header/Footer optional
  - Zellen zusammenführen (colspan/rowspan)
  - Inline-Bearbeitung

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

### Bild
Bild-Block mit Upload-Funktion oder URL-Eingabe. Unterstützt Alt-Text und Titel für Barrierefreiheit.

### Zwei Spalten / Drei Spalten
Layout-Blöcke für mehrspaltige Inhalte. Jede Spalte kann eigene Child-Blöcke enthalten.

### Tabelle
Vollständige Tabellen-Verwaltung mit:
- Optionaler Header/Footer
- Zellen zusammenführen (colspan/rowspan)
- Inline-Bearbeitung
- Drag & Drop für Zeilen/Spalten

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

### Lokale Entwicklung

Der Editor ist eine Single-Page-Anwendung (SPA) und benötigt keinen Build-Prozess:

1. **Einfachste Methode:** Öffne `index.html` direkt im Browser
2. **Empfohlen:** Nutze einen lokalen Webserver (siehe Installation)

### Code-Struktur

- **Modulares Design:** Der Code ist in separate Module aufgeteilt:
  - `block-editor.js` - Haupt-Logik und Alpine.js Component
  - `components/utils.js` - Utility-Funktionen
  - `components/block-management.js` - Block-Verwaltung
  - `components/child-management.js` - Child-Block-Verwaltung
  - `components/drag-drop.js` - Drag & Drop Funktionalität
  - `components/storage.js` - Speicherung und Import/Export
  - `components/table-management.js` - Tabellen-Verwaltung
  - `components/block-types.js` - Block-Typ-Definitionen

### Debugging

- Öffne die Browser-Entwicklertools (F12)
- Console-Logs zeigen Fehler und Warnungen
- LocalStorage kann im Application-Tab inspiziert werden

### Bekannte Einschränkungen

- Tailwind CSS CDN-Warnung: Dies ist nur eine Warnung, keine Fehlfunktion
- Für Production sollte Tailwind CSS als PostCSS-Plugin verwendet werden

## Erweiterungsmöglichkeiten

- Weitere Block-Typen (Listen, Tabellen, Bilder, etc.)
- Rich Text Formatting (Bold, Italic, Links)
- Markdown-Unterstützung
- Zusammenarbeit (Collaborative Editing)
- Versionshistorie
- Cloud-Speicherung

## Lizenz

Freie Verwendung für eigene Projekte.

