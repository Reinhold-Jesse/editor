// Storage and Import/Export Functions
import { initAllBlockContents } from './utils.js';
import { ensureColumnStructure } from './block-management.js';

export function saveToJSON(blocks) {
    // Stelle sicher, dass die Struktur korrekt ist, bevor gespeichert wird
    ensureColumnStructure(blocks);
    const json = JSON.stringify(blocks, null, 2);
    localStorage.setItem('blockEditorData', json);
    // Notification wird vom block-editor.js angezeigt
}

export function loadFromJSON(blocks, blockIdCounter, $nextTick, initAllBlockContents) {
    const saved = localStorage.getItem('blockEditorData');
    if (saved) {
        try {
            const parsedBlocks = JSON.parse(saved);
            blocks.splice(0, blocks.length, ...parsedBlocks);
            
            // Stelle sicher, dass Column-Blöcke die richtige Anzahl von Spalten haben
            ensureColumnStructure(blocks);
            
            // Sicherstellen, dass blockIdCounter aktualisiert wird
            const maxId = Math.max(...parsedBlocks.map(b => {
                const match = b.id.match(/block-(\d+)-/);
                return match ? parseInt(match[1]) : 0;
            }));
            
            const newCounter = maxId || 0;
            
            // Initialisiere Block-Inhalte nach dem Rendering
            $nextTick(() => {
                initAllBlockContents(blocks);
            });
            
            // Notification wird vom block-editor.js angezeigt
            return { blocks: parsedBlocks, blockIdCounter: newCounter };
        } catch (e) {
            // Notification wird vom block-editor.js angezeigt
            return { blocks: null, blockIdCounter: blockIdCounter };
        }
    } else {
        // Notification wird vom block-editor.js angezeigt
        return { blocks: null, blockIdCounter: blockIdCounter };
    }
}

export function importJSON(jsonText, blocks, blockIdCounter, $nextTick, initAllBlockContents, updateCounter) {
    try {
        const parsedBlocks = JSON.parse(jsonText);
        
        // Validiere dass es ein Array ist
        if (!Array.isArray(parsedBlocks)) {
            throw new Error('JSON muss ein Array von Blöcken sein.');
        }

        // Validiere Block-Struktur
        for (let i = 0; i < parsedBlocks.length; i++) {
            const block = parsedBlocks[i];
            if (!block.id || !block.type) {
                throw new Error(`Block ${i + 1} fehlt 'id' oder 'type' Feld.`);
            }
        }

        blocks.splice(0, blocks.length, ...parsedBlocks);
        
        // Stelle sicher, dass threeColumn Blöcke genau 3 Spalten haben
        ensureColumnStructure(blocks);
        
        // Berechne den maximalen Block-ID Counter
        let maxId = 0;
        parsedBlocks.forEach(b => {
            const match = b.id.match(/block-(\d+)-/);
            if (match) {
                const idNum = parseInt(match[1]);
                if (idNum > maxId) {
                    maxId = idNum;
                }
            }
        });
        
        const newCounter = maxId || 0;
        
        if (updateCounter) {
            updateCounter(newCounter);
        }
        
        // Initialisiere Block-Inhalte nach dem Rendering
        $nextTick(() => {
            initAllBlockContents(blocks);
        });
        
        // Notification wird vom block-editor.js angezeigt
    } catch (error) {
        // Fehler wird vom block-editor.js angezeigt
        throw error;
    }
}

