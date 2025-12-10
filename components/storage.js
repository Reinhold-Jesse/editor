// Storage and Import/Export Functions
import { initAllBlockContents } from './utils.js';

export function saveToJSON(blocks) {
    const json = JSON.stringify(blocks, null, 2);
    localStorage.setItem('blockEditorData', json);
    alert('Daten gespeichert!');
}

export function loadFromJSON(blocks, blockIdCounter, $nextTick, initAllBlockContents) {
    const saved = localStorage.getItem('blockEditorData');
    if (saved) {
        try {
            const parsedBlocks = JSON.parse(saved);
            blocks.splice(0, blocks.length, ...parsedBlocks);
            
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
            
            alert('Daten geladen!');
            return { blocks: parsedBlocks, blockIdCounter: newCounter };
        } catch (e) {
            alert('Fehler beim Laden der Daten!');
            return { blocks: null, blockIdCounter: blockIdCounter };
        }
    } else {
        alert('Keine gespeicherten Daten gefunden!');
        return { blocks: null, blockIdCounter: blockIdCounter };
    }
}

export function importJSON(jsonText, blocks, blockIdCounter, $nextTick, initAllBlockContents, updateCounter) {
    try {
        const parsedBlocks = JSON.parse(jsonText);
        
        // Validiere dass es ein Array ist
        if (!Array.isArray(parsedBlocks)) {
            alert('Fehler: JSON muss ein Array von Blöcken sein.');
            return;
        }

        // Validiere Block-Struktur
        for (let i = 0; i < parsedBlocks.length; i++) {
            const block = parsedBlocks[i];
            if (!block.id || !block.type) {
                alert(`Fehler: Block ${i + 1} fehlt 'id' oder 'type' Feld.`);
                return;
            }
        }

        blocks.splice(0, blocks.length, ...parsedBlocks);
        
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
        
        alert(`Erfolgreich ${parsedBlocks.length} Block(s) importiert!`);
    } catch (error) {
        alert('Fehler beim Importieren der Daten: ' + error.message);
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
// Speichert Theme-Index im LocalStorage und Theme-Datei als JSON
export function saveTheme(themeName, blocks) {
    if (!themeName || !themeName.trim()) {
        throw new Error('Theme-Name darf nicht leer sein.');
    }

    const sanitizedName = themeName.trim().replace(/[^a-z0-9äöüß_-]/gi, '_').toLowerCase();
    const themeData = {
        name: themeName.trim(),
        filename: `${sanitizedName}.json`,
        data: JSON.parse(JSON.stringify(blocks)), // Speichere auch Daten im LocalStorage
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    // Speichere Theme-Index im LocalStorage
    const themes = getAllThemes();
    const existingIndex = themes.findIndex(t => t.filename === themeData.filename);
    
    if (existingIndex !== -1) {
        // Aktualisiere existierendes Theme
        themes[existingIndex] = { ...themes[existingIndex], ...themeData };
    } else {
        // Füge neues Theme hinzu
        themes.push(themeData);
    }
    
    localStorage.setItem('blockEditorThemes', JSON.stringify(themes));

    // Speichere Theme als JSON-Datei (Download)
    const json = JSON.stringify(blocks, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `themes/${themeData.filename}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    return themeData;
}

export function getAllThemes() {
    const themesJson = localStorage.getItem('blockEditorThemes');
    if (!themesJson) {
        return [];
    }
    try {
        return JSON.parse(themesJson);
    } catch (e) {
        console.error('Fehler beim Laden der Themes:', e);
        return [];
    }
}

export async function loadTheme(themeName, blocks, blockIdCounter, $nextTick, initAllBlockContents, updateCounter) {
    const themes = getAllThemes();
    const theme = themes.find(t => t.name.toLowerCase() === themeName.toLowerCase());
    
    if (!theme) {
        throw new Error(`Theme "${themeName}" nicht gefunden.`);
    }

    let parsedBlocks = null;

    // Versuche zuerst aus LocalStorage zu laden
    if (theme.data && Array.isArray(theme.data)) {
        parsedBlocks = theme.data;
    } else {
        // Fallback: Versuche aus Datei zu laden (nur wenn Server verfügbar)
        try {
            const response = await fetch(`themes/${theme.filename}`);
            if (response.ok) {
                parsedBlocks = await response.json();
                // Aktualisiere LocalStorage mit den geladenen Daten
                theme.data = parsedBlocks;
                const themes = getAllThemes();
                const themeIndex = themes.findIndex(t => t.name.toLowerCase() === themeName.toLowerCase());
                if (themeIndex !== -1) {
                    themes[themeIndex] = theme;
                    localStorage.setItem('blockEditorThemes', JSON.stringify(themes));
                }
            }
        } catch (error) {
            // Ignoriere Fetch-Fehler, verwende LocalStorage-Daten
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

export function deleteTheme(themeName) {
    const themes = getAllThemes();
    const theme = themes.find(t => t.name.toLowerCase() === themeName.toLowerCase());
    
    if (!theme) {
        return false;
    }

    // Entferne aus Index
    const filteredThemes = themes.filter(t => t.name.toLowerCase() !== themeName.toLowerCase());
    localStorage.setItem('blockEditorThemes', JSON.stringify(filteredThemes));
    
    // Hinweis: Die Datei muss manuell gelöscht werden, da Browser keine Dateien löschen können
    return true;
}

export function updateTheme(oldName, newName) {
    if (!newName || !newName.trim()) {
        throw new Error('Neuer Theme-Name darf nicht leer sein.');
    }

    const themes = getAllThemes();
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
                const themes = getAllThemes();
                const existingIndex = themes.findIndex(t => t.filename === file.name);
                
                if (existingIndex !== -1) {
                    themes[existingIndex] = themeData;
                } else {
                    themes.push(themeData);
                }
                
                localStorage.setItem('blockEditorThemes', JSON.stringify(themes));

                resolve({ themeData, blocks: parsedBlocks });
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

