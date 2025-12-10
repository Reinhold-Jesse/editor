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

export function handleDrop(event, blocks, dragStartIndex, dropIndex, dropChildIndex = null) {
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
        if (dropChildIndex !== null && dropChildIndex !== undefined) {
            // Zu einem anderen Child-Block im gleichen Parent
            if (start.parentIndex === dropIndex && start.childIndex !== dropChildIndex) {
                const parent = blocks[start.parentIndex];
                const draggedChild = parent.children[start.childIndex];
                parent.children.splice(start.childIndex, 1);
                parent.children.splice(dropChildIndex, 0, draggedChild);
            }
        }
    }
}

