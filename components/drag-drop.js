// Drag and Drop Functions
export function handleDragStart(event, blocks, index, childIndex = null) {
    let dragStartIndex;
    let draggingBlockId;
    
    if (childIndex !== null && childIndex !== undefined) {
        // Child-Block wird gezogen
        dragStartIndex = { type: 'child', parentIndex: index, childIndex: childIndex };
        draggingBlockId = blocks[index].children[childIndex].id;
    } else {
        // Haupt-Block wird gezogen
        dragStartIndex = { type: 'main', index: index };
        draggingBlockId = blocks[index].id;
    }
    
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/html', event.target.outerHTML);
    
    return { dragStartIndex, draggingBlockId };
}

export function handleDragOver(event, index, childIndex = null) {
    event.preventDefault();
    let dragOverIndex;
    
    if (childIndex !== null && childIndex !== undefined) {
        dragOverIndex = { type: 'child', parentIndex: index, childIndex: childIndex };
    } else {
        dragOverIndex = { type: 'main', index: index };
    }
    
    event.dataTransfer.dropEffect = 'move';
    return dragOverIndex;
}

export function handleDrop(event, blocks, dragStartIndex, dropIndex, dropChildIndex = null, targetColumnIndex = null, totalColumns = null) {
    event.preventDefault();
    
    if (dragStartIndex === null) return;
    
    const start = dragStartIndex;
    
    if (start.type === 'main') {
        // Haupt-Block wird verschoben
        if (dropChildIndex === null) {
            // Zu einem anderen Haupt-Block
            if (start.index !== dropIndex) {
                const draggedBlock = blocks[start.index];
                blocks.splice(start.index, 1);
                blocks.splice(dropIndex, 0, draggedBlock);
            }
        }
    } else if (start.type === 'child') {
        // Child-Block wird verschoben
        if (start.parentIndex === dropIndex) {
            const parent = blocks[start.parentIndex];
            
            // Prüfe ob es ein Spalten-Layout ist
            if (parent.type === 'twoColumn' || parent.type === 'threeColumn') {
                const columns = parent.type === 'twoColumn' ? 2 : 3;
                const draggedChild = parent.children[start.childIndex];
                const startColumn = start.childIndex % columns;
                
                // Bestimme Ziel-Spalte
                let finalTargetColumn;
                if (targetColumnIndex !== null && targetColumnIndex !== undefined) {
                    finalTargetColumn = targetColumnIndex;
                } else if (dropChildIndex !== null && dropChildIndex !== undefined) {
                    finalTargetColumn = dropChildIndex % columns;
                } else {
                    // Fallback: gleiche Spalte
                    finalTargetColumn = startColumn;
                }
                
                // Wenn keine Änderung, abbrechen
                if (startColumn === finalTargetColumn && start.childIndex === dropChildIndex) {
                    return;
                }
                
                // Entferne den gezogenen Block zuerst
                parent.children.splice(start.childIndex, 1);
                
                // Berechne Zielposition NACH dem Entfernen
                let targetIndex;
                
                if (dropChildIndex !== null && dropChildIndex !== undefined) {
                    // Drop auf einen existierenden Child-Block
                    // Finde die Position des Ziel-Items innerhalb der Ziel-Spalte BEVOR wir entfernen
                    let originalTargetPosition = 0;
                    for (let i = 0; i < dropChildIndex; i++) {
                        if (i % columns === finalTargetColumn) {
                            originalTargetPosition++;
                        }
                    }
                    
                    // Berechne die Position NACH dem Entfernen
                    // Wenn wir innerhalb derselben Spalte nach unten verschieben,
                    // bleibt die Position gleich (weil wir nach dem Item einfügen wollen)
                    // Wenn wir nach oben verschieben, wird die Position um 1 reduziert
                    let targetPosition = originalTargetPosition;
                    if (startColumn === finalTargetColumn && start.childIndex > dropChildIndex) {
                        // Nach oben: Position wird um 1 reduziert
                        targetPosition = Math.max(0, originalTargetPosition - 1);
                    }
                    
                    // Berechne den Ziel-Index basierend auf der Position in der Spalte
                    if (startColumn === finalTargetColumn && start.childIndex < dropChildIndex) {
                        // Nach unten in derselben Spalte: füge nach dem Item ein
                        targetIndex = (targetPosition + 1) * columns + finalTargetColumn;
                    } else {
                        // Nach oben oder zu anderer Spalte: füge vor dem Item ein
                        targetIndex = targetPosition * columns + finalTargetColumn;
                    }
                    
                    // Stelle sicher, dass targetIndex nicht größer als Array-Länge ist
                    // Wenn die berechnete Position zu groß ist, füge am Ende der Spalte ein
                    if (targetIndex > parent.children.length) {
                        // Zähle Items in der Ziel-Spalte
                        let itemsInTargetColumn = 0;
                        for (let i = 0; i < parent.children.length; i++) {
                            if (i % columns === finalTargetColumn) {
                                itemsInTargetColumn++;
                            }
                        }
                        targetIndex = itemsInTargetColumn * columns + finalTargetColumn;
                    }
                } else if (targetColumnIndex !== null) {
                    // Drop auf eine leere Spalte - füge am Ende der Spalte hinzu
                    let itemsInTargetColumn = 0;
                    for (let i = 0; i < parent.children.length; i++) {
                        if (i % columns === targetColumnIndex) {
                            itemsInTargetColumn++;
                        }
                    }
                    targetIndex = itemsInTargetColumn * columns + targetColumnIndex;
                } else {
                    // Fallback: am Ende hinzufügen
                    targetIndex = parent.children.length;
                }
                
                // Stelle sicher, dass targetIndex nicht negativ ist
                if (targetIndex < 0) {
                    targetIndex = finalTargetColumn;
                }
                
                // Füge den Block an der Zielposition ein
                parent.children.splice(targetIndex, 0, draggedChild);
            } else {
                // Normales Child-Layout (nicht Spalten)
                if (dropChildIndex !== null && dropChildIndex !== undefined) {
                    if (start.childIndex !== dropChildIndex) {
                        const draggedChild = parent.children[start.childIndex];
                        parent.children.splice(start.childIndex, 1);
                        let newIndex = dropChildIndex;
                        if (start.childIndex < dropChildIndex) {
                            newIndex = dropChildIndex - 1;
                        }
                        parent.children.splice(newIndex, 0, draggedChild);
                    }
                }
            }
        }
    }
}

