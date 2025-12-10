// Block Editor Komponente
import { 
    initAllBlockContents, 
    initBlockContent, 
    findBlockById, 
    getAllBlocks 
} from './components/utils.js';
import {
    addBlock as addBlockUtil,
    addBlockAfter as addBlockAfterUtil,
    updateBlockContent as updateBlockContentUtil,
    deleteBlock as deleteBlockUtil,
    changeBlockType as changeBlockTypeUtil,
    updateBlockStyle as updateBlockStyleUtil,
    clearBlockStyle as clearBlockStyleUtil,
    updateBlockClasses as updateBlockClassesUtil,
    clearBlockClasses as clearBlockClassesUtil,
    moveBlock as moveBlockUtil,
    updateLinkText as updateLinkTextUtil,
    updateLinkUrl as updateLinkUrlUtil
} from './components/block-management.js';
import {
    addChild as addChildUtil,
    addChildAfter as addChildAfterUtil,
    removeChild as removeChildUtil,
    moveChildBlock as moveChildBlockUtil,
    addChildToColumn as addChildToColumnUtil
} from './components/child-management.js';
import {
    handleDragStart as handleDragStartUtil,
    handleDragOver as handleDragOverUtil,
    handleDrop as handleDropUtil
} from './components/drag-drop.js';
import {
    saveToJSON as saveToJSONUtil,
    loadFromJSON as loadFromJSONUtil,
    importJSON as importJSONUtil,
    exportJSON as exportJSONUtil,
    saveTheme as saveThemeUtil,
    getAllThemes as getAllThemesUtil,
    loadTheme as loadThemeUtil,
    deleteTheme as deleteThemeUtil,
    updateTheme as updateThemeUtil,
    importThemeFromFile as importThemeFromFileUtil
} from './components/storage.js';
import {
    addTableRow,
    removeTableRow,
    addTableColumn,
    removeTableColumn,
    mergeTableCells,
    unmergeTableCells,
    updateTableCellContent,
    toggleTableHeader,
    toggleTableFooter
} from './components/table-management.js';

