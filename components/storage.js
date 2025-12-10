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

