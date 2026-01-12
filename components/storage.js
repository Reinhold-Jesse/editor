// Storage and Import/Export Functions - als Objekt organisiert
import { Utils } from './utils.js';
import { BlockManagement } from './block-management.js';
import { renderJSONBlocks } from './json-renderer.js';

export const Storage = {
    saveToJSON(blocks) {
        // Stelle sicher, dass die Struktur korrekt ist, bevor gespeichert wird
        BlockManagement.ensureColumnStructure(blocks);
        const json = JSON.stringify(blocks, null, 2);
        localStorage.setItem('blockEditorData', json);
        // Notification wird vom block-editor.js angezeigt
    },

    loadFromJSON(blocks, blockIdCounter, $nextTick, initAllBlockContents) {
        const saved = localStorage.getItem('blockEditorData');
        if (saved) {
            try {
                const parsedBlocks = JSON.parse(saved);
                
                // Rendere alle Blöcke aus dem JSON (zentrale Funktion)
                const renderedBlocks = renderJSONBlocks(parsedBlocks, blockIdCounter);
                
                blocks.splice(0, blocks.length, ...renderedBlocks);
                
                // Sicherstellen, dass blockIdCounter aktualisiert wird
                const maxId = Math.max(...renderedBlocks.map(b => {
                    const match = b.id.match(/block-(\d+)-/);
                    return match ? parseInt(match[1]) : 0;
                }));
                
                const newCounter = maxId || 0;
                
                // Initialisiere Block-Inhalte nach dem Rendering
                $nextTick(() => {
                    initAllBlockContents(blocks);
                });
                
                // Notification wird vom block-editor.js angezeigt
                return { blocks: renderedBlocks, blockIdCounter: newCounter };
            } catch (e) {
                // Notification wird vom block-editor.js angezeigt
                return { blocks: null, blockIdCounter: blockIdCounter };
            }
        } else {
            // Notification wird vom block-editor.js angezeigt
            return { blocks: null, blockIdCounter: blockIdCounter };
        }
    },

    importJSON(jsonText, blocks, blockIdCounter, $nextTick, initAllBlockContents, updateCounter) {
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

            // Rendere alle Blöcke aus dem JSON (zentrale Funktion)
            const renderedBlocks = renderJSONBlocks(parsedBlocks, blockIdCounter);
            
            blocks.splice(0, blocks.length, ...renderedBlocks);
            
            // Berechne den maximalen Block-ID Counter
            let maxId = 0;
            renderedBlocks.forEach(b => {
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
    },

    exportJSON(blocks) {
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
    },

    // Theme Management Functions
    // Speichert Theme-Index im LocalStorage und Theme-Datei als JSON im themes Ordner
    _themesDirectoryHandle: null,

    // Versucht automatisch den themes Ordner auszuwählen (wird beim ersten Speichern aufgerufen)
    async _ensureThemesDirectory() {
        // Wenn bereits ein Handle vorhanden ist, prüfe ob es noch gültig ist
        if (this._themesDirectoryHandle) {
            try {
                await this._themesDirectoryHandle.requestPermission({ mode: 'readwrite' });
                return true;
            } catch (error) {
                // Handle ist nicht mehr gültig, zurücksetzen
                this._themesDirectoryHandle = null;
            }
        }
        
        // Wenn kein Handle vorhanden ist, versuche den themes Ordner auszuwählen
        if ('showDirectoryPicker' in window) {
            try {
                this._themesDirectoryHandle = await window.showDirectoryPicker({
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
    },

    // Speichert Theme-Index im LocalStorage und Theme-Datei als JSON im themes Ordner
    async saveTheme(themeName, blocks) {
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
        const themes = await this.getAllThemes();
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
        if (await this._ensureThemesDirectory()) {
            try {
                // Erstelle oder öffne die Datei im themes Ordner
                const fileHandle = await this._themesDirectoryHandle.getFileHandle(filename, { create: true });
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
    },

    async getAllThemes() {
        const themesJson = localStorage.getItem('blockEditorThemes');
        let themes = [];
        
        if (themesJson) {
            try {
                themes = JSON.parse(themesJson);
            } catch (e) {
                console.error('Fehler beim Laden der Themes aus LocalStorage:', e);
            }
        }
        
        // Lade Themes aus dem themes Ordner (wenn Server verfügbar)
        const themesFromFolder = await this._loadThemesFromFolder();
        
        // Kombiniere Themes: Themes aus dem Ordner haben Priorität
        // Erstelle eine Map für schnelles Lookup
        const themesMap = new Map();
        
        // Füge zuerst Themes aus LocalStorage hinzu
        themes.forEach(theme => {
            themesMap.set(theme.filename || theme.name.toLowerCase(), theme);
        });
        
        // Überschreibe/Ergänze mit Themes aus dem Ordner
        themesFromFolder.forEach(theme => {
            const key = theme.filename || theme.name.toLowerCase();
            // Wenn Theme bereits existiert, aktualisiere es mit Daten aus dem Ordner
            if (themesMap.has(key)) {
                const existing = themesMap.get(key);
                themesMap.set(key, { ...existing, ...theme, data: theme.data || existing.data });
            } else {
                // Füge neues Theme hinzu
                themesMap.set(key, theme);
            }
        });
        
        // Konvertiere Map zurück zu Array
        return Array.from(themesMap.values());
    },

    // Lädt alle Themes aus dem themes Ordner
    async _loadThemesFromFolder() {
        const themesFromFolder = [];
        
        // Versuche zuerst, eine index.json zu laden, die eine Liste aller Themes enthält
        let allFiles = [];
        
        try {
            const indexResponse = await fetch('themes/index.json');
            if (indexResponse.ok) {
                const indexData = await indexResponse.json();
                if (Array.isArray(indexData.files)) {
                    allFiles = indexData.files;
                } else if (Array.isArray(indexData)) {
                    // Falls index.json direkt ein Array ist
                    allFiles = indexData;
                }
            }
        } catch (error) {
            // Ignoriere Fehler - index.json existiert möglicherweise nicht
        }
        
        // Wenn keine index.json gefunden wurde, versuche bekannte Dateien und automatische Erkennung
        if (allFiles.length === 0) {
            // Versuche, alle JSON-Dateien im themes Ordner zu finden
            // Da HTTP-Server normalerweise kein Verzeichnis-Listing unterstützen,
            // versuchen wir bekannte Patterns und Dateien
            const knownThemeFiles = [
                'block-editor-1765371313540.json',
                'block-editor-1765371474322.json'
            ];
            
            // Versuche auch, ein Verzeichnis-Listing zu bekommen (falls unterstützt)
            try {
                const dirResponse = await fetch('themes/');
                if (dirResponse.ok) {
                    const html = await dirResponse.text();
                    // Versuche, Links zu JSON-Dateien aus dem HTML zu extrahieren
                    const jsonLinks = html.match(/href="([^"]+\.json)"/g);
                    if (jsonLinks) {
                        jsonLinks.forEach(link => {
                            const filename = link.match(/href="([^"]+)"/)[1];
                            if (filename && !allFiles.includes(filename)) {
                                allFiles.push(filename);
                            }
                        });
                    }
                }
            } catch (error) {
                // Ignoriere Fehler - Verzeichnis-Listing nicht verfügbar
            }
            
            // Füge bekannte Dateien hinzu, falls noch nicht vorhanden
            knownThemeFiles.forEach(file => {
                if (!allFiles.includes(file)) {
                    allFiles.push(file);
                }
            });
        }
        
        // Versuche, jede Datei zu laden
        for (const filename of allFiles) {
            if (!filename.endsWith('.json')) continue;
            
            try {
                const response = await fetch(`themes/${filename}`);
                if (response.ok) {
                    const blocks = await response.json();
                    
                    // Validiere, dass es ein Array von Blöcken ist
                    if (Array.isArray(blocks) && blocks.length > 0 && blocks[0].id && blocks[0].type) {
                        // Extrahiere Theme-Namen aus Dateinamen
                        const themeName = filename
                            .replace('.json', '')
                            .replace(/^block-editor-/, '')
                            .replace(/[_-]/g, ' ')
                            .replace(/\b\w/g, l => l.toUpperCase())
                            .trim() || filename.replace('.json', '');
                        
                        const themeData = {
                            name: themeName,
                            filename: filename,
                            data: blocks,
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date(response.headers.get('last-modified') || new Date().toISOString()).toISOString()
                        };
                        
                        themesFromFolder.push(themeData);
                    }
                }
            } catch (error) {
                // Ignoriere Fehler für einzelne Dateien
                console.warn(`Fehler beim Laden von Theme-Datei "${filename}":`, error);
            }
        }
        
        return themesFromFolder;
    },

    async loadTheme(themeName, blocks, blockIdCounter, $nextTick, initAllBlockContents, updateCounter) {
        const themes = await this.getAllThemes();
        const theme = themes.find(t => t.name.toLowerCase() === themeName.toLowerCase());
        
        if (!theme) {
            throw new Error(`Theme "${themeName}" nicht gefunden.`);
        }

        let parsedBlocks = null;

        // Versuche zuerst aus dem themes Ordner zu laden (wenn File System Access API verfügbar)
        if (await this._ensureThemesDirectory() && theme.filename) {
            try {
                const fileHandle = await this._themesDirectoryHandle.getFileHandle(theme.filename);
                const file = await fileHandle.getFile();
                const text = await file.text();
                parsedBlocks = JSON.parse(text);
                
                // Aktualisiere LocalStorage mit den geladenen Daten
                theme.data = parsedBlocks;
                const updatedThemes = await this.getAllThemes();
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
                    const updatedThemes = await this.getAllThemes();
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

        // Rendere alle Blöcke aus dem JSON (zentrale Funktion)
        const renderedBlocks = renderJSONBlocks(parsedBlocks, blockIdCounter);
        
        blocks.splice(0, blocks.length, ...renderedBlocks);
        
        // Berechne den maximalen Block-ID Counter
        let maxId = 0;
        renderedBlocks.forEach(b => {
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

        return { blocks: renderedBlocks, blockIdCounter: newCounter };
    },

    async deleteTheme(themeName) {
        const themes = await this.getAllThemes();
        const theme = themes.find(t => t.name.toLowerCase() === themeName.toLowerCase());
        
        if (!theme) {
            return false;
        }

        // Entferne aus Index (ohne File System Access Dialog)
        const filteredThemes = themes.filter(t => t.name.toLowerCase() !== themeName.toLowerCase());
        localStorage.setItem('blockEditorThemes', JSON.stringify(filteredThemes));
        
        return true;
    },

    async updateTheme(oldName, newName) {
        if (!newName || !newName.trim()) {
            throw new Error('Neuer Theme-Name darf nicht leer sein.');
        }

        const themes = await this.getAllThemes();
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
    },

    async importThemeFromFile(file) {
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

                    // Rendere alle Blöcke aus dem JSON (zentrale Funktion)
                    const renderedBlocks = renderJSONBlocks(parsedBlocks, 0);

                    // Extrahiere Theme-Namen aus Dateinamen
                    const filename = file.name.replace('.json', '');
                    const themeName = filename.replace(/[_-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

                    const themeData = {
                        name: themeName,
                        filename: file.name,
                        data: renderedBlocks, // Speichere gerenderte Daten im LocalStorage
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    };

                    // Füge Theme zum Index hinzu
                    this.getAllThemes().then(themes => {
                        const existingIndex = themes.findIndex(t => t.filename === file.name);
                        
                        if (existingIndex !== -1) {
                            themes[existingIndex] = themeData;
                        } else {
                            themes.push(themeData);
                        }
                        
                        localStorage.setItem('blockEditorThemes', JSON.stringify(themes));

                        resolve({ themeData, blocks: renderedBlocks });
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
};

// Legacy Exports für Rückwärtskompatibilität
export const saveToJSON = Storage.saveToJSON.bind(Storage);
export const loadFromJSON = Storage.loadFromJSON.bind(Storage);
export const importJSON = Storage.importJSON.bind(Storage);
export const exportJSON = Storage.exportJSON.bind(Storage);
export const saveTheme = Storage.saveTheme.bind(Storage);
export const getAllThemes = Storage.getAllThemes.bind(Storage);
export const loadTheme = Storage.loadTheme.bind(Storage);
export const deleteTheme = Storage.deleteTheme.bind(Storage);
export const updateTheme = Storage.updateTheme.bind(Storage);
export const importThemeFromFile = Storage.importThemeFromFile.bind(Storage);