function blockEditor() {
    return {
        blocks: [],
        selectedBlockId: null,
        hoveredBlockId: null,
        draggingBlockId: null,
        showToolbar: false,
        showThemeDropdown: false,
        blockIdCounter: 0,
        dragStartIndex: null,
        dragOverIndex: null,
        showSidebar: false,
        sidebarTab: 'blocks',
        showImportModal: false,
        importJSONText: '',
        importJSONValid: false,
        importJSONError: null,
        importJSONPreview: null,
        showExportModal: false,
        exportJSONText: '',
        exportCopied: false,
        showSaveThemeModal: false,
        showEditThemeModal: false,
        showImportThemeModal: false,
        showLinkSettingsModal: false,
        linkSettingsBlockId: null,
        linkSettingsText: '',
        linkSettingsUrl: '',
        showFloatingToolbar: false,
        floatingToolbarPosition: { top: 0, left: 0 },
        selectedText: '',
        selectedRange: null,
        selectedBlockId: null,
        showLinkInputModal: false,
        linkInputUrl: '',
        editingLink: null,
        editingLinkElement: null,
        newThemeName: '',
        editThemeName: '',
        editThemeOriginalName: '',
        saveThemeError: null,
        editThemeError: null,
        themes: [],
        notification: {
            show: false,
            message: '',
            type: 'success', // success, error, info, warning
            duration: 3000 // Automatisches Ausblenden in Millisekunden (0 = kein automatisches Ausblenden)
        },
        notificationTimeout: null, // Timeout-Referenz für automatisches Ausblenden

        init() {
            // Start mit einem leeren Paragraph
            if (this.blocks.length === 0) {
                this.addBlock('paragraph');
            }
            // Lade Themes beim Initialisieren
            this.loadThemes();
            // Initialisiere Block-Inhalte nach dem Rendering
            this.$nextTick(() => {
                this.initAllBlockContents();
            });
            
            // Event Listener für Text-Selektion
            document.addEventListener('mouseup', () => {
                setTimeout(() => this.handleTextSelection(), 10);
            });
            document.addEventListener('keyup', () => {
                setTimeout(() => this.handleTextSelection(), 10);
            });
            
            // Event Listener für Rechtsklick (Context-Menu)
            document.addEventListener('contextmenu', (e) => {
                const selection = window.getSelection();
                const selectedText = selection.toString().trim();
                
                // Prüfe ob Text markiert ist
                if (selectedText && selection.rangeCount > 0) {
                    const range = selection.getRangeAt(0);
                    
                    // Finde das contenteditable Element - gehe nach oben im DOM-Baum
                    let editableElement = range.commonAncestorContainer;
                    
                    // Wenn es ein Text-Node ist, gehe zum Parent
                    if (editableElement.nodeType === 3) {
                        editableElement = editableElement.parentElement;
                    }
                    
                    // Gehe nach oben bis zum contenteditable Element
                    while (editableElement && editableElement.nodeType === 1) {
                        if (editableElement.hasAttribute('contenteditable') && editableElement.getAttribute('contenteditable') === 'true') {
                            break;
                        }
                        editableElement = editableElement.parentElement;
                    }
                    
                    if (editableElement && editableElement.hasAttribute('contenteditable')) {
                        const blockElement = editableElement.closest('[data-block-id]');
                        if (blockElement) {
                            const blockId = blockElement.getAttribute('data-block-id');
                            const { block } = this.findBlockById(blockId);
                            
                            // Zeige Toolbar nur für Text-Blöcke
                            if (block && block.type !== 'code' && block.type !== 'table' && block.type !== 'divider' && block.type !== 'link') {
                                e.preventDefault();
                                e.stopPropagation();
                                
                                // Positioniere Toolbar an Mausposition
                                const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                                const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
                                
                                this.floatingToolbarPosition = {
                                    top: e.clientY + scrollTop - 50,
                                    left: e.clientX + scrollLeft
                                };
                                
                                // Speichere Selektion
                                this.selectedText = selectedText;
                                this.selectedRange = range.cloneRange();
                                this.selectedBlockId = blockId;
                                this.showFloatingToolbar = true;
                            }
                        }
                    }
                }
            });
            
            // Event Listener für Link-Klicks (Bearbeitung)
            document.addEventListener('click', (e) => {
                // Prüfe ob ein Link angeklickt wurde (mit Ctrl/Cmd für Bearbeitung)
                const linkElement = e.target.closest('a[href]');
                if (linkElement && linkElement.closest('[data-block-id]')) {
                    const blockElement = linkElement.closest('[data-block-id]');
                    if (blockElement && blockElement.hasAttribute('contenteditable')) {
                        // Ctrl/Cmd + Klick = Bearbeitung, normaler Klick = Navigation verhindern
                        if (e.ctrlKey || e.metaKey) {
                            e.preventDefault();
                            e.stopPropagation();
                            this.editLink(linkElement, blockElement);
                        } else {
                            // Normaler Klick: Verhindere Navigation, öffne Bearbeitung
                            e.preventDefault();
                            e.stopPropagation();
                            this.editLink(linkElement, blockElement);
                        }
                    }
                }
                
                // Verstecke Toolbar bei Klick außerhalb
                if (this.showFloatingToolbar && !e.target.closest('.floating-toolbar')) {
                    // Prüfe ob Klick auf Toolbar oder Modal ist
                    if (!e.target.closest('[x-show*="showFloatingToolbar"]') && 
                        !e.target.closest('[x-show*="showLinkInputModal"]')) {
                        this.showFloatingToolbar = false;
                    }
                }
            });
        },

        initAllBlockContents() {
            initAllBlockContents(this.blocks);
        },

        initBlockContent(element, block, isTextContent = false) {
            initBlockContent(element, block, isTextContent);
        },

        initTableCellContent(element, cell) {
            // Nur initialisieren wenn Element leer ist und Cell Inhalt hat
            if (!element.textContent && cell && cell.content) {
                element.innerHTML = cell.content;
                // Cursor ans Ende setzen
                this.$nextTick(() => {
                    const range = document.createRange();
                    const sel = window.getSelection();
                    range.selectNodeContents(element);
                    range.collapse(false);
                    sel.removeAllRanges();
                    sel.addRange(range);
                });
            }
        },

        openSidebar(blockId = null) {
            if (blockId) {
                this.selectedBlockId = blockId;
            }
            this.showSidebar = true;
        },

        closeSidebar() {
            this.showSidebar = false;
            // this.selectedBlockId = null; // Optional: Block-Auswahl beibehalten
        },

        addBlock(type, content = '') {
            this.blockIdCounter++;
            const block = addBlockUtil(this.blocks, this.selectedBlockId, this.blockIdCounter, type, content);
            this.selectedBlockId = block.id;
            this.showToolbar = false;
            this.showThemeDropdown = false;
            
            // Focus auf den neuen Block
            this.$nextTick(() => {
                const element = document.querySelector(`[data-block-id="${block.id}"]`);
                if (element) {
                    element.focus();
                    // Setze Cursor ans Ende
                    const range = document.createRange();
                    const sel = window.getSelection();
                    range.selectNodeContents(element);
                    range.collapse(false);
                    sel.removeAllRanges();
                    sel.addRange(range);
                }
            });
        },

        async loadThemeFromToolbar(themeName) {
            try {
                const updateCounter = (newCounter) => {
                    this.blockIdCounter = newCounter;
                };
                
                const result = await loadThemeUtil(
                    themeName,
                    this.blocks,
                    this.blockIdCounter,
                    this.$nextTick.bind(this),
                    initAllBlockContents,
                    updateCounter
                );
                
                if (result.blocks) {
                    this.selectedBlockId = null;
                    this.blockIdCounter = result.blockIdCounter;
                    this.showToolbar = false;
                    this.showThemeDropdown = false;
                    this.showNotification(`Theme "${themeName}" erfolgreich geladen!`, 'success');
                }
            } catch (error) {
                this.showNotification('Fehler beim Laden des Themes: ' + error.message, 'error');
            }
        },

        addBlockAfter(blockId, type = 'paragraph') {
            this.blockIdCounter++;
            const block = addBlockAfterUtil(this.blocks, blockId, this.blockIdCounter, type);
            this.selectedBlockId = block.id;
            
            this.$nextTick(() => {
                const element = document.querySelector(`[data-block-id="${block.id}"]`);
                if (element) {
                    element.focus();
                    // Setze Cursor ans Ende
                    const range = document.createRange();
                    const sel = window.getSelection();
                    range.selectNodeContents(element);
                    range.collapse(false);
                    sel.removeAllRanges();
                    sel.addRange(range);
                }
            });
        },

        updateBlockContent(blockId, content) {
            updateBlockContentUtil(this.blocks, blockId, content);
        },

        deleteBlock(blockId) {
            const result = deleteBlockUtil(this.blocks, blockId);
            if (result.deleted) {
                this.selectedBlockId = null;
                
                // Wenn keine Blöcke mehr vorhanden, einen neuen Paragraph hinzufügen
                if (this.blocks.length === 0) {
                    this.addBlock('paragraph');
                } else {
                    // Focus auf den vorherigen oder nächsten Block
                    this.selectedBlockId = this.blocks[result.newSelectedIndex].id;
                }
            }
        },

        selectBlock(blockId) {
            this.selectedBlockId = blockId;
        },

        deselectAll() {
            this.selectedBlockId = null;
            this.showToolbar = false;
        },

        moveBlock(index, direction) {
            moveBlockUtil(this.blocks, index, direction);
        },

        handleBackspace(blockId, event) {
            const { block, parent } = this.findBlockById(blockId);
            if (block && event.target.textContent === '') {
                if (parent) {
                    // Es ist ein Child-Block
                    const childIndex = parent.children.findIndex(c => c.id === blockId);
                    if (childIndex !== -1 && parent.children.length > 1) {
                        event.preventDefault();
                        this.removeChild(parent.id, childIndex);
                    }
                } else {
                    // Es ist ein Haupt-Block
                    if (this.blocks.length > 1) {
                        event.preventDefault();
                        this.deleteBlock(blockId);
                    }
                }
            }
        },

        handleDragStart(event, index, childIndex = null) {
            const result = handleDragStartUtil(event, this.blocks, index, childIndex);
            this.dragStartIndex = result.dragStartIndex;
            this.draggingBlockId = result.draggingBlockId;
        },

        handleDragOver(event, index, childIndex = null) {
            this.dragOverIndex = handleDragOverUtil(event, index, childIndex);
        },

        handleDrop(event, dropIndex, dropChildIndex = null) {
            handleDropUtil(event, this.blocks, this.dragStartIndex, dropIndex, dropChildIndex);
            this.dragStartIndex = null;
            this.dragOverIndex = null;
        },

        handleDragEnd() {
            this.draggingBlockId = null;
            this.dragStartIndex = null;
            this.dragOverIndex = null;
        },

        changeBlockType(blockId, newType) {
            changeBlockTypeUtil(this.blocks, blockId, newType);
            
            // Focus auf den Block nach Typ-Änderung
            this.$nextTick(() => {
                const element = document.querySelector(`[data-block-id="${blockId}"]`);
                if (element) {
                    element.focus();
                }
            });
        },

        updateBlockStyle(blockId, style) {
            updateBlockStyleUtil(this.blocks, blockId, style);
        },

        clearBlockStyle(blockId) {
            clearBlockStyleUtil(this.blocks, blockId);
        },

        updateBlockClasses(blockId, classes) {
            updateBlockClassesUtil(this.blocks, blockId, classes);
        },

        clearBlockClasses(blockId) {
            clearBlockClassesUtil(this.blocks, blockId);
        },

        addChild(parentBlockId, childType) {
            this.blockIdCounter++;
            const childBlock = addChildUtil(this.blocks, parentBlockId, this.blockIdCounter, childType);
            if (childBlock) {
                this.selectedBlockId = childBlock.id;
                
                this.$nextTick(() => {
                    const element = document.querySelector(`[data-block-id="${childBlock.id}"]`);
                    if (element) {
                        element.focus();
                    }
                });
            }
        },

        addChildAfter(parentBlockId, childIndex, childType) {
            this.blockIdCounter++;
            const childBlock = addChildAfterUtil(this.blocks, parentBlockId, childIndex, this.blockIdCounter, childType);
            if (childBlock) {
                this.selectedBlockId = childBlock.id;
                
                this.$nextTick(() => {
                    const element = document.querySelector(`[data-block-id="${childBlock.id}"]`);
                    if (element) {
                        element.focus();
                    }
                });
            }
        },

        removeChild(parentBlockId, childIndex) {
            removeChildUtil(this.blocks, parentBlockId, childIndex);
        },

        moveChildBlock(parentBlockId, childIndex, direction) {
            moveChildBlockUtil(this.blocks, parentBlockId, childIndex, direction);
        },

        addChildToColumn(parentBlockId, childType, columnIndex, totalColumns) {
            this.blockIdCounter++;
            const childBlock = addChildToColumnUtil(this.blocks, parentBlockId, this.blockIdCounter, childType, columnIndex, totalColumns);
            if (childBlock) {
                this.selectedBlockId = childBlock.id;
                
                this.$nextTick(() => {
                    const element = document.querySelector(`[data-block-id="${childBlock.id}"]`);
                    if (element) {
                        element.focus();
                    }
                });
            }
        },

        findBlockById(blockId) {
            return findBlockById(this.blocks, blockId);
        },

        getAllBlocks() {
            return getAllBlocks(this.blocks);
        },

        saveToJSON() {
            saveToJSONUtil(this.blocks);
        },

        loadFromJSON() {
            const result = loadFromJSONUtil(this.blocks, this.blockIdCounter, this.$nextTick.bind(this), initAllBlockContents);
            if (result.blocks) {
                this.selectedBlockId = null;
                this.blockIdCounter = result.blockIdCounter;
            }
        },

        importJSON() {
            this.showImportModal = true;
            this.importJSONText = '';
            this.importJSONValid = false;
            this.importJSONError = null;
            this.importJSONPreview = null;
        },

        closeImportModal() {
            this.showImportModal = false;
            this.importJSONText = '';
            this.importJSONValid = false;
            this.importJSONError = null;
            this.importJSONPreview = null;
        },

        validateImportJSON() {
            this.importJSONError = null;
            this.importJSONValid = false;
            this.importJSONPreview = null;

            if (!this.importJSONText.trim()) {
                return;
            }

            try {
                const parsed = JSON.parse(this.importJSONText);
                
                // Prüfe ob es ein Array ist
                if (!Array.isArray(parsed)) {
                    this.importJSONError = 'JSON muss ein Array von Blöcken sein.';
                    return;
                }

                // Prüfe ob Blöcke die erforderlichen Felder haben
                if (parsed.length === 0) {
                    this.importJSONError = 'Das Array ist leer.';
                    return;
                }

                // Validiere Block-Struktur
                for (let i = 0; i < parsed.length; i++) {
                    const block = parsed[i];
                    if (!block.id || !block.type) {
                        this.importJSONError = `Block ${i + 1} fehlt 'id' oder 'type' Feld.`;
                        return;
                    }
                }

                this.importJSONValid = true;
                this.importJSONPreview = {
                    blockCount: parsed.length
                };
            } catch (error) {
                this.importJSONError = error.message || 'Ungültiges JSON Format.';
            }
        },

        confirmImportJSON() {
            if (!this.importJSONValid || !this.importJSONText) {
                return;
            }

            const updateCounter = (newCounter) => {
                this.blockIdCounter = newCounter;
            };
            
            importJSONUtil(
                this.importJSONText,
                this.blocks,
                this.blockIdCounter,
                this.$nextTick.bind(this),
                initAllBlockContents,
                updateCounter
            );
            
            this.closeImportModal();
        },

        exportJSON() {
            const json = JSON.stringify(this.blocks, null, 2);
            this.exportJSONText = json;
            this.showExportModal = true;
        },

        closeExportModal() {
            this.showExportModal = false;
            this.exportJSONText = '';
            this.exportCopied = false;
        },

        async copyExportJSON() {
            try {
                // Moderne Clipboard API verwenden falls verfügbar
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    await navigator.clipboard.writeText(this.exportJSONText);
                } else {
                    // Fallback für ältere Browser
                    if (this.$refs.exportJSONTextarea) {
                        this.$refs.exportJSONTextarea.select();
                        this.$refs.exportJSONTextarea.setSelectionRange(0, 99999);
                        document.execCommand('copy');
                    }
                }
                
                // Erfolgsmeldung anzeigen
                this.exportCopied = true;
                setTimeout(() => {
                    this.exportCopied = false;
                }, 2000);
            } catch (err) {
                console.error('Fehler beim Kopieren:', err);
                alert('Fehler beim Kopieren. Bitte manuell kopieren.');
            }
        },

        downloadExportJSON() {
            exportJSONUtil(this.blocks);
        },

        // Table Management Functions
        addTableRow(blockId, position = 'bottom') {
            const result = addTableRow(this.blocks, blockId, this.blockIdCounter, position);
            if (result) {
                this.blockIdCounter = result.lastCellIdCounter + 1;
            }
        },

        removeTableRow(blockId, rowIndex) {
            removeTableRow(this.blocks, blockId, rowIndex);
        },

        addTableColumn(blockId, position = 'right') {
            const result = addTableColumn(this.blocks, blockId, this.blockIdCounter, position);
            if (result) {
                this.blockIdCounter = result.lastCellIdCounter + 1;
            }
        },

        removeTableColumn(blockId, colIndex) {
            removeTableColumn(this.blocks, blockId, colIndex);
        },

        mergeTableCells(blockId, startRow, startCol, endRow, endCol) {
            mergeTableCells(this.blocks, blockId, startRow, startCol, endRow, endCol);
        },

        unmergeTableCells(blockId, row, col) {
            unmergeTableCells(this.blocks, blockId, row, col);
        },

        updateTableCellContent(blockId, cellId, content) {
            updateTableCellContent(this.blocks, blockId, cellId, content);
        },

        toggleTableHeader(blockId) {
            toggleTableHeader(this.blocks, blockId);
        },

        toggleTableFooter(blockId) {
            toggleTableFooter(this.blocks, blockId);
        },

        getSelectedTableCell() {
            const selection = window.getSelection();
            if (selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                let cell = range.commonAncestorContainer;
                while (cell && cell.nodeName !== 'TD' && cell.nodeName !== 'TH') {
                    cell = cell.parentNode;
                }
                if (cell) {
                    return {
                        cell: cell,
                        rowIndex: cell.parentNode.rowIndex,
                        colIndex: cell.cellIndex
                    };
                }
            }
            return null;
        },

        // Theme Management Functions
        loadThemes() {
            this.themes = getAllThemesUtil();
        },

        openSaveThemeModal() {
            this.newThemeName = '';
            this.saveThemeError = null;
            this.showSaveThemeModal = true;
        },

        closeSaveThemeModal() {
            this.showSaveThemeModal = false;
            this.newThemeName = '';
            this.saveThemeError = null;
        },

        saveTheme() {
            if (!this.newThemeName || !this.newThemeName.trim()) {
                this.saveThemeError = 'Bitte gib einen Theme-Namen ein.';
                return;
            }

            try {
                saveThemeUtil(this.newThemeName.trim(), this.blocks);
                this.loadThemes(); // Aktualisiere Themes-Liste
                this.closeSaveThemeModal();
                this.showNotification(`Theme "${this.newThemeName.trim()}" erfolgreich gespeichert!`, 'success');
            } catch (error) {
                this.saveThemeError = error.message || 'Fehler beim Speichern des Themes.';
                this.showNotification('Fehler beim Speichern des Themes.', 'error');
            }
        },

        async loadTheme(themeName) {
            if (!confirm(`Möchten Sie das Theme "${themeName}" laden? Alle aktuellen Änderungen gehen verloren.`)) {
                return;
            }

            try {
                const updateCounter = (newCounter) => {
                    this.blockIdCounter = newCounter;
                };
                
                const result = await loadThemeUtil(
                    themeName,
                    this.blocks,
                    this.blockIdCounter,
                    this.$nextTick.bind(this),
                    initAllBlockContents,
                    updateCounter
                );
                
                if (result.blocks) {
                    this.selectedBlockId = null;
                    this.blockIdCounter = result.blockIdCounter;
                    this.showNotification(`Theme "${themeName}" erfolgreich geladen!`, 'success');
                }
            } catch (error) {
                this.showNotification('Fehler beim Laden des Themes: ' + error.message, 'error');
            }
        },

        deleteTheme(themeName) {
            if (!confirm(`Möchten Sie das Theme "${themeName}" wirklich löschen?\n\nHinweis: Die JSON-Datei im themes Ordner muss manuell gelöscht werden.`)) {
                return;
            }

            try {
                const deleted = deleteThemeUtil(themeName);
                if (deleted) {
                    this.loadThemes(); // Aktualisiere Themes-Liste
                    this.showNotification(`Theme "${themeName}" erfolgreich gelöscht!`, 'success');
                } else {
                    this.showNotification(`Theme "${themeName}" konnte nicht gefunden werden.`, 'error');
                }
            } catch (error) {
                this.showNotification('Fehler beim Löschen des Themes: ' + error.message, 'error');
            }
        },

        openEditThemeModal(themeName) {
            this.editThemeOriginalName = themeName;
            this.editThemeName = themeName;
            this.editThemeError = null;
            this.showEditThemeModal = true;
        },

        closeEditThemeModal() {
            this.showEditThemeModal = false;
            this.editThemeName = '';
            this.editThemeOriginalName = '';
            this.editThemeError = null;
        },

        updateTheme() {
            if (!this.editThemeName || !this.editThemeName.trim()) {
                this.editThemeError = 'Bitte gib einen Theme-Namen ein.';
                return;
            }

            if (this.editThemeName.trim() === this.editThemeOriginalName) {
                this.closeEditThemeModal();
                return;
            }

            try {
                updateThemeUtil(this.editThemeOriginalName, this.editThemeName.trim());
                this.loadThemes(); // Aktualisiere Themes-Liste
                this.closeEditThemeModal();
                this.showNotification(`Theme erfolgreich umbenannt zu "${this.editThemeName.trim()}"!`, 'success');
            } catch (error) {
                this.editThemeError = error.message || 'Fehler beim Umbenennen des Themes.';
                this.showNotification('Fehler beim Bearbeiten des Themes.', 'error');
            }
        },

        openImportThemeModal() {
            this.showImportThemeModal = true;
        },

        closeImportThemeModal() {
            this.showImportThemeModal = false;
        },

        async handleThemeFileImport(event) {
            const file = event.target.files[0];
            if (!file) {
                return;
            }

            if (!file.name.endsWith('.json')) {
                alert('Bitte wählen Sie eine JSON-Datei aus.');
                return;
            }

            try {
                const { themeData, blocks } = await importThemeFromFileUtil(file);
                this.loadThemes(); // Aktualisiere Themes-Liste
                this.closeImportThemeModal();
                this.showNotification(`Theme "${themeData.name}" erfolgreich importiert!`, 'success');
                
                if (confirm('Theme jetzt laden?')) {
                    await this.loadTheme(themeData.name);
                }
            } catch (error) {
                this.showNotification('Fehler beim Importieren des Themes: ' + error.message, 'error');
            }
            
            // Reset file input
            event.target.value = '';
        },

        /**
         * Zeigt eine Notification-Nachricht an
         * @param {string} message - Die Nachricht (kann auch HTML enthalten)
         * @param {string} type - Der Typ: 'success', 'error', 'info', 'warning'
         * @param {number} duration - Dauer in Millisekunden bis zum automatischen Ausblenden (Standard: 3000, 0 = kein automatisches Ausblenden)
         * 
         * Beispiele:
         * this.showNotification('Erfolgreich gespeichert!', 'success');
         * this.showNotification('Fehler beim Speichern', 'error', 5000);
         * this.showNotification('Bitte beachten Sie...', 'warning');
         * this.showNotification('Information: Neue Version verfügbar', 'info');
         * this.showNotification('<strong>Wichtig:</strong> Bitte prüfen Sie die Einstellungen', 'warning', 0); // Kein automatisches Ausblenden
         */
        showNotification(message, type = 'success', duration = 3000) {
            // Validiere Typ
            const validTypes = ['success', 'error', 'info', 'warning'];
            if (!validTypes.includes(type)) {
                console.warn(`Ungültiger Notification-Typ: ${type}. Verwende 'success' als Standard.`);
                type = 'success';
            }
            
            // Setze Notification-Daten
            this.notification.message = message;
            this.notification.type = type;
            this.notification.duration = duration;
            this.notification.show = true;
            
            // Automatisch nach angegebener Zeit ausblenden (wenn duration > 0)
            if (duration > 0) {
                // Clear existing timeout if any
                if (this.notificationTimeout) {
                    clearTimeout(this.notificationTimeout);
                }
                
                this.notificationTimeout = setTimeout(() => {
                    this.notification.show = false;
                    this.notificationTimeout = null;
                }, duration);
            }
        },

        hideNotification() {
            // Clear timeout wenn vorhanden
            if (this.notificationTimeout) {
                clearTimeout(this.notificationTimeout);
                this.notificationTimeout = null;
            }
            this.notification.show = false;
        },

        updateLinkText(blockId, linkText) {
            updateLinkTextUtil(this.blocks, blockId, linkText);
        },

        updateLinkUrl(blockId, linkUrl) {
            updateLinkUrlUtil(this.blocks, blockId, linkUrl);
        },

        openLinkSettingsModal(blockId) {
            const { block } = this.findBlockById(blockId);
            if (block && block.type === 'link') {
                this.linkSettingsBlockId = blockId;
                this.linkSettingsText = block.linkText || '';
                this.linkSettingsUrl = block.linkUrl || '';
                this.showLinkSettingsModal = true;
            }
        },

        closeLinkSettingsModal() {
            this.showLinkSettingsModal = false;
            this.linkSettingsBlockId = null;
            this.linkSettingsText = '';
            this.linkSettingsUrl = '';
        },

        saveLinkSettings() {
            if (!this.linkSettingsBlockId) return;
            
            updateLinkTextUtil(this.blocks, this.linkSettingsBlockId, this.linkSettingsText);
            updateLinkUrlUtil(this.blocks, this.linkSettingsBlockId, this.linkSettingsUrl);
            
            this.showNotification('Link-Einstellungen erfolgreich gespeichert!', 'success');
            this.closeLinkSettingsModal();
        },

        handleTextSelection() {
            const selection = window.getSelection();
            
            // Prüfe ob Text markiert ist
            if (!selection || selection.rangeCount === 0 || selection.toString().trim() === '') {
                this.showFloatingToolbar = false;
                return;
            }
            
            const range = selection.getRangeAt(0);
            const selectedText = selection.toString().trim();
            
            if (!selectedText) {
                this.showFloatingToolbar = false;
                return;
            }
            
            // Finde das contenteditable Element - gehe nach oben im DOM-Baum
            let editableElement = range.commonAncestorContainer;
            
            // Wenn es ein Text-Node ist, gehe zum Parent
            if (editableElement.nodeType === 3) {
                editableElement = editableElement.parentElement;
            }
            
            // Gehe nach oben bis zum contenteditable Element
            while (editableElement && editableElement.nodeType === 1) {
                if (editableElement.hasAttribute('contenteditable') && editableElement.getAttribute('contenteditable') === 'true') {
                    break;
                }
                editableElement = editableElement.parentElement;
            }
            
            if (!editableElement || !editableElement.hasAttribute('contenteditable')) {
                this.showFloatingToolbar = false;
                return;
            }
            
            // Finde Block-ID
            const blockElement = editableElement.closest('[data-block-id]');
            if (!blockElement) {
                this.showFloatingToolbar = false;
                return;
            }
            
            const blockId = blockElement.getAttribute('data-block-id');
            const { block } = this.findBlockById(blockId);
            
            // Zeige Toolbar nur für Text-Blöcke (nicht Code, Table, Divider, Link)
            if (!block || block.type === 'code' || block.type === 'table' || block.type === 'divider' || block.type === 'link') {
                this.showFloatingToolbar = false;
                return;
            }
            
            // Prüfe ob Selektion einen Link enthält
            let linkInSelection = null;
            try {
                const anchorNode = selection.anchorNode;
                if (anchorNode) {
                    let parent = anchorNode.nodeType === 3 ? anchorNode.parentElement : anchorNode;
                    while (parent && parent !== blockElement) {
                        if (parent.tagName === 'A' && parent.hasAttribute('href')) {
                            linkInSelection = parent;
                            break;
                        }
                        parent = parent.parentElement;
                    }
                }
            } catch (e) {
                // Ignoriere Fehler
            }
            
            // Berechne Position der Toolbar
            const rect = range.getBoundingClientRect();
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
            
            this.floatingToolbarPosition = {
                top: rect.top + scrollTop - 50,
                left: rect.left + scrollLeft + (rect.width / 2)
            };
            
            // Speichere Range als Clone für spätere Verwendung
            this.selectedText = selectedText;
            this.selectedRange = range.cloneRange();
            this.selectedBlockId = blockId;
            
            // Wenn ein Link in der Selektion ist, öffne direkt Bearbeitung
            if (linkInSelection) {
                this.editLink(linkInSelection, blockElement);
            } else {
                this.showFloatingToolbar = true;
            }
        },

        applyTextFormat(format) {
            if (!this.selectedRange || !this.selectedBlockId) return;
            
            const element = document.querySelector(`[data-block-id="${this.selectedBlockId}"]`);
            if (!element) {
                this.showFloatingToolbar = false;
                return;
            }
            
            // Stelle Selektion wieder her
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(this.selectedRange);
            
            // Prüfe ob Formatierung bereits aktiv ist (Toggle-Verhalten)
            const isActive = document.queryCommandState(format);
            
            // Wende Formatierung an oder entferne sie
            if (isActive && format !== 'createLink') {
                // Entferne Formatierung
                document.execCommand(format, false, null);
            } else {
                // Wende Formatierung an
                document.execCommand(format, false, null);
            }
            
            // Aktualisiere Block-Inhalt
            this.$nextTick(() => {
                const { block } = this.findBlockById(this.selectedBlockId);
                if (block) {
                    this.updateBlockContent(this.selectedBlockId, element.innerHTML);
                }
            });
            
            // Verstecke Toolbar nach Formatierung
            this.showFloatingToolbar = false;
            this.selectedRange = null;
        },

        removeFormatting() {
            if (!this.selectedRange || !this.selectedBlockId) return;
            
            const element = document.querySelector(`[data-block-id="${this.selectedBlockId}"]`);
            if (!element) {
                this.showFloatingToolbar = false;
                return;
            }
            
            // Stelle Selektion wieder her
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(this.selectedRange);
            
            // Entferne alle Formatierungen
            document.execCommand('removeFormat', false, null);
            document.execCommand('unlink', false, null);
            
            // Aktualisiere Block-Inhalt
            this.$nextTick(() => {
                const { block } = this.findBlockById(this.selectedBlockId);
                if (block) {
                    this.updateBlockContent(this.selectedBlockId, element.innerHTML);
                }
            });
            
            this.showNotification('Formatierung entfernt', 'success');
            this.showFloatingToolbar = false;
            this.selectedRange = null;
        },

        editLink(linkElement, blockElement) {
            const blockId = blockElement.getAttribute('data-block-id');
            const href = linkElement.getAttribute('href') || '';
            const linkText = linkElement.textContent || '';
            
            // Speichere Referenzen
            this.editingLink = {
                element: linkElement,
                blockId: blockId,
                href: href,
                text: linkText
            };
            this.editingLinkElement = linkElement;
            
            // Öffne Modal mit aktuellen Werten
            this.linkInputUrl = href;
            this.selectedText = linkText;
            this.showLinkInputModal = true;
        },

        updateLink() {
            if (!this.editingLink || !this.linkInputUrl.trim()) {
                this.showNotification('Bitte geben Sie eine URL ein', 'warning');
                return;
            }
            
            const { element, blockId } = this.editingLink;
            
            // Aktualisiere Link-Attribut
            element.setAttribute('href', this.linkInputUrl);
            
            // Aktualisiere Block-Inhalt
            const blockElement = document.querySelector(`[data-block-id="${blockId}"]`);
            if (blockElement) {
                this.$nextTick(() => {
                    const { block } = this.findBlockById(blockId);
                    if (block) {
                        this.updateBlockContent(blockId, blockElement.innerHTML);
                    }
                });
            }
            
            this.showNotification('Link erfolgreich aktualisiert!', 'success');
            this.closeLinkInputModal();
            this.editingLink = null;
            this.editingLinkElement = null;
        },

        removeLink() {
            if (!this.editingLink) return;
            
            const { element, blockId } = this.editingLink;
            
            // Entferne Link, behalte Text
            const linkText = element.textContent;
            const textNode = document.createTextNode(linkText);
            element.parentNode.replaceChild(textNode, element);
            
            // Aktualisiere Block-Inhalt
            const blockElement = document.querySelector(`[data-block-id="${blockId}"]`);
            if (blockElement) {
                this.$nextTick(() => {
                    const { block } = this.findBlockById(blockId);
                    if (block) {
                        this.updateBlockContent(blockId, blockElement.innerHTML);
                    }
                });
            }
            
            this.showNotification('Link entfernt', 'success');
            this.closeLinkInputModal();
            this.editingLink = null;
            this.editingLinkElement = null;
        },

        openLinkInputForSelection() {
            if (!this.selectedRange || !this.selectedText) return;
            
            this.linkInputUrl = '';
            this.showLinkInputModal = true;
        },

        closeLinkInputModal() {
            this.showLinkInputModal = false;
            this.linkInputUrl = '';
            this.editingLink = null;
            this.editingLinkElement = null;
        },

        applyLinkToSelection() {
            // Wenn ein Link bearbeitet wird, aktualisiere ihn
            if (this.editingLink) {
                this.updateLink();
                return;
            }
            
            // Neuer Link für Selektion
            if (!this.selectedRange || !this.linkInputUrl.trim() || !this.selectedBlockId) {
                this.showNotification('Bitte geben Sie eine URL ein', 'warning');
                return;
            }
            
            const element = document.querySelector(`[data-block-id="${this.selectedBlockId}"]`);
            if (!element) {
                this.closeLinkInputModal();
                return;
            }
            
            // Stelle Selektion wieder her
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(this.selectedRange);
            
            // Prüfe ob bereits ein Link markiert ist
            const anchorNode = selection.anchorNode;
            let linkElement = null;
            if (anchorNode) {
                let parent = anchorNode.parentElement;
                while (parent && parent !== element) {
                    if (parent.tagName === 'A') {
                        linkElement = parent;
                        break;
                    }
                    parent = parent.parentElement;
                }
            }
            
            if (linkElement) {
                // Aktualisiere bestehenden Link
                linkElement.setAttribute('href', this.linkInputUrl);
            } else {
                // Erstelle neuen Link
                document.execCommand('createLink', false, this.linkInputUrl);
            }
            
            // Aktualisiere Block-Inhalt
            this.$nextTick(() => {
                const { block } = this.findBlockById(this.selectedBlockId);
                if (block) {
                    this.updateBlockContent(this.selectedBlockId, element.innerHTML);
                }
            });
            
            this.showNotification('Link erfolgreich hinzugefügt!', 'success');
            this.closeLinkInputModal();
            this.showFloatingToolbar = false;
            this.selectedRange = null;
        },

        applyTextAlignment(blockId, alignment) {
            const { block } = this.findBlockById(blockId);
            if (!block) return;
            
            // Entferne vorhandene Text-Ausrichtung-Klassen
            const alignmentClasses = ['text-left', 'text-center', 'text-right', 'text-justify'];
            let currentClasses = (block.classes || '').split(' ').filter(c => !alignmentClasses.includes(c));
            
            // Füge neue Ausrichtung hinzu
            currentClasses.push(`text-${alignment}`);
            
            this.updateBlockClasses(blockId, currentClasses.join(' '));
            this.showNotification(`Text-Ausrichtung auf ${alignment === 'left' ? 'links' : alignment === 'center' ? 'zentriert' : alignment === 'right' ? 'rechts' : 'bündig'} gesetzt`, 'success');
        }
    }
}

// Registriere die Komponente global für Alpine.js
window.blockEditor = blockEditor;



