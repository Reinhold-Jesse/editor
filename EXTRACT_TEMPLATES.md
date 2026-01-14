# Template-Extraktion Anleitung

Die Templates wurden teilweise manuell erstellt. Um die restlichen Templates zu extrahieren, folge diesen Schritten:

## Bereits erstellt:
- ✅ notification.js
- ✅ json-import-modal.js
- ✅ index.js (Template-Loader)

## Noch zu erstellen:

### Modals:
1. json-export-modal.js (Zeilen 913-993)
2. theme-save-modal.js (Zeilen 748-806)
3. theme-edit-modal.js (Zeilen 808-864)
4. theme-import-modal.js (Zeilen 866-911)
5. link-modal.js (Zeilen 1131-1250)
6. confirm-modal.js (Zeilen 1252-1316)
7. image-settings-modal.js (Zeilen 1318-1517)

### Andere Komponenten:
1. sidebar.js (Zeilen 125-430) - sehr groß!
2. block-toolbar.js (Zeilen 461-516)
3. floating-toolbar.js (Zeilen 995-1129)

## Vorgehen:

1. Öffne index.html
2. Kopiere den entsprechenden HTML-Bereich
3. Erstelle eine neue .js Datei im entsprechenden Ordner
4. Exportiere die Funktion mit dem HTML-String

Beispiel:
```javascript
export function getTemplateName() {
    return `
        <!-- HTML hier -->
    `;
}
```
