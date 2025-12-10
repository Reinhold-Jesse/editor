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

export function importJSON(blocks, blockIdCounter, $nextTick, initAllBlockContents, updateCounter) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const parsedBlocks = JSON.parse(event.target.result);
                    blocks.splice(0, blocks.length, ...parsedBlocks);
                    
                    const maxId = Math.max(...parsedBlocks.map(b => {
                        const match = b.id.match(/block-(\d+)-/);
                        return match ? parseInt(match[1]) : 0;
                    }));
                    
                    const newCounter = maxId || 0;
                    
                    if (updateCounter) {
                        updateCounter(newCounter);
                    }
                    
                    // Initialisiere Block-Inhalte nach dem Rendering
                    $nextTick(() => {
                        initAllBlockContents(blocks);
                    });
                    
                    alert('Daten importiert!');
                } catch (error) {
                    alert('Fehler beim Importieren der Daten!');
                }
            };
            reader.readAsText(file);
        }
    };
    input.click();
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

