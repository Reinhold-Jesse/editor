# Template-Integration Anleitung

## ✅ Was wurde bereits gemacht:

1. **block-editor.js** wurde angepasst:
   - Import von `getAllTemplates` hinzugefügt
   - `templates` Property hinzugefügt
   - Templates werden in `init()` geladen

## 📝 Wie Templates in index.html verwendet werden:

### Methode 1: Direktes x-html (Empfohlen)

Ersetze die inline HTML-Komponenten durch:

```html
<!-- Statt: -->
<div x-show="notification.show" ...>
    <!-- Viele Zeilen HTML -->
</div>

<!-- Verwende: -->
<div x-html="templates?.notification || ''"></div>
```

### Methode 2: Mit Fallback (Sicherer)

```html
<template x-if="templates">
    <div x-html="templates.notification"></div>
</template>
```

## 🔄 Schritt-für-Schritt: Notification Component ersetzen

### Vorher (Zeilen 74-121 in index.html):
```html
<!-- Notification Component -->
<div x-show="notification.show" x-transition:enter="..." ...>
    <!-- 48 Zeilen HTML-Code -->
</div>
```

### Nachher:
```html
<!-- Notification Component (aus Template) -->
<div x-html="templates?.notification || ''"></div>
```

**Ersparnis:** 48 Zeilen → 1 Zeile! 🎉

## 🔄 Schritt-für-Schritt: JSON Import Modal ersetzen

### Vorher (Zeilen 656-746 in index.html):
```html
<!-- JSON Import Modal -->
<div x-show="showImportModal" ...>
    <!-- 90 Zeilen HTML-Code -->
</div>
```

### Nachher:
```html
<!-- JSON Import Modal (aus Template) -->
<div x-html="templates?.modals?.jsonImport || ''"></div>
```

**Ersparnis:** 90 Zeilen → 1 Zeile! 🎉

## 📋 Vollständige Liste der Template-Ersetzungen:

| Komponente | Aktuelle Zeilen | Template-Pfad | Nach Ersetzung |
|------------|----------------|---------------|----------------|
| Notification | 74-121 (48 Zeilen) | `templates.notification` | 1 Zeile |
| Sidebar | 125-430 (305 Zeilen) | `templates.sidebar` | 1 Zeile |
| Block Toolbar | 461-516 (55 Zeilen) | `templates.blockToolbar` | 1 Zeile |
| Floating Toolbar | 995-1129 (135 Zeilen) | `templates.floatingToolbar` | 1 Zeile |
| JSON Import Modal | 656-746 (90 Zeilen) | `templates.modals.jsonImport` | 1 Zeile |
| JSON Export Modal | 913-993 (80 Zeilen) | `templates.modals.jsonExport` | 1 Zeile |
| Theme Save Modal | 748-806 (58 Zeilen) | `templates.modals.themeSave` | 1 Zeile |
| Theme Edit Modal | 808-864 (56 Zeilen) | `templates.modals.themeEdit` | 1 Zeile |
| Theme Import Modal | 866-911 (45 Zeilen) | `templates.modals.themeImport` | 1 Zeile |
| Link Modal | 1131-1250 (119 Zeilen) | `templates.modals.link` | 1 Zeile |
| Confirm Modal | 1252-1316 (64 Zeilen) | `templates.modals.confirm` | 1 Zeile |
| Image Settings Modal | 1318-1517 (199 Zeilen) | `templates.modals.imageSettings` | 1 Zeile |

**Gesamt-Ersparnis:** ~1154 Zeilen → ~12 Zeilen = **-99% Code in index.html!** 🚀

## ⚠️ Wichtige Hinweise:

1. **Templates müssen geladen sein:** Die Templates werden in `init()` geladen. Falls sie noch nicht geladen sind, wird ein leerer String zurückgegeben.

2. **Alpine.js Direktiven funktionieren:** Die `x-show`, `x-model`, etc. Direktiven in den Templates funktionieren normal, da sie durch `x-html` gerendert werden.

3. **Event-Handler funktionieren:** Alle `@click`, `@input`, etc. Event-Handler funktionieren wie gewohnt.

4. **Reaktivität:** Alpine.js erkennt Änderungen in den Templates automatisch.

## 🧪 Testen:

1. Öffne die Browser-Konsole
2. Prüfe ob `templates` geladen wurde:
   ```javascript
   // In der Browser-Konsole:
   Alpine.store('blockEditor') // Falls verfügbar
   // Oder direkt im Element:
   document.querySelector('[x-data="blockEditor()"]').__x.$data.templates
   ```

3. Teste die Notification:
   ```javascript
   // In block-editor.js oder Konsole:
   this.showNotification('Test', 'success');
   ```

## 🔧 Fehlerbehebung:

### Problem: Templates sind `null` oder `undefined`
**Lösung:** Prüfe ob alle Template-Dateien existieren und korrekt importiert werden in `components/templates/index.js`

### Problem: Alpine.js Direktiven funktionieren nicht
**Lösung:** Stelle sicher, dass `x-html` verwendet wird (nicht `innerHTML`)

### Problem: Events funktionieren nicht
**Lösung:** Alpine.js sollte die Events automatisch binden. Falls nicht, prüfe ob Alpine.js vollständig geladen ist.

## 📝 Beispiel: Vollständige Ersetzung

### Vorher (index.html):
```html
<body class="bg-gray-50 min-h-screen">
    <div x-data="blockEditor()" x-init="init()" class="flex h-screen overflow-hidden">
        <!-- Notification Component -->
        <div x-show="notification.show" ...>
            <!-- 48 Zeilen -->
        </div>
        
        <!-- Sidebar -->
        <div x-show="showSidebar" ...>
            <!-- 305 Zeilen -->
        </div>
        
        <!-- JSON Import Modal -->
        <div x-show="showImportModal" ...>
            <!-- 90 Zeilen -->
        </div>
    </div>
</body>
```

### Nachher (index.html):
```html
<body class="bg-gray-50 min-h-screen">
    <div x-data="blockEditor()" x-init="init()" class="flex h-screen overflow-hidden">
        <!-- Notification Component (aus Template) -->
        <div x-html="templates?.notification || ''"></div>
        
        <!-- Sidebar (aus Template) -->
        <div x-html="templates?.sidebar || ''"></div>
        
        <!-- JSON Import Modal (aus Template) -->
        <div x-html="templates?.modals?.jsonImport || ''"></div>
    </div>
</body>
```

## 🎯 Nächste Schritte:

1. ✅ Templates in block-editor.js laden (bereits gemacht)
2. ⏳ Erstelle alle fehlenden Template-Dateien
3. ⏳ Ersetze alle Komponenten in index.html
4. ⏳ Teste die Funktionalität
5. ⏳ Prüfe auf Fehler in der Konsole