export function exportJSON(blocks) {
    const json = JSON.stringify(blocks, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `block-editor-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Theme Management Functions
// Speichert Theme-Index im LocalStorage und Theme-Datei als JSON im themes Ordner
let themesDirectoryHandle = null;

// Versucht automatisch den themes Ordner auszuwählen (wird beim ersten Speichern aufgerufen)
async function ensureThemesDirectory() {
    // Wenn bereits ein Handle vorhanden ist, prüfe ob es noch gültig ist
    if (themesDirectoryHandle) {
        try {
            await themesDirectoryHandle.requestPermission({ mode: 'readwrite' });
            return true;
        } catch (error) {
            // Handle ist nicht mehr gültig, zurücksetzen
            themesDirectoryHandle = null;
        }
    }
    
    // Wenn kein Handle vorhanden ist, versuche den themes Ordner auszuwählen
    if ('showDirectoryPicker' in window) {
        try {
            themesDirectoryHandle = await window.showDirectoryPicker({
                mode: 'readwrite',
                startIn: 'documents'
            });
            return true;
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error('Fehler beim Auswählen des themes Ordners:', error);
            }
            return false;
        }
    }
    return false;
}

// Speichert Theme-Index im LocalStorage und Theme-Datei als JSON im themes Ordner
export async function saveTheme(themeName, blocks) {
    if (!themeName || !themeName.trim()) {
        throw new Error('Theme-Name darf nicht leer sein.');
    }

    const sanitizedName = themeName.trim().replace(/[^a-z0-9äöüß_-]/gi, '_').toLowerCase();
    const filename = `${sanitizedName}.json`;
    const themeData = {
        name: themeName.trim(),
        filename: filename,
        data: JSON.parse(JSON.stringify(blocks)), // Speichere auch Daten im LocalStorage
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    // Speichere Theme-Index im LocalStorage
    const themes = await getAllThemes();
    const existingIndex = themes.findIndex(t => t.filename === themeData.filename);
    
    if (existingIndex !== -1) {
        // Aktualisiere existierendes Theme
        themes[existingIndex] = { ...themes[existingIndex], ...themeData };
    } else {
        // Füge neues Theme hinzu
        themes.push(themeData);
    }
    
    localStorage.setItem('blockEditorThemes', JSON.stringify(themes));

    // Versuche die Datei direkt im themes Ordner zu speichern
    let savedToDirectory = false;
    
    // Stelle sicher, dass der themes Ordner ausgewählt ist (automatisch beim ersten Speichern)
    if (await ensureThemesDirectory()) {
        try {
            // Erstelle oder öffne die Datei im themes Ordner
            const fileHandle = await themesDirectoryHandle.getFileHandle(filename, { create: true });
            const writable = await fileHandle.createWritable();
            const json = JSON.stringify(blocks, null, 2);
            await writable.write(json);
            await writable.close();
            
            savedToDirectory = true;
        } catch (error) {
            console.warn('Fehler beim Speichern im themes Ordner:', error);
            // Fallback zu Download
        }
    }
    
    // Fallback: Download der Datei, wenn nicht im themes Ordner gespeichert werden konnte
    if (!savedToDirectory) {
        const json = JSON.stringify(blocks, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    return themeData;
}

export async function getAllThemes() {
    const themesJson = localStorage.getItem('blockEditorThemes');
    let themes = [];
    
    if (themesJson) {
        try {
            themes = JSON.parse(themesJson);
        } catch (e) {
            console.error('Fehler beim Laden der Themes aus LocalStorage:', e);
        }
    }
    
    // Versuche auch Themes aus dem themes Ordner zu laden (wenn Server verfügbar)
    try {
        const response = await fetch('themes/');
        if (response.ok) {
            // Wenn der Server ein Verzeichnis-Listing unterstützt, könnten wir hier die Dateien auflisten
            // Für jetzt verlassen wir uns auf LocalStorage und manuelles Laden
        }
    } catch (error) {
        // Ignoriere Fehler - themes Ordner möglicherweise nicht über HTTP verfügbar
    }
    
    return themes;
}

export async function loadTheme(themeName, blocks, blockIdCounter, $nextTick, initAllBlockContents, updateCounter) {
    const themes = await getAllThemes();
    const theme = themes.find(t => t.name.toLowerCase() === themeName.toLowerCase());
    
    if (!theme) {
        throw new Error(`Theme "${themeName}" nicht gefunden.`);
    }

    let parsedBlocks = null;

    // Versuche zuerst aus dem themes Ordner zu laden (wenn File System Access API verfügbar)
    if (await ensureThemesDirectory() && theme.filename) {
        try {
            const fileHandle = await themesDirectoryHandle.getFileHandle(theme.filename);
            const file = await fileHandle.getFile();
            const text = await file.text();
            parsedBlocks = JSON.parse(text);
            
            // Aktualisiere LocalStorage mit den geladenen Daten
            theme.data = parsedBlocks;
            const updatedThemes = await getAllThemes();
            const themeIndex = updatedThemes.findIndex(t => t.name.toLowerCase() === themeName.toLowerCase());
            if (themeIndex !== -1) {
                updatedThemes[themeIndex] = theme;
                localStorage.setItem('blockEditorThemes', JSON.stringify(updatedThemes));
            }
        } catch (error) {
            // Ignoriere Fehler und versuche andere Methoden
            console.warn('Fehler beim Laden aus themes Ordner:', error);
        }
    }
    
    // Versuche aus LocalStorage zu laden
    if (!parsedBlocks && theme.data && Array.isArray(theme.data)) {
        parsedBlocks = theme.data;
    }
    
    // Fallback: Versuche aus Datei zu laden (nur wenn Server verfügbar)
    if (!parsedBlocks) {
        try {
            const response = await fetch(`themes/${theme.filename}`);
            if (response.ok) {
                parsedBlocks = await response.json();
                // Aktualisiere LocalStorage mit den geladenen Daten
                theme.data = parsedBlocks;
                const updatedThemes = await getAllThemes();
                const themeIndex = updatedThemes.findIndex(t => t.name.toLowerCase() === themeName.toLowerCase());
                if (themeIndex !== -1) {
                    updatedThemes[themeIndex] = theme;
                    localStorage.setItem('blockEditorThemes', JSON.stringify(updatedThemes));
                }
            }
        } catch (error) {
            // Ignoriere Fetch-Fehler
        }
    }
    
    if (!parsedBlocks) {
        throw new Error(`Theme-Daten für "${themeName}" nicht verfügbar. Bitte importiere die Datei erneut.`);
    }
    
    // Validiere Block-Struktur
    if (!Array.isArray(parsedBlocks)) {
        throw new Error('Theme-Daten sind ungültig.');
    }

    blocks.splice(0, blocks.length, ...parsedBlocks);
    
    // Stelle sicher, dass threeColumn Blöcke genau 3 Spalten haben
    ensureColumnStructure(blocks);
    
    // Berechne den maximalen Block-ID Counter
    let maxId = 0;
    parsedBlocks.forEach(b => {
        const match = b.id.match(/block-(\d+)-/);
        if (match) {
            const idNum = parseInt(match[1]);
            if (idNum > maxId) {
                maxId = idNum;
            }
        }
    });
    
    const newCounter = maxId || 0;
    
    if (updateCounter) {
        updateCounter(newCounter);
    }
    
    // Initialisiere Block-Inhalte nach dem Rendering
    $nextTick(() => {
        initAllBlockContents(blocks);
    });

    return { blocks: parsedBlocks, blockIdCounter: newCounter };
}

export async function deleteTheme(themeName) {
    const themes = await getAllThemes();
    const theme = themes.find(t => t.name.toLowerCase() === themeName.toLowerCase());
    
    if (!theme) {
        return false;
    }

    // Versuche die Datei aus dem themes Ordner zu löschen (wenn File System Access API verfügbar)
    if (await ensureThemesDirectory() && theme.filename) {
        try {
            await themesDirectoryHandle.removeEntry(theme.filename);
        } catch (error) {
            // Ignoriere Fehler - Datei könnte bereits gelöscht sein oder nicht existieren
            console.warn('Fehler beim Löschen der Datei aus themes Ordner:', error);
        }
    }

    // Entferne aus Index
    const filteredThemes = themes.filter(t => t.name.toLowerCase() !== themeName.toLowerCase());
    localStorage.setItem('blockEditorThemes', JSON.stringify(filteredThemes));
    
    return true;
}

export async function updateTheme(oldName, newName) {
    if (!newName || !newName.trim()) {
        throw new Error('Neuer Theme-Name darf nicht leer sein.');
    }

    const themes = await getAllThemes();
    const themeIndex = themes.findIndex(t => t.name.toLowerCase() === oldName.toLowerCase());
    
    if (themeIndex === -1) {
        throw new Error(`Theme "${oldName}" nicht gefunden.`);
    }

    const oldTheme = themes[themeIndex];
    const sanitizedName = newName.trim().replace(/[^a-z0-9äöüß_-]/gi, '_').toLowerCase();
    const newFilename = `${sanitizedName}.json`;

    // Prüfe ob neuer Name bereits existiert
    const nameExists = themes.some((t, i) => 
        i !== themeIndex && (t.name.toLowerCase() === newName.trim().toLowerCase() || t.filename === newFilename)
    );
    
    if (nameExists) {
        throw new Error(`Ein Theme mit dem Namen "${newName.trim()}" existiert bereits.`);
    }

    // Aktualisiere Theme
    themes[themeIndex] = {
        ...oldTheme,
        name: newName.trim(),
        filename: newFilename,
        updatedAt: new Date().toISOString()
    };

    localStorage.setItem('blockEditorThemes', JSON.stringify(themes));
    
    return themes[themeIndex];
}

export async function importThemeFromFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            try {
                const parsedBlocks = JSON.parse(e.target.result);
                
                // Validiere dass es ein Array ist
                if (!Array.isArray(parsedBlocks)) {
                    reject(new Error('JSON muss ein Array von Blöcken sein.'));
                    return;
                }

                // Validiere Block-Struktur
                for (let i = 0; i < parsedBlocks.length; i++) {
                    const block = parsedBlocks[i];
                    if (!block.id || !block.type) {
                        reject(new Error(`Block ${i + 1} fehlt 'id' oder 'type' Feld.`));
                        return;
                    }
                }

                // Extrahiere Theme-Namen aus Dateinamen
                const filename = file.name.replace('.json', '');
                const themeName = filename.replace(/[_-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

                const themeData = {
                    name: themeName,
                    filename: file.name,
                    data: parsedBlocks, // Speichere auch Daten im LocalStorage
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };

                // Füge Theme zum Index hinzu
                getAllThemes().then(themes => {
                    const existingIndex = themes.findIndex(t => t.filename === file.name);
                    
                    if (existingIndex !== -1) {
                        themes[existingIndex] = themeData;
                    } else {
                        themes.push(themeData);
                    }
                    
                    localStorage.setItem('blockEditorThemes', JSON.stringify(themes));

                    resolve({ themeData, blocks: parsedBlocks });
                }).catch(error => {
                    reject(new Error(`Fehler beim Laden der Themes: ${error.message}`));
                });
            } catch (error) {
                reject(new Error(`Fehler beim Parsen der Datei: ${error.message}`));
            }
        };
        
        reader.onerror = () => {
            reject(new Error('Fehler beim Lesen der Datei.'));
        };
        
        reader.readAsText(file);
    });
}

