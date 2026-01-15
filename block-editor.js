// Block Editor Komponente
import { Utils } from './components/utils.js';
import { BlockManagement } from './components/block-management.js';
import { ChildManagement } from './components/child-management.js';
import { DragDrop } from './components/drag-drop.js';
import { Storage } from './components/storage.js';
import { TableManagement } from './components/table-management.js';
import { ChecklistManagement } from './components/checklist-management.js';
import { BLOCK_TYPES, BlockTypes } from './components/block-types.js';
import { renderJSONBlocks } from './components/json-renderer.js';
import { getBlockComponent } from './components/blocks/index.js';
// Template-System Import
import { getAllTemplates } from './components/templates/index.js';

function blockEditor() {
    return {
        blocks: [],
        selectedBlockId: null,
        draggingBlockId: null,
        showToolbar: false,
        showThemeDropdown: false,
        blockIdCounter: 0,
        dragStartIndex: null,
        dragOverIndex: null,
        showSidebar: false,
        sidebarTab: 'blocks',
        blockSettingsCache: {}, // Cache für Block-Einstellungen HTML
        blockSettingsVersion: 0, // Version für Reaktivität
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
        showImageSettingsModal: false,
        imageSettingsBlockId: null,
        imageSettingsUrl: '',
        imageSettingsAlt: '',
        imageSettingsTitle: '',
        imageSettingsActiveTab: 'upload', // 'upload' oder 'url'
        showFloatingToolbar: false,
        floatingToolbarPosition: { top: 0, left: 0 },
        selectedText: '',
        selectedRange: null,
        // Einheitliches Link-Management-System
        showLinkModal: false,
        linkModal: {
            type: null, // 'block', 'selection', 'edit' - Art des Links
            blockId: null, // Block-ID (für Link-Blocks)
            url: '', // Link-URL
            target: '_self', // Link-Target ('_self', '_blank', etc.)
            text: '', // Link-Text
            element: null, // DOM-Element (für Edit-Modus)
            range: null // Selection-Range (für Selection-Modus)
        },
        newThemeName: '',
        editThemeName: '',
        editThemeOriginalName: '',
        saveThemeError: null,
        editThemeError: null,
        themes: [],
        childBlockTypes: BLOCK_TYPES,
        notification: {
            show: false,
            message: '',
            type: 'success', // success, error, info, warning
            duration: 3000 // Automatisches Ausblenden in Millisekunden (0 = kein automatisches Ausblenden)
        },
        notificationTimeout: null, // Timeout-Referenz für automatisches Ausblenden
        showConfirmModal: false,
        confirmModal: {
            title: '',
            message: '',
            onConfirm: null,
            onCancel: null,
            onExtend: null, // Neue Option für "Erweitern"
            showExtend: false, // Zeigt ob "Erweitern" Button angezeigt werden soll
            showLinkFollow: false, // Zeigt ob "Link folgen" und "Bearbeiten" Buttons angezeigt werden sollen
            linkFollowUrl: null, // URL für Link-Follow
            linkFollowTarget: '_self' // Target für Link-Follow
        },
        // Performance-Optimierungen
        textSelectionTimeout: null, // Debounce-Timeout für Text-Selektion
        elementCache: new Map(), // Cache für DOM-Elemente
        eventListeners: [], // Array für Event Listener Cleanup
        // Templates für HTML-Komponenten
        templates: null, // Wird in init() geladen
        // Performance: Debouncing für Updates
        updateBlockContentTimeouts: new Map(), // Debounce-Timeouts pro Block
        validateJSONTimeout: null, // Debounce-Timeout für JSON-Validierung
        // Performance: Caching für Rendering
        renderBlockCache: new Map(), // Cache für gerenderte Blöcke (pro Block-ID)
        renderChildCache: new Map(), // Cache für gerenderte Child-Blöcke (pro Block-ID)
        // Performance: JSON Display Cache
        jsonDisplayCache: '', // Gecachter JSON-String für Debug-Display
        jsonDisplayTimeout: null, // Debounce-Timeout für JSON-Display
        jsonDisplayHash: '', // Hash der Blöcke für Change-Detection
        // Performance: Block-Lookup Cache
        blockLookupCache: new Map(), // Cache für findBlockById Ergebnisse
        blockLookupCacheVersion: 0, // Version für Cache-Invalidierung

        init() {
            // Lade Templates beim Initialisieren
            try {
                this.templates = getAllTemplates();
            } catch (error) {
                console.warn('Fehler beim Laden der Templates:', error);
                this.templates = {};
            }
            // Stelle sicher, dass Column-Blöcke die richtige Anzahl von Spalten haben (falls Blöcke bereits vorhanden sind)
            BlockManagement.ensureColumnStructure(this.blocks);
            
            // Start mit einem leeren Paragraph
            if (this.blocks.length === 0) {
                this.addBlock('paragraph');
            }
            // Lade Themes beim Initialisieren (async, aber ohne await)
            this.loadThemes().catch(err => console.error('Fehler beim Laden der Themes:', err));
            // Initialisiere Block-Inhalte nach dem Rendering
            this.$nextTick(() => {
                this.initAllBlockContents();
            });
            
            // Optimierte Event Listener mit Debouncing für Text-Selektion
            const handleTextSelectionDebounced = () => {
                if (this.textSelectionTimeout) {
                    clearTimeout(this.textSelectionTimeout);
                }
                this.textSelectionTimeout = setTimeout(() => {
                    this.handleTextSelection();
                }, 10);
            };
            
            const mouseupHandler = () => handleTextSelectionDebounced();
            const keyupHandler = () => handleTextSelectionDebounced();
            
            document.addEventListener('mouseup', mouseupHandler);
            document.addEventListener('keyup', keyupHandler);
            
            // Speichere Event Listener für Cleanup
            this.eventListeners.push(
                { element: document, event: 'mouseup', handler: mouseupHandler },
                { element: document, event: 'keyup', handler: keyupHandler }
            );
            
            // Event Listener für Rechtsklick (Context-Menu)
            const contextmenuHandler = (e) => {
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
                            if (block && block.type !== 'code' && block.type !== 'table' && block.type !== 'divider') {
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
            };
            
            document.addEventListener('contextmenu', contextmenuHandler);
            this.eventListeners.push({ element: document, event: 'contextmenu', handler: contextmenuHandler });
            
            // Event Listener für Link-Klicks (Bearbeitung)
            const clickHandler = (e) => {
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
                        !e.target.closest('[x-show*="showLinkModal"]')) {
                        this.showFloatingToolbar = false;
                    }
                }
            };
            
            document.addEventListener('click', clickHandler);
            this.eventListeners.push({ element: document, event: 'click', handler: clickHandler });
        },
        
        // Cleanup-Funktion für Event Listener (wird von Alpine.js automatisch aufgerufen)
        destroy() {
            // Cleanup Event Listener
            this.eventListeners.forEach(({ element, event, handler }) => {
                element.removeEventListener(event, handler);
            });
            this.eventListeners = [];
            
            // Cleanup Timeouts
            if (this.textSelectionTimeout) {
                clearTimeout(this.textSelectionTimeout);
                this.textSelectionTimeout = null;
            }
            if (this.notificationTimeout) {
                clearTimeout(this.notificationTimeout);
                this.notificationTimeout = null;
            }
            if (this.updateBlockContentTimeouts.size > 0) {
                this.updateBlockContentTimeouts.forEach(timeoutId => {
                    clearTimeout(timeoutId);
                });
                this.updateBlockContentTimeouts.clear();
            }
            if (this.validateJSONTimeout) {
                clearTimeout(this.validateJSONTimeout);
                this.validateJSONTimeout = null;
            }
            if (this.jsonDisplayTimeout) {
                clearTimeout(this.jsonDisplayTimeout);
                this.jsonDisplayTimeout = null;
            }
            
            // Clear Element Cache
            this.elementCache.clear();
            // Clear Render Cache
            this.renderBlockCache.clear();
            this.renderChildCache.clear();
            // Clear Block Lookup Cache
            this.blockLookupCache.clear();
        },
        
        // Optimierte Helper-Funktion für DOM-Element-Abfragen mit Caching
        getBlockElement(blockId) {
            if (!blockId) return null;
            
            // Prüfe Cache
            if (this.elementCache.has(blockId)) {
                const cached = this.elementCache.get(blockId);
                // Prüfe ob Element noch im DOM ist
                if (document.contains(cached)) {
                    return cached;
                } else {
                    // Element nicht mehr im DOM, entferne aus Cache
                    this.elementCache.delete(blockId);
                }
            }
            
            // Element nicht im Cache, suche im DOM
            const element = document.querySelector(`[data-block-id="${blockId}"]`);
            if (element) {
                this.elementCache.set(blockId, element);
            }
            return element;
        },
        
        // Cache invalidieren für einen Block
        invalidateBlockCache(blockId) {
            if (blockId) {
                this.elementCache.delete(blockId);
            }
        },
        
        // Cache komplett leeren (z.B. nach größeren DOM-Änderungen)
        clearElementCache() {
            this.elementCache.clear();
        },
        
        /**
         * Erstellt einen einfachen Hash für Change-Detection
         * @param {Array} blocks - Die Blöcke
         * @returns {string} Hash-String
         */
        getBlocksHash(blocks) {
            // Einfacher Hash basierend auf Anzahl, IDs und Content-Längen
            if (!blocks || blocks.length === 0) return 'empty';
            
            let hash = `${blocks.length}_`;
            blocks.forEach(block => {
                if (block && block.id) {
                    hash += `${block.id}_${block.type}_`;
                    if (block.content) hash += `${block.content.length}_`;
                    if (block.children && block.children.length > 0) {
                        hash += `c${block.children.length}_`;
                    }
                }
            });
            return hash;
        },
        
        /**
         * Gibt den gecachten JSON-String für das Debug-Display zurück
         * Wird debounced aktualisiert für bessere Performance
         * @returns {string} JSON-String
         */
        getJSONDisplay() {
            // Prüfe ob sich die Blöcke geändert haben
            const currentHash = this.getBlocksHash(this.blocks);
            
            // Wenn Hash gleich ist und Cache vorhanden, gib Cache zurück
            if (currentHash === this.jsonDisplayHash && this.jsonDisplayCache) {
                return this.jsonDisplayCache;
            }
            
            // Wenn bereits ein Timeout läuft, gib aktuellen Cache zurück
            if (this.jsonDisplayTimeout) {
                return this.jsonDisplayCache || '{}';
            }
            
            // Aktualisiere Cache asynchron (debounced)
            this.jsonDisplayTimeout = setTimeout(() => {
                try {
                    this.jsonDisplayCache = JSON.stringify(this.blocks, null, 2);
                    this.jsonDisplayHash = this.getBlocksHash(this.blocks);
                } catch (error) {
                    this.jsonDisplayCache = '{}';
                    this.jsonDisplayHash = '';
                }
                this.jsonDisplayTimeout = null;
            }, 500); // 500ms Debounce für JSON-Display
            
            // Gib aktuellen Cache zurück (oder leeren String beim ersten Aufruf)
            return this.jsonDisplayCache || '{}';
        },
        
        /**
         * Invalidiert den JSON-Display-Cache
         */
        invalidateJSONDisplayCache() {
            if (this.jsonDisplayTimeout) {
                clearTimeout(this.jsonDisplayTimeout);
                this.jsonDisplayTimeout = null;
            }
            this.jsonDisplayCache = '';
            this.jsonDisplayHash = '';
        },

        initAllBlockContents() {
            Utils.initAllBlockContents(this.blocks);
        },

        initBlockContent(element, block, isTextContent = false) {
            if (!element || !block) return;
            try {
                Utils.initBlockContent(element, block, isTextContent);
            } catch (error) {
                console.warn('Fehler beim Initialisieren des Block-Inhalts:', error);
            }
        },

        initTableCellContent(element, cell) {
            // Prüfe ob Element und Cell existieren
            if (!element || !cell) return;
            
            // Nur initialisieren wenn Element leer ist und Cell Inhalt hat
            if (!element.textContent && cell.content) {
                try {
                    element.innerHTML = cell.content;
                    // Cursor ans Ende setzen
                    this.$nextTick(() => {
                        try {
                            const range = document.createRange();
                            const sel = window.getSelection();
                            if (sel && element) {
                                range.selectNodeContents(element);
                                range.collapse(false);
                                sel.removeAllRanges();
                                sel.addRange(range);
                            }
                        } catch (error) {
                            // Ignoriere Fehler beim Setzen des Cursors
                        }
                    });
                } catch (error) {
                    console.warn('Fehler beim Initialisieren der Tabellenzelle:', error);
                }
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
        
        /**
         * Rendert die Einstellungen für einen Block aus der Komponente
         * @param {object} block - Der Block-Objekt
         * @returns {string} HTML-String für die Einstellungen
         */
        renderBlockSettings(block) {
            if (!block || !block.type) {
                return '';
            }
            
            // Erstelle einen Cache-Key basierend auf Block-ID, Typ und relevanten Daten
            const cacheKey = this.getBlockSettingsCacheKey(block);
            
            // Prüfe ob Cache vorhanden ist (Version wird in x-effect geprüft)
            const cached = this.blockSettingsCache[cacheKey];
            if (cached) {
                return cached.html;
            }
            
            const component = getBlockComponent(block.type);
            if (component && component.getSettingsHTML) {
                const settingsHTML = component.getSettingsHTML(block, {
                    selectedBlockId: this.selectedBlockId,
                    draggingBlockId: this.draggingBlockId,
                    childBlockTypes: this.childBlockTypes,
                    index: this.blocks.findIndex(b => b.id === block.id)
                });
                
                // Speichere im Cache mit Version
                this.blockSettingsCache[cacheKey] = {
                    html: settingsHTML,
                    version: this.blockSettingsVersion
                };
                return settingsHTML;
            }
            return '';
        },
        
        /**
         * Erstellt einen Cache-Key für Block-Einstellungen
         * @param {object} block - Der Block-Objekt
         * @returns {string} Cache-Key
         */
        getBlockSettingsCacheKey(block) {
            if (!block || !block.id) {
                return '';
            }
            
            // Erstelle Key basierend auf Block-ID, Typ und relevanten Daten
            let key = `${block.id}_${block.type}`;
            
            // Für Tabellen: Füge tableData-Info hinzu
            if (block.type === 'table' && block.tableData) {
                const rowCount = block.tableData.cells?.length || 0;
                const colCount = block.tableData.cells?.[0]?.length || 0;
                const hasHeader = block.tableData.hasHeader || false;
                const hasFooter = block.tableData.hasFooter || false;
                key += `_${rowCount}_${colCount}_${hasHeader}_${hasFooter}`;
            }
            
            // Für Checklist: Füge Items-Count hinzu
            if (block.type === 'checklist' && block.checklistData) {
                const itemsCount = block.checklistData.items?.length || 0;
                key += `_${itemsCount}`;
            }
            
            return key;
        },
        
        /**
         * Invalidiert den Cache für einen Block
         * @param {string} blockId - Die Block-ID
         */
        invalidateBlockSettingsCache(blockId) {
            if (!blockId) {
                // Lösche gesamten Cache
                this.blockSettingsCache = {};
                this.blockSettingsVersion++;
                return;
            }
            
            // Lösche nur Einträge für diesen Block
            Object.keys(this.blockSettingsCache).forEach(key => {
                if (key.startsWith(`${blockId}_`)) {
                    delete this.blockSettingsCache[key];
                }
            });
            
            // Erhöhe Version für Reaktivität (nur wenn Block gefunden wurde)
            const block = this.blocks.find(b => b.id === blockId) || 
                         this.getAllBlocks().find(b => b.id === blockId);
            if (block) {
                this.blockSettingsVersion++;
            }
        },
        
        /**
         * Aktualisiert die Block-Einstellungen reaktiv
         * @param {object} block - Der Block-Objekt
         * @param {HTMLElement} element - Das DOM-Element
         */
        updateBlockSettingsReactive(block, element) {
            if (!block || !block.id || this.selectedBlockId !== block.id) {
                return;
            }
            
            const cacheKey = this.getBlockSettingsCacheKey(block);
            const cached = this.blockSettingsCache[cacheKey];
            const currentVersion = this.blockSettingsVersion;
            
            if (!cached || cached.version !== currentVersion) {
                this.$nextTick(() => {
                    const newHTML = this.renderBlockSettings(block);
                    if (element && element.innerHTML !== newHTML) {
                        element.innerHTML = newHTML;
                    }
                });
            }
        },

        addBlock(type, content = '') {
            this.blockIdCounter++;
            const block = BlockManagement.addBlock(this.blocks, this.selectedBlockId, this.blockIdCounter, type, content);
            this.selectedBlockId = block.id;
            this.showToolbar = false;
            this.showThemeDropdown = false;
            
            // Stelle sicher, dass Column-Blöcke die richtige Anzahl von Spalten haben
            BlockManagement.ensureColumnStructure(this.blocks);
            
            // Invalidiere Caches (neuer Block hinzugefügt)
            this.invalidateJSONDisplayCache();
            this.invalidateBlockLookupCache();
            
            // Focus auf den neuen Block
            this.$nextTick(() => {
                const element = this.getBlockElement(block.id);
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

        loadThemeFromToolbar(themeName) {
            this.showLoadThemeConfirm(themeName);
        },

        addBlockAfter(blockId, type = 'paragraph') {
            this.blockIdCounter++;
            const block = BlockManagement.addBlockAfter(this.blocks, blockId, this.blockIdCounter, type);
            this.selectedBlockId = block.id;
            
            this.$nextTick(() => {
                const element = this.getBlockElement(block.id);
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
            const { block } = this.findBlockById(blockId);
            if (!block) {
                return;
            }
            
            // Content sofort aktualisieren (DOM ist bereits durch contenteditable geändert)
            block.content = content;
            
            // Debounce: nur JSON-Cache aktualisieren, kein Re-Render während des Tippens
            if (this.updateBlockContentTimeouts.has(blockId)) {
                clearTimeout(this.updateBlockContentTimeouts.get(blockId));
            }
            
            const timeoutId = setTimeout(() => {
                this.invalidateJSONDisplayCache();
                this.updateBlockContentTimeouts.delete(blockId);
            }, 400);
            
            this.updateBlockContentTimeouts.set(blockId, timeoutId);
        },

        commitBlockContent(blockId, content = null) {
            const { block } = this.findBlockById(blockId);
            if (!block) {
                return;
            }

            if (content !== null && content !== undefined) {
                block.content = content;
            }

            if (this.updateBlockContentTimeouts.has(blockId)) {
                clearTimeout(this.updateBlockContentTimeouts.get(blockId));
                this.updateBlockContentTimeouts.delete(blockId);
            }

            block.updatedAt = new Date().toISOString();
            this.invalidateRenderCache(blockId);
            this.invalidateJSONDisplayCache();
        },

        deleteBlock(blockId) {
            const result = BlockManagement.deleteBlock(this.blocks, blockId);
            if (result.deleted) {
                // Invalidiere Cache für gelöschten Block
                this.invalidateBlockCache(blockId);
                this.invalidateRenderCache(blockId);
                this.invalidateJSONDisplayCache();
                this.invalidateBlockLookupCache();
                
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
            BlockManagement.moveBlock(this.blocks, index, direction);
            // Invalidiere JSON-Display-Cache (Reihenfolge hat sich geändert)
            this.invalidateJSONDisplayCache();
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

        handleDragStart(event, index, columnIndex = null, childIndex = null) {
            // If columnIndex is provided, we're dealing with column children
            if (columnIndex !== null && columnIndex !== undefined) {
                const block = this.blocks[index];
                if (block && block.children && block.children[columnIndex]) {
                    const columnBlock = block.children[columnIndex];
                    if (columnBlock.children && columnBlock.children[childIndex]) {
                        const childBlock = columnBlock.children[childIndex];
                        this.dragStartIndex = { 
                            type: 'columnChild', 
                            parentIndex: index, 
                            columnIndex: columnIndex, 
                            childIndex: childIndex 
                        };
                        this.draggingBlockId = childBlock.id;
                        event.dataTransfer.effectAllowed = 'move';
                        event.dataTransfer.setData('text/html', event.target.outerHTML);
                        return;
                    }
                }
            }
            // Fallback to original logic
            const result = DragDrop.handleDragStart(event, this.blocks, index, childIndex);
            this.dragStartIndex = result.dragStartIndex;
            this.draggingBlockId = result.draggingBlockId;
        },

        handleDragOver(event, index, columnIndex = null, childIndex = null) {
            // If columnIndex is provided, we're dealing with column children
            if (columnIndex !== null && columnIndex !== undefined) {
                this.dragOverIndex = { 
                    type: 'columnChild', 
                    parentIndex: index, 
                    columnIndex: columnIndex, 
                    childIndex: childIndex 
                };
                event.dataTransfer.dropEffect = 'move';
                return;
            }
            // Fallback to original logic
            this.dragOverIndex = DragDrop.handleDragOver(event, index, childIndex);
        },

        handleDrop(event, dropIndex, dropColumnIndex = null, dropChildIndex = null) {
            event.preventDefault();
            
            if (this.dragStartIndex === null) return;
            
            // Handle column child drag & drop
            if (this.dragStartIndex.type === 'columnChild') {
                const start = this.dragStartIndex;
                const parentBlock = this.blocks[start.parentIndex];
                
                if (parentBlock && parentBlock.children) {
                    const startColumn = parentBlock.children[start.columnIndex];
                    const dropColumn = dropColumnIndex !== null ? parentBlock.children[dropColumnIndex] : startColumn;
                    
                    if (startColumn && startColumn.children && dropColumn && dropColumn.children) {
                        const draggedChild = startColumn.children[start.childIndex];
                        
                        // Remove from start position
                        startColumn.children.splice(start.childIndex, 1);
                        
                        // Insert at drop position
                        if (dropChildIndex !== null && dropChildIndex !== undefined) {
                            let insertIndex = dropChildIndex;
                            // Adjust index if moving within same column and moving down
                            if (start.columnIndex === dropColumnIndex && start.childIndex < dropChildIndex) {
                                insertIndex = dropChildIndex - 1;
                            }
                            dropColumn.children.splice(insertIndex, 0, draggedChild);
                        } else {
                            // Append to end
                            dropColumn.children.push(draggedChild);
                        }
                        
                        parentBlock.updatedAt = new Date().toISOString();
                    }
                }
            } else {
                // Fallback to original logic
                DragDrop.handleDrop(event, this.blocks, this.dragStartIndex, dropIndex, dropChildIndex, dropColumnIndex, null);
            }
            
            this.dragStartIndex = null;
            this.dragOverIndex = null;
        },

        handleDragEnd() {
            this.draggingBlockId = null;
            this.dragStartIndex = null;
            this.dragOverIndex = null;
        },

        changeBlockType(blockId, newType) {
            BlockManagement.changeBlockType(this.blocks, blockId, newType, this.blockIdCounter);
            // Increment blockIdCounter if columns were created
            const columnCount = BlockTypes.getColumnCount(newType);
            if (columnCount > 0) {
                this.blockIdCounter += columnCount;
            }
            
            // Stelle sicher, dass Column-Blöcke die richtige Anzahl von Spalten haben
            BlockManagement.ensureColumnStructure(this.blocks);
            
            // Invalidiere Cache für diesen Block (DOM-Struktur hat sich geändert)
            this.invalidateBlockCache(blockId);
            this.invalidateRenderCache(blockId);
            this.invalidateJSONDisplayCache();
            
            // Focus auf den Block nach Typ-Änderung
            this.$nextTick(() => {
                const element = this.getBlockElement(blockId);
                if (element) {
                    element.focus();
                }
            });
        },
        
        // Helper-Funktion für x-init in HTML
        getColumnCountForBlock(blockType) {
            return BlockTypes.getColumnCount(blockType);
        },

        updateBlockStyle(blockId, style) {
            BlockManagement.updateBlockStyle(this.blocks, blockId, style);
        },

        clearBlockStyle(blockId) {
            BlockManagement.clearBlockStyle(this.blocks, blockId);
        },

        updateBlockClasses(blockId, classes) {
            BlockManagement.updateBlockClasses(this.blocks, blockId, classes);
        },

        clearBlockClasses(blockId) {
            BlockManagement.clearBlockClasses(this.blocks, blockId);
        },

        updateBlockHtmlId(blockId, htmlId) {
            BlockManagement.updateBlockHtmlId(this.blocks, blockId, htmlId);
        },

        clearBlockHtmlId(blockId) {
            BlockManagement.clearBlockHtmlId(this.blocks, blockId);
        },

        addChild(parentBlockId, childType) {
            this.blockIdCounter++;
            const childBlock = ChildManagement.addChild(this.blocks, parentBlockId, this.blockIdCounter, childType);
            if (childBlock) {
                // Stelle sicher, dass die Struktur korrekt ist (entfernt Children von nicht-Container-Blöcken)
                BlockManagement.ensureColumnStructure(this.blocks);
                
                // Invalidiere Render-Cache für Parent und JSON-Display
                this.invalidateRenderCache(parentBlockId);
                this.invalidateJSONDisplayCache();
                
                this.selectedBlockId = childBlock.id;
                
                this.$nextTick(() => {
                    const element = this.getBlockElement(childBlock.id);
                    if (element) {
                        element.focus();
                    }
                });
            }
        },

        addChildAfter(parentBlockId, childIndex, childType) {
            this.blockIdCounter++;
            const childBlock = ChildManagement.addChildAfter(this.blocks, parentBlockId, childIndex, this.blockIdCounter, childType);
            if (childBlock) {
                // Stelle sicher, dass die Struktur korrekt ist (entfernt Children von nicht-Container-Blöcken)
                BlockManagement.ensureColumnStructure(this.blocks);
                
                this.selectedBlockId = childBlock.id;
                
                this.$nextTick(() => {
                    const element = this.getBlockElement(childBlock.id);
                    if (element) {
                        element.focus();
                    }
                });
            }
        },

        removeChild(parentBlockId, childIndex) {
            ChildManagement.removeChild(this.blocks, parentBlockId, childIndex);
            // Invalidiere Render-Cache für Parent und JSON-Display
            this.invalidateRenderCache(parentBlockId);
            this.invalidateJSONDisplayCache();
        },

        removeChildFromColumn(parentBlockId, columnIndex, childIndex) {
            ChildManagement.removeChildFromColumn(this.blocks, parentBlockId, columnIndex, childIndex);
        },

        moveChildBlock(parentBlockId, childIndex, direction) {
            ChildManagement.moveChildBlock(this.blocks, parentBlockId, childIndex, direction);
        },

        addChildToColumn(parentBlockId, childType, columnIndex) {
            this.blockIdCounter++;
            const childBlock = ChildManagement.addChildToColumn(this.blocks, parentBlockId, this.blockIdCounter, childType, columnIndex);
            if (!childBlock) {
                this.blockIdCounter--; // Rollback if failed
                return;
            }
            if (childBlock) {
                // Stelle sicher, dass die Struktur korrekt ist (entfernt Children von nicht-Container-Blöcken)
                BlockManagement.ensureColumnStructure(this.blocks);
                
                this.selectedBlockId = childBlock.id;
                
                this.$nextTick(() => {
                    const element = this.getBlockElement(childBlock.id);
                    if (element) {
                        element.focus();
                    }
                });
            }
        },

        findBlockById(blockId) {
            if (!blockId) return { block: null, parent: null };
            
            // Prüfe Cache
            const cacheKey = `${blockId}_${this.blockLookupCacheVersion}`;
            if (this.blockLookupCache.has(cacheKey)) {
                return this.blockLookupCache.get(cacheKey);
            }
            
            // Suche Block
            const result = Utils.findBlockById(this.blocks, blockId);
            
            // Speichere im Cache (nur wenn Block gefunden wurde)
            if (result && result.block) {
                this.blockLookupCache.set(cacheKey, result);
                
                // Begrenze Cache-Größe (max 100 Einträge)
                if (this.blockLookupCache.size > 100) {
                    // Entferne älteste Einträge (einfache Strategie: lösche erste 20)
                    const keysToDelete = Array.from(this.blockLookupCache.keys()).slice(0, 20);
                    keysToDelete.forEach(key => this.blockLookupCache.delete(key));
                }
            }
            
            return result;
        },
        
        /**
         * Invalidiert den Block-Lookup-Cache
         */
        invalidateBlockLookupCache() {
            this.blockLookupCacheVersion++;
            // Optional: Cache komplett leeren wenn zu groß
            if (this.blockLookupCache.size > 50) {
                this.blockLookupCache.clear();
            }
        },
        
        /**
         * Performance: Gibt gefilterte Header-Rows für Tabellen zurück
         * Wird gecacht, um .filter() nicht bei jedem Re-Render auszuführen
         * @param {object} block - Der Tabellen-Block
         * @returns {Array} Gefilterte Header-Rows
         */
        getTableHeaderRows(block) {
            if (!block || !block.tableData || !block.tableData.cells) return [];
            return block.tableData.cells.filter(r => r && r[0] && r[0].isHeader);
        },
        
        /**
         * Performance: Gibt gefilterte Body-Rows für Tabellen zurück
         * Wird gecacht, um .filter() nicht bei jedem Re-Render auszuführen
         * @param {object} block - Der Tabellen-Block
         * @returns {Array} Gefilterte Body-Rows
         */
        getTableBodyRows(block) {
            if (!block || !block.tableData || !block.tableData.cells) return [];
            return block.tableData.cells.filter(r => r && r[0] && !r[0].isHeader && !r[0].isFooter);
        },
        
        /**
         * Performance: Gibt gefilterte Footer-Rows für Tabellen zurück
         * Wird gecacht, um .filter() nicht bei jedem Re-Render auszuführen
         * @param {object} block - Der Tabellen-Block
         * @returns {Array} Gefilterte Footer-Rows
         */
        getTableFooterRows(block) {
            if (!block || !block.tableData || !block.tableData.cells) return [];
            return block.tableData.cells.filter(r => r && r[0] && r[0].isFooter);
        },

        getAllBlocks() {
            return Utils.getAllBlocks(this.blocks);
        },

        saveToJSON() {
            Storage.saveToJSON(this.blocks);
            this.showNotification('Daten erfolgreich gespeichert!', 'success');
        },

        importJSON() {
            this.showImportModal = true;
            this.importJSONText = '';
            this.importJSONValid = false;
            this.importJSONError = null;
            this.importJSONPreview = null;
            if (window.modalHelpers) window.modalHelpers.openModal();
        },

        closeImportModal() {
            this.showImportModal = false;
            this.importJSONText = '';
            this.importJSONValid = false;
            this.importJSONError = null;
            this.importJSONPreview = null;
            if (window.modalHelpers) window.modalHelpers.closeModal();
        },

        validateImportJSON() {
            // Debounce für bessere Performance bei schnellen Eingaben
            if (this.validateJSONTimeout) {
                clearTimeout(this.validateJSONTimeout);
            }
            
            this.validateJSONTimeout = setTimeout(() => {
                this.importJSONError = null;
                this.importJSONValid = false;
                this.importJSONPreview = null;

                if (!this.importJSONText.trim()) {
                    this.validateJSONTimeout = null;
                    return;
                }

                try {
                    const parsed = JSON.parse(this.importJSONText);
                    
                    // Prüfe ob es ein Array ist
                    if (!Array.isArray(parsed)) {
                        this.importJSONError = 'JSON muss ein Array von Blöcken sein.';
                        this.validateJSONTimeout = null;
                        return;
                    }

                    // Prüfe ob Blöcke die erforderlichen Felder haben
                    if (parsed.length === 0) {
                        this.importJSONError = 'Das Array ist leer.';
                        this.validateJSONTimeout = null;
                        return;
                    }

                    // Validiere Block-Struktur
                    for (let i = 0; i < parsed.length; i++) {
                        const block = parsed[i];
                        if (!block.id || !block.type) {
                            this.importJSONError = `Block ${i + 1} fehlt 'id' oder 'type' Feld.`;
                            this.validateJSONTimeout = null;
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
                
                this.validateJSONTimeout = null;
            }, 300); // 300ms Debounce für JSON-Validierung
        },

        confirmImportJSON() {
            if (!this.importJSONValid || !this.importJSONText) {
                return;
            }

            const updateCounter = (newCounter) => {
                this.blockIdCounter = newCounter;
            };
            
            try {
                Storage.importJSON(
                    this.importJSONText,
                    this.blocks,
                    this.blockIdCounter,
                    this.$nextTick.bind(this),
                    Utils.initAllBlockContents,
                    updateCounter
                );
                
                const blockCount = this.importJSONPreview?.blockCount || 0;
                // Cache komplett leeren nach JSON-Import (DOM wurde komplett neu aufgebaut)
                this.clearElementCache();
                this.invalidateRenderCache(); // Invalidiere gesamten Render-Cache
                this.invalidateJSONDisplayCache();
                this.showNotification(`Erfolgreich ${blockCount} Block(s) importiert!`, 'success');
                this.closeImportModal();
            } catch (error) {
                this.importJSONError = error.message || 'Fehler beim Importieren der Daten.';
                this.showNotification('Fehler beim Importieren: ' + error.message, 'error');
            }
        },

        exportJSON() {
            const json = JSON.stringify(this.blocks, null, 2);
            this.exportJSONText = json;
            this.showExportModal = true;
            if (window.modalHelpers) window.modalHelpers.openModal();
        },

        closeExportModal() {
            this.showExportModal = false;
            this.exportJSONText = '';
            this.exportCopied = false;
            if (window.modalHelpers) window.modalHelpers.closeModal();
        },

        async copyExportJSON() {
            try {
                // Moderne Clipboard API verwenden falls verfügbar
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    await navigator.clipboard.writeText(this.exportJSONText);
                } else {
                    // Fallback für ältere Browser
                    this.$nextTick(() => {
                        const textarea = this.$refs?.exportJSONTextarea;
                        if (textarea) {
                            try {
                                textarea.select();
                                textarea.setSelectionRange(0, 99999);
                                document.execCommand('copy');
                            } catch (err) {
                                console.warn('Fehler beim Kopieren mit Fallback-Methode:', err);
                            }
                        }
                    });
                }
                
                // Erfolgsmeldung anzeigen
                this.exportCopied = true;
                setTimeout(() => {
                    this.exportCopied = false;
                }, 2000);
            } catch (err) {
                console.error('Fehler beim Kopieren:', err);
                this.showNotification('Fehler beim Kopieren. Bitte manuell kopieren.', 'error');
            }
        },

        downloadExportJSON() {
            Storage.exportJSON(this.blocks);
        },

        async copyJSONToClipboard() {
            try {
                // Stelle sicher, dass die Struktur korrekt ist
                BlockManagement.ensureColumnStructure(this.blocks);
                const json = JSON.stringify(this.blocks, null, 2);
                
                // Moderne Clipboard API verwenden falls verfügbar
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    await navigator.clipboard.writeText(json);
                    this.showNotification('wurde in Zwischenablage kopiert', 'success');
                } else {
                    // Fallback für ältere Browser
                    const textarea = document.createElement('textarea');
                    textarea.value = json;
                    textarea.style.position = 'fixed';
                    textarea.style.opacity = '0';
                    document.body.appendChild(textarea);
                    textarea.select();
                    textarea.setSelectionRange(0, 99999);
                    document.execCommand('copy');
                    document.body.removeChild(textarea);
                    this.showNotification('wurde in Zwischenablage kopiert', 'success');
                }
            } catch (err) {
                console.error('Fehler beim Kopieren:', err);
                this.showNotification('Fehler beim Kopieren in die Zwischenablage.', 'error');
            }
        },

        // Table Management Functions
        addTableRow(blockId, position = 'bottom') {
            const result = TableManagement.addTableRow(this.blocks, blockId, this.blockIdCounter, position);
            if (result) {
                this.blockIdCounter = result.lastCellIdCounter + 1;
                this.invalidateBlockSettingsCache(blockId);
            }
        },

        removeTableRow(blockId, rowIndex) {
            TableManagement.removeTableRow(this.blocks, blockId, rowIndex);
            this.invalidateBlockSettingsCache(blockId);
        },

        addTableColumn(blockId, position = 'right') {
            const result = TableManagement.addTableColumn(this.blocks, blockId, this.blockIdCounter, position);
            if (result) {
                this.blockIdCounter = result.lastCellIdCounter + 1;
                this.invalidateBlockSettingsCache(blockId);
            }
        },

        removeTableColumn(blockId, colIndex) {
            TableManagement.removeTableColumn(this.blocks, blockId, colIndex);
            this.invalidateBlockSettingsCache(blockId);
        },

        mergeTableCells(blockId, startRow, startCol, endRow, endCol) {
            TableManagement.mergeTableCells(this.blocks, blockId, startRow, startCol, endRow, endCol);
            this.invalidateBlockSettingsCache(blockId);
        },

        unmergeTableCells(blockId, row, col) {
            TableManagement.unmergeTableCells(this.blocks, blockId, row, col);
        },

        updateTableCellContent(blockId, cellId, content) {
            TableManagement.updateTableCellContent(this.blocks, blockId, cellId, content);
        },

        toggleTableHeader(blockId) {
            TableManagement.toggleTableHeader(this.blocks, blockId);
            this.invalidateBlockSettingsCache(blockId);
        },

        toggleTableFooter(blockId) {
            TableManagement.toggleTableFooter(this.blocks, blockId);
            this.invalidateBlockSettingsCache(blockId);
        },

        // Checklist Management Functions
        addChecklistItem(blockId, position = 'bottom') {
            const result = ChecklistManagement.addChecklistItem(this.blocks, blockId, this.blockIdCounter, position);
            if (result) {
                this.blockIdCounter = result.lastItemIdCounter + 1;
            }
        },

        removeChecklistItem(blockId, itemIndex) {
            ChecklistManagement.removeChecklistItem(this.blocks, blockId, itemIndex);
        },

        toggleChecklistItem(blockId, itemIndex) {
            ChecklistManagement.toggleChecklistItem(this.blocks, blockId, itemIndex);
        },

        updateChecklistItemText(blockId, itemId, text) {
            ChecklistManagement.updateChecklistItemText(this.blocks, blockId, itemId, text);
        },

        moveChecklistItemUp(blockId, itemIndex) {
            ChecklistManagement.moveChecklistItemUp(this.blocks, blockId, itemIndex);
        },

        moveChecklistItemDown(blockId, itemIndex) {
            ChecklistManagement.moveChecklistItemDown(this.blocks, blockId, itemIndex);
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
        async loadThemes() {
            this.themes = await Storage.getAllThemes();
        },

        openSaveThemeModal() {
            this.newThemeName = '';
            this.saveThemeError = null;
            this.showSaveThemeModal = true;
            if (window.modalHelpers) window.modalHelpers.openModal();
        },

        closeSaveThemeModal() {
            this.showSaveThemeModal = false;
            this.newThemeName = '';
            this.saveThemeError = null;
            if (window.modalHelpers) window.modalHelpers.closeModal();
        },

        async saveTheme() {
            if (!this.newThemeName || !this.newThemeName.trim()) {
                this.saveThemeError = 'Bitte gib einen Theme-Namen ein.';
                return;
            }

            try {
                const sanitizedName = this.newThemeName.trim().replace(/[^a-z0-9äöüß_-]/gi, '_').toLowerCase();
                const filename = `${sanitizedName}.json`;
                await Storage.saveTheme(this.newThemeName.trim(), this.blocks);
                await this.loadThemes(); // Aktualisiere Themes-Liste
                this.closeSaveThemeModal();
                
                // Prüfe ob File System Access API verfügbar ist
                if ('showDirectoryPicker' in window) {
                    this.showNotification(`Theme "${this.newThemeName.trim()}" erfolgreich im themes Ordner gespeichert!`, 'success');
                } else {
                    this.showNotification(`Theme "${this.newThemeName.trim()}" erfolgreich gespeichert!<br><small>Bitte verschieben Sie die heruntergeladene Datei "${filename}" in den Ordner "themes".</small>`, 'success', 5000);
                }
            } catch (error) {
                this.saveThemeError = error.message || 'Fehler beim Speichern des Themes.';
                this.showNotification('Fehler beim Speichern des Themes: ' + error.message, 'error');
            }
        },

        showLoadThemeConfirm(themeName) {
            this.confirmModal = {
                title: 'Theme laden',
                message: `Möchten Sie das Theme "${themeName}" laden?`,
                onConfirm: () => this.loadTheme(themeName),
                onCancel: () => this.closeConfirmModal(),
                onExtend: () => this.extendTheme(themeName),
                showExtend: true
            };
            this.showConfirmModal = true;
            if (window.modalHelpers) window.modalHelpers.openModal();
        },

        async extendTheme(themeName) {
            this.closeConfirmModal();

            try {
                // Lade Theme-Daten (verwende die gleiche Logik wie loadTheme)
                const themes = await Storage.getAllThemes();
                const theme = themes.find(t => t.name.toLowerCase() === themeName.toLowerCase());
                
                if (!theme) {
                    throw new Error(`Theme "${themeName}" nicht gefunden.`);
                }

                let parsedBlocks = null;

                // Versuche aus LocalStorage zu laden (ohne File System Access)
                if (theme.data && Array.isArray(theme.data)) {
                    parsedBlocks = theme.data;
                }
                
                // Fallback: Versuche aus Datei zu laden (ohne File System Access Dialog)
                if (!parsedBlocks && theme.filename) {
                    try {
                        const response = await fetch(`themes/${theme.filename}`);
                        if (response.ok) {
                            parsedBlocks = await response.json();
                        }
                    } catch (error) {
                        // Ignoriere Fetch-Fehler
                    }
                }
                
                if (!parsedBlocks) {
                    throw new Error(`Theme-Daten für "${themeName}" nicht verfügbar.`);
                }

                // Validiere Block-Struktur
                if (!Array.isArray(parsedBlocks)) {
                    throw new Error('Theme-Daten sind ungültig.');
                }

                // Berechne den maximalen Block-ID Counter für die neuen Blöcke
                let maxId = this.blockIdCounter;
                parsedBlocks.forEach(b => {
                    const match = b.id.match(/block-(\d+)-/);
                    if (match) {
                        const idNum = parseInt(match[1]);
                        if (idNum > maxId) {
                            maxId = idNum;
                        }
                    }
                });

                // Erstelle neue IDs für die hinzuzufügenden Blöcke
                const idOffset = maxId + 1;
                
                // Rekursive Funktion zum Aktualisieren aller Block-IDs
                const updateBlockIds = (block) => {
                    const match = block.id.match(/block-(\d+)-/);
                    if (match) {
                        const oldIdNum = parseInt(match[1]);
                        const newIdNum = oldIdNum + idOffset;
                        block.id = block.id.replace(/block-\d+-/, `block-${newIdNum}-`);
                    } else if (block.id.startsWith('col-')) {
                        // Column-IDs werden später durch ensureColumnStructure korrigiert
                        // Aber wir aktualisieren sie trotzdem, falls sie block- IDs enthalten
                        const colMatch = block.id.match(/block-(\d+)-/);
                        if (colMatch) {
                            const oldIdNum = parseInt(colMatch[1]);
                            const newIdNum = oldIdNum + idOffset;
                            block.id = block.id.replace(/block-\d+-/, `block-${newIdNum}-`);
                        }
                    } else {
                        this.blockIdCounter++;
                        block.id = `block-${this.blockIdCounter}-${Date.now()}`;
                    }
                    
                    // Rekursiv alle Children aktualisieren
                    if (block.children && Array.isArray(block.children)) {
                        block.children.forEach(child => {
                            updateBlockIds(child);
                        });
                    }
                };
                
                const newBlocks = parsedBlocks.map(block => {
                    const newBlock = JSON.parse(JSON.stringify(block)); // Deep clone
                    updateBlockIds(newBlock);
                    return newBlock;
                });

                // Rendere alle Blöcke aus dem JSON (zentrale Funktion)
                const renderedBlocks = renderJSONBlocks(newBlocks, this.blockIdCounter);

                // Füge die neuen Blöcke zu den bestehenden hinzu
                this.blocks.push(...renderedBlocks);
                this.blockIdCounter = maxId + idOffset;

                // Initialisiere die neuen Block-Inhalte
                this.$nextTick(() => {
                    Utils.initAllBlockContents(renderedBlocks);
                });

                this.showNotification(`Theme "${themeName}" erfolgreich hinzugefügt!`, 'success');
            } catch (error) {
                this.showNotification('Fehler beim Hinzufügen des Themes: ' + error.message, 'error');
            }
        },

        async loadTheme(themeName) {
            this.closeConfirmModal();
            
            try {
                const updateCounter = (newCounter) => {
                    this.blockIdCounter = newCounter;
                };
                
                await Storage.loadTheme(
                    themeName,
                    this.blocks,
                    this.blockIdCounter,
                    this.$nextTick.bind(this),
                    Utils.initAllBlockContents,
                    updateCounter
                );
                
                // Cache komplett leeren nach Theme-Laden (DOM wurde komplett neu aufgebaut)
                this.clearElementCache();
                this.selectedBlockId = null;
                
                this.showNotification(`Theme "${themeName}" erfolgreich geladen!`, 'success');
            } catch (error) {
                this.showNotification('Fehler beim Laden des Themes: ' + error.message, 'error');
            }
        },

        showDeleteThemeConfirm(themeName) {
            this.confirmModal = {
                title: 'Theme löschen',
                message: `Möchten Sie das Theme "${themeName}" wirklich löschen?`,
                onConfirm: () => this.deleteTheme(themeName),
                onCancel: () => this.closeConfirmModal()
            };
            this.showConfirmModal = true;
            if (window.modalHelpers) window.modalHelpers.openModal();
        },

        async deleteTheme(themeName) {
            this.closeConfirmModal();
            
            try {
                const deleted = await Storage.deleteTheme(themeName);
                if (deleted) {
                    await this.loadThemes(); // Aktualisiere Themes-Liste
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
            if (window.modalHelpers) window.modalHelpers.openModal();
        },

        closeEditThemeModal() {
            this.showEditThemeModal = false;
            this.editThemeName = '';
            this.editThemeOriginalName = '';
            this.editThemeError = null;
            if (window.modalHelpers) window.modalHelpers.closeModal();
        },

        async updateTheme() {
            if (!this.editThemeName || !this.editThemeName.trim()) {
                this.editThemeError = 'Bitte gib einen Theme-Namen ein.';
                return;
            }

            if (this.editThemeName.trim() === this.editThemeOriginalName) {
                this.closeEditThemeModal();
                return;
            }

            try {
                await Storage.updateTheme(this.editThemeOriginalName, this.editThemeName.trim());
                await this.loadThemes(); // Aktualisiere Themes-Liste
                this.closeEditThemeModal();
                this.showNotification(`Theme erfolgreich umbenannt zu "${this.editThemeName.trim()}"!`, 'success');
            } catch (error) {
                this.editThemeError = error.message || 'Fehler beim Umbenennen des Themes.';
                this.showNotification('Fehler beim Bearbeiten des Themes.', 'error');
            }
        },

        openImportThemeModal() {
            this.showImportThemeModal = true;
            if (window.modalHelpers) window.modalHelpers.openModal();
        },

        closeImportThemeModal() {
            this.showImportThemeModal = false;
            if (window.modalHelpers) window.modalHelpers.closeModal();
        },

        async handleThemeFileImport(event) {
            const file = event.target.files[0];
            if (!file) {
                return;
            }

            if (!file.name.endsWith('.json')) {
                this.showNotification('Bitte wählen Sie eine JSON-Datei aus.', 'warning');
                return;
            }

            try {
                const { themeData, blocks } = await Storage.importThemeFromFile(file);
                await this.loadThemes(); // Aktualisiere Themes-Liste
                this.closeImportThemeModal();
                this.showNotification(`Theme "${themeData.name}" erfolgreich importiert!`, 'success');
                
                // Frage ob Theme geladen werden soll
                this.confirmModal = {
                    title: 'Theme laden',
                    message: `Theme "${themeData.name}" erfolgreich importiert. Möchten Sie es jetzt laden?`,
                    onCancel: () => this.closeConfirmModal(),
                    onExtend: () => this.extendTheme(themeData.name),
                    showExtend: true
                };
                this.showConfirmModal = true;
            if (window.modalHelpers) window.modalHelpers.openModal();
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
        closeConfirmModal() {
            this.showConfirmModal = false;
            this.confirmModal = {
                title: '',
                message: '',
                onConfirm: null,
                onCancel: null,
                onExtend: null,
                showExtend: false,
                showLinkFollow: false,
                linkFollowUrl: null,
                linkFollowTarget: '_self'
            };
            if (window.modalHelpers) window.modalHelpers.closeModal();
        },

        confirmAction() {
            if (this.confirmModal.onConfirm) {
                this.confirmModal.onConfirm();
            }
        },

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

        updateImageUrl(blockId, imageUrl) {
            BlockManagement.updateImageUrl(this.blocks, blockId, imageUrl);
        },

        updateImageAlt(blockId, imageAlt) {
            BlockManagement.updateImageAlt(this.blocks, blockId, imageAlt);
        },

        updateImageTitle(blockId, imageTitle) {
            BlockManagement.updateImageTitle(this.blocks, blockId, imageTitle);
        },

        openImageSettingsModal(blockId) {
            const { block } = this.findBlockById(blockId);
            if (block && block.type === 'image') {
                this.imageSettingsBlockId = blockId;
                this.imageSettingsUrl = block.imageUrl || '';
                this.imageSettingsAlt = block.imageAlt || '';
                this.imageSettingsTitle = block.imageTitle || '';
                this.imageSettingsActiveTab = 'upload';
                this.showImageSettingsModal = true;
                if (window.modalHelpers) window.modalHelpers.openModal();
            }
        },

        closeImageSettingsModal() {
            this.showImageSettingsModal = false;
            this.imageSettingsBlockId = null;
            this.imageSettingsUrl = '';
            this.imageSettingsAlt = '';
            this.imageSettingsTitle = '';
            this.imageSettingsActiveTab = 'upload';
        },

        saveImageSettings() {
            if (!this.imageSettingsBlockId) return;
            
            if (!this.imageSettingsUrl.trim()) {
                this.showNotification('Bitte geben Sie eine Bild-URL ein', 'warning');
                return;
            }
            
            BlockManagement.updateImageUrl(this.blocks, this.imageSettingsBlockId, this.imageSettingsUrl);
            BlockManagement.updateImageAlt(this.blocks, this.imageSettingsBlockId, this.imageSettingsAlt);
            BlockManagement.updateImageTitle(this.blocks, this.imageSettingsBlockId, this.imageSettingsTitle);
            
            this.showNotification('Bild-Einstellungen erfolgreich gespeichert!', 'success');
            this.closeImageSettingsModal();
        },

        selectImageFile(blockId) {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.onchange = (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        const imageUrl = event.target.result;
                        BlockManagement.updateImageUrl(this.blocks, blockId, imageUrl);
                        
                        // Aktualisiere auch die Modal-Felder, falls das Modal geöffnet ist
                        if (this.showImageSettingsModal && this.imageSettingsBlockId === blockId) {
                            this.imageSettingsUrl = imageUrl;
                        }
                        
                        this.showNotification('Bild erfolgreich hochgeladen!', 'success');
                    };
                    reader.onerror = () => {
                        this.showNotification('Fehler beim Laden des Bildes', 'error');
                    };
                    reader.readAsDataURL(file);
                }
            };
            input.click();
        },

        // Einheitliches Link-Management-System
        
        /**
         * Öffnet das Link-Modal für verschiedene Kontexte
         * @param {string} type - 'block' (Link-Block), 'selection' (Text-Selektion), 'edit' (Link bearbeiten)
         * @param {object} options - Optionale Parameter je nach Typ
         */
        openLinkModal(type, options = {}) {
            // Reset Modal-Daten
            this.linkModal = {
                type: type,
                blockId: null,
                url: '',
                target: '_self',
                text: '',
                linkText: '', // Optionaler Link-Text für Link-Blöcke
                element: null,
                range: null
            };
            
            if (type === 'block') {
                // Link-Block bearbeiten
                const { block } = this.findBlockById(options.blockId);
                if (block && block.type === 'link') {
                    this.linkModal.blockId = options.blockId;
                    this.linkModal.url = block.linkUrl || '';
                    this.linkModal.target = block.linkTarget || '_self';
                    this.linkModal.text = block.content || '';
                    this.linkModal.linkText = block.linkText || '';
                } else {
                    return; // Ungültiger Block
                }
            } else if (type === 'selection') {
                // Neuer Link für Text-Selektion
                if (!this.selectedRange || !this.selectedText) return;
                this.linkModal.range = this.selectedRange;
                this.linkModal.text = this.selectedText;
            } else if (type === 'edit') {
                // Bestehenden Link in Text bearbeiten
                if (!options.element || !options.blockElement) return;
                const blockId = options.blockElement.getAttribute('data-block-id');
                const href = options.element.getAttribute('href') || '';
                const linkText = options.element.textContent || '';
                const linkTarget = options.element.getAttribute('target') || '_self';
                
                this.linkModal.element = options.element;
                this.linkModal.blockId = blockId;
                this.linkModal.url = href;
                this.linkModal.text = linkText;
                this.linkModal.target = linkTarget;
            }
            
            this.showLinkModal = true;
            if (window.modalHelpers) window.modalHelpers.openModal();
        },
        
        closeLinkModal() {
            this.showLinkModal = false;
            this.linkModal = {
                type: null,
                blockId: null,
                url: '',
                target: '_self',
                text: '',
                linkText: '',
                element: null,
                range: null
            };
            if (window.modalHelpers) window.modalHelpers.closeModal();
        },
        
        /**
         * Speichert/aktualisiert den Link je nach Modal-Typ
         */
        saveLink() {
            if (!this.linkModal.url.trim()) {
                this.showNotification('Bitte geben Sie eine URL ein', 'warning');
                return;
            }
            
            const url = this.linkModal.url.trim();
            const target = this.linkModal.target;
            
            if (this.linkModal.type === 'block') {
                // Link-Block speichern
                const { block } = this.findBlockById(this.linkModal.blockId);
                if (block && block.type === 'link') {
                    block.linkUrl = url;
                    block.linkTarget = target;
                    
                    // Speichere optionalen Link-Text
                    if (this.linkModal.linkText && this.linkModal.linkText.trim() !== '') {
                        block.linkText = this.linkModal.linkText.trim();
                        // Setze auch block.content auf linkText, damit es beim Rendering angezeigt wird
                        block.content = block.linkText;
                    } else {
                        // Wenn kein Link-Text gesetzt, entferne das Feld
                        block.linkText = '';
                        // Falls block.content leer ist, setze URL als Fallback
                        if (!block.content || block.content.trim() === '') {
                            block.content = url;
                        }
                    }
                    
                    // Aktualisiere auch das DOM-Element
                    const blockElement = this.getBlockElement(this.linkModal.blockId);
                    if (blockElement && blockElement.tagName === 'A') {
                        // Verwende linkText falls vorhanden, sonst content, sonst URL
                        const displayText = block.linkText || block.content || url;
                        blockElement.textContent = displayText;
                    }
                }
                this.showNotification('Link-Einstellungen erfolgreich gespeichert!', 'success');
            } else if (this.linkModal.type === 'selection') {
                // Neuer Link für Selektion
                if (!this.linkModal.range || !this.selectedBlockId) {
                    this.showNotification('Bitte markieren Sie Text für den Link', 'warning');
                    return;
                }
                
                const element = this.getBlockElement(this.selectedBlockId);
                if (!element) {
                    this.closeLinkModal();
                    return;
                }
                
                // Stelle Selektion wieder her
                const selection = window.getSelection();
                selection.removeAllRanges();
                selection.addRange(this.linkModal.range);
                
                // Prüfe ob bereits ein Link markiert ist
                const anchorNode = selection.anchorNode;
                let linkElement = null;
                if (anchorNode) {
                    let parent = anchorNode.nodeType === 3 ? anchorNode.parentElement : anchorNode;
                    while (parent && parent !== element) {
                        if (parent.tagName === 'A' && parent.hasAttribute('href')) {
                            linkElement = parent;
                            break;
                        }
                        parent = parent.parentElement;
                    }
                }
                
                if (linkElement) {
                    // Aktualisiere bestehenden Link
                    linkElement.setAttribute('href', url);
                    if (target !== '_self') {
                        linkElement.setAttribute('target', target);
                    } else {
                        linkElement.removeAttribute('target');
                    }
                } else {
                    // Erstelle neuen Link
                    try {
                        document.execCommand('createLink', false, url);
                        // Setze Target nachträglich
                        const newLink = selection.anchorNode ? 
                            (selection.anchorNode.nodeType === 3 ? selection.anchorNode.parentElement : selection.anchorNode).closest('a') : null;
                        if (newLink) {
                            if (target !== '_self') {
                                newLink.setAttribute('target', target);
                            } else {
                                newLink.removeAttribute('target');
                            }
                        }
                    } catch (error) {
                        console.warn('Fehler beim Erstellen des Links:', error);
                        this.showNotification('Link konnte nicht erstellt werden', 'warning');
                        return;
                    }
                }
                
                // Aktualisiere Block-Inhalt
                this.updateContentAfterLinkChange(element, selection);
                
                this.showNotification('Link erfolgreich hinzugefügt!', 'success');
                this.showFloatingToolbar = false;
                this.selectedRange = null;
            } else if (this.linkModal.type === 'edit') {
                // Bestehenden Link aktualisieren
                if (!this.linkModal.element) {
                    this.showNotification('Link-Element nicht gefunden', 'error');
                    return;
                }
                
                this.linkModal.element.setAttribute('href', url);
                if (target !== '_self') {
                    this.linkModal.element.setAttribute('target', target);
                } else {
                    this.linkModal.element.removeAttribute('target');
                }
                
                // Aktualisiere Block-Inhalt
                const blockElement = this.getBlockElement(this.linkModal.blockId);
                if (blockElement) {
                    this.$nextTick(() => {
                        const { block } = this.findBlockById(this.linkModal.blockId);
                        if (block) {
                            this.updateBlockContent(this.linkModal.blockId, blockElement.innerHTML);
                        }
                    });
                }
                
                this.showNotification('Link erfolgreich aktualisiert!', 'success');
            }
            
            this.closeLinkModal();
        },
        
        /**
         * Entfernt einen Link (nur für Edit-Modus)
         */
        removeLink() {
            if (this.linkModal.type !== 'edit' || !this.linkModal.element) return;
            
            const blockId = this.linkModal.blockId;
            const element = this.linkModal.element;
            
            // Entferne Link, behalte Text
            const linkText = element.textContent;
            const textNode = document.createTextNode(linkText);
            element.parentNode.replaceChild(textNode, element);
            
            // Aktualisiere Block-Inhalt
            const blockElement = this.getBlockElement(blockId);
            if (blockElement) {
                this.$nextTick(() => {
                    const { block } = this.findBlockById(blockId);
                    if (block) {
                        this.updateBlockContent(blockId, blockElement.innerHTML);
                    }
                });
            }
            
            this.showNotification('Link entfernt', 'success');
            this.closeLinkModal();
        },
        
        /**
         * Helper-Funktion: Aktualisiert Block-Inhalt nach Link-Änderung
         */
        updateContentAfterLinkChange(element, selection) {
            // Prüfe ob es ein Checklist-Eintrag ist
            const checklistItemElement = selection.anchorNode ? 
                (selection.anchorNode.nodeType === 3 ? selection.anchorNode.parentElement : selection.anchorNode).closest('[data-item-id]') : null;
            const isChecklistItem = checklistItemElement !== null;
            
            this.$nextTick(() => {
                if (isChecklistItem) {
                    const itemId = checklistItemElement.getAttribute('data-item-id');
                    const blockId = checklistItemElement.getAttribute('data-block-id');
                    this.updateChecklistItemText(blockId, itemId, checklistItemElement.innerHTML);
                } else {
                    const { block } = this.findBlockById(this.selectedBlockId);
                    if (block) {
                        this.updateBlockContent(this.selectedBlockId, element.innerHTML);
                    }
                }
            });
        },
        
        // Rückwärtskompatibilität: Alte Funktionen als Wrapper
        openLinkSettingsModal(blockId) {
            this.openLinkModal('block', { blockId });
        },
        
        /**
         * Öffnet ein Modal, das fragt, ob man dem Link folgen möchte oder den Block bearbeiten möchte
         * @param {string} blockId - Die ID des Link-Blocks
         * @param {Event} event - Das Klick-Event (optional)
         */
        openLinkFollowModal(blockId, event = null) {
            if (event) {
                event.preventDefault();
                event.stopPropagation();
            }
            
            const { block } = this.findBlockById(blockId);
            if (!block || block.type !== 'link' || !block.linkUrl) {
                return;
            }
            
            const linkUrl = block.linkUrl;
            const linkText = block.linkText || block.content || linkUrl;
            const linkTarget = block.linkTarget || '_self';
            
            this.confirmModal = {
                title: '🔗 Link öffnen?',
                message: `Möchten Sie dem Link folgen oder den Block bearbeiten?<br><br><strong>Link-Text:</strong> ${linkText}<br><strong>URL:</strong> ${linkUrl}`,
                onConfirm: () => {
                    // Link öffnen
                    if (linkTarget === '_blank') {
                        window.open(linkUrl, '_blank', 'noopener,noreferrer');
                    } else {
                        window.location.href = linkUrl;
                    }
                    this.closeConfirmModal();
                },
                onCancel: () => {
                    // Block bearbeiten
                    this.closeConfirmModal();
                    this.openLinkSettingsModal(blockId);
                },
                onExtend: null,
                showExtend: false,
                showLinkFollow: true,
                linkFollowUrl: linkUrl,
                linkFollowTarget: linkTarget
            };
            this.showConfirmModal = true;
            if (window.modalHelpers) window.modalHelpers.openModal();
        },
        
        /**
         * Zentrale Rendering-Funktion für alle Block-Typen
         * @param {object} block - Der Block-Objekt
         * @returns {string} HTML-String für den Block
         */
        renderBlock(block) {
            if (!block || !block.type) {
                console.warn('renderBlock: Block ohne Typ gefunden', block);
                return '';
            }
            
            // Render-Signatur pro Block (nur bei Änderungen neu rendern)
            const signature = this.getRenderSignature(block);
            const cached = this.renderBlockCache.get(block.id);
            
            if (cached && cached.signature === signature) {
                return cached.html;
            }
            
            // Container-Blöcke werden jetzt auch über diese Funktion gerendert
            const component = getBlockComponent(block.type);
            if (component && component.renderHTML) {
                const html = component.renderHTML(block, {
                    childBlockTypes: this.childBlockTypes,
                    index: this.blocks.findIndex(b => b.id === block.id)
                });
                
                // Speichere im Cache
                this.renderBlockCache.set(block.id, {
                    html: html,
                    signature: signature
                });
                
                return html;
            }
            return '';
        },
        
        /**
         * Erstellt einen Cache-Key für Block-Rendering
         * @param {object} block - Der Block-Objekt
         * @returns {string} Cache-Key
         */
        getRenderSignature(block) {
            if (!block || !block.id) return '';
            
            // Signatur basiert auf Typ + Zeitstempel (nur wenn Werte gesetzt/aktualisiert)
            const version = block.updatedAt || block.createdAt || '';
            let key = `${block.type}_${version}`;
            
            // Fallback wenn kein Zeitstempel vorhanden ist
            if (!version) {
                const contentHash = block.content ? `${block.content.length}_${block.content.substring(0, 20)}` : 'empty';
                key += `_${contentHash}`;
            }
            
            // Für spezielle Block-Typen: füge relevante Daten hinzu
            if (block.type === 'table' && block.tableData) {
                const rowCount = block.tableData.cells?.length || 0;
                const colCount = block.tableData.cells?.[0]?.length || 0;
                key += `_t${rowCount}x${colCount}_${block.tableData.hasHeader ? 'h1' : 'h0'}_${block.tableData.hasFooter ? 'f1' : 'f0'}`;
            }
            
            if (block.type === 'checklist' && block.checklistData) {
                const itemsCount = block.checklistData.items?.length || 0;
                key += `_c${itemsCount}`;
            }
            
            if (block.type === 'image') {
                key += `_${block.imageUrl || ''}_${block.imageAlt || ''}_${block.imageTitle || ''}`;
            }
            
            if (block.type === 'link') {
                key += `_${block.linkUrl || ''}_${block.linkText || ''}_${block.linkTarget || ''}`;
            }
            
            if ((block.type === 'twoColumn' || block.type === 'threeColumn') && block.children) {
                key += `_cols${block.children.length}`;
            }
            
            return key;
        },
        
        /**
         * Invalidiert den Render-Cache für einen Block oder alle
         * @param {string|null} blockId - Die Block-ID oder null für alle
         */
        invalidateRenderCache(blockId = null) {
            if (blockId) {
                this.renderBlockCache.delete(blockId);
                this.renderChildCache.delete(blockId);
            } else {
                this.renderBlockCache.clear();
                this.renderChildCache.clear();
            }
        },
        
        /**
         * Zentrale Rendering-Funktion für alle Child-Blöcke
         * @param {object} child - Der Child-Block-Objekt
         * @param {object} parentBlock - Der Parent-Block-Objekt
         * @param {number} childIndex - Der Index des Child-Blocks
         * @returns {string} HTML-String für den Child-Block
         */
        renderChild(child, parentBlock, childIndex) {
            if (!child || !child.type) {
                console.warn('renderChild: Child ohne Typ gefunden', child);
                return '';
            }
            
            const component = getBlockComponent(child.type);
            if (component && component.renderChildHTML) {
                const signature = this.getRenderSignature(child);
                const cached = this.renderChildCache.get(child.id);
                
                if (cached && cached.signature === signature) {
                    return cached.html;
                }
                
                const html = component.renderChildHTML(child, {
                    block: parentBlock,
                    childIndex: childIndex
                });
                
                this.renderChildCache.set(child.id, {
                    html: html,
                    signature: signature
                });
                
                return html;
            }
            return '';
        },
        
        closeLinkSettingsModal() {
            this.closeLinkModal();
        },
        
        saveLinkSettings() {
            this.saveLink();
        },

        handleTextSelection() {
            let selection;
            try {
                selection = window.getSelection();
            } catch (error) {
                console.warn('Fehler beim Abrufen der Selektion:', error);
                this.showFloatingToolbar = false;
                return;
            }
            
            // Prüfe ob Text markiert ist
            if (!selection || selection.rangeCount === 0 || selection.toString().trim() === '') {
                this.showFloatingToolbar = false;
                return;
            }
            
            let range;
            try {
                range = selection.getRangeAt(0);
            } catch (error) {
                console.warn('Fehler beim Abrufen des Range:', error);
                this.showFloatingToolbar = false;
                return;
            }
            
            const selectedText = selection.toString().trim();
            
            if (!selectedText || !range) {
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
            if (!block || block.type === 'code' || block.type === 'table' || block.type === 'divider') {
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
            let rect;
            try {
                rect = range.getBoundingClientRect();
            } catch (error) {
                console.warn('Fehler beim Abrufen der Bounding-Rect:', error);
                this.showFloatingToolbar = false;
                return;
            }
            
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
            
            this.floatingToolbarPosition = {
                top: rect.top + scrollTop - 50,
                left: rect.left + scrollLeft + (rect.width / 2)
            };
            
            // Speichere Range als Clone für spätere Verwendung
            try {
                this.selectedText = selectedText;
                this.selectedRange = range.cloneRange();
                this.selectedBlockId = blockId;
            } catch (error) {
                console.warn('Fehler beim Klonen des Range:', error);
                this.showFloatingToolbar = false;
                return;
            }
            
            // Wenn ein Link in der Selektion ist, öffne direkt Bearbeitung
            if (linkInSelection) {
                this.editLink(linkInSelection, blockElement);
            } else {
                this.showFloatingToolbar = true;
            }
        },

        getFormatState(format) {
            if (!this.selectedRange || !this.selectedBlockId) return 'off';
            
            try {
                const element = this.getBlockElement(this.selectedBlockId);
                if (!element) return 'off';
                
                // Speichere aktuelle Selektion
                const currentSelection = window.getSelection();
                if (!currentSelection) return 'off';
                
                const savedRanges = [];
                try {
                    for (let i = 0; i < currentSelection.rangeCount; i++) {
                        savedRanges.push(currentSelection.getRangeAt(i).cloneRange());
                    }
                } catch (e) {
                    // Ignoriere Fehler beim Speichern der Ranges
                }
                
                // Stelle temporär unsere Selektion wieder her
                try {
                    currentSelection.removeAllRanges();
                    currentSelection.addRange(this.selectedRange);
                    
                    // Prüfe ob Formatierung aktiv ist
                    let isActive = false;
                    try {
                        isActive = document.queryCommandState(format);
                    } catch (e) {
                        // queryCommandState kann in manchen Browsern fehlschlagen
                        return 'off';
                    }
                    
                    // Stelle ursprüngliche Selektion wieder her
                    currentSelection.removeAllRanges();
                    savedRanges.forEach(r => {
                        try {
                            currentSelection.addRange(r);
                        } catch (e) {
                            // Ignoriere Fehler beim Wiederherstellen
                        }
                    });
                    
                    return isActive ? 'on' : 'off';
                } catch (e) {
                    // Stelle ursprüngliche Selektion wieder her bei Fehler
                    try {
                        currentSelection.removeAllRanges();
                        savedRanges.forEach(r => {
                            try {
                                currentSelection.addRange(r);
                            } catch (e2) {
                                // Ignoriere Fehler
                            }
                        });
                    } catch (e2) {
                        // Ignoriere Fehler
                    }
                    return 'off';
                }
            } catch (e) {
                return 'off';
            }
        },

        applyTextFormat(format) {
            if (!this.selectedRange || !this.selectedBlockId) return;
            
            const element = this.getBlockElement(this.selectedBlockId);
            if (!element) {
                this.showFloatingToolbar = false;
                return;
            }
            
            // Stelle Selektion wieder her
            let selection;
            try {
                selection = window.getSelection();
                if (!selection) return;
                selection.removeAllRanges();
                selection.addRange(this.selectedRange);
            } catch (error) {
                console.warn('Fehler beim Wiederherstellen der Selektion:', error);
                return;
            }
            
            // Prüfe ob es ein Checklist-Eintrag ist
            const checklistItemElement = selection.anchorNode ? 
                (selection.anchorNode.nodeType === 3 ? selection.anchorNode.parentElement : selection.anchorNode).closest('[data-item-id]') : null;
            const isChecklistItem = checklistItemElement !== null;
            
            // Prüfe ob Formatierung bereits aktiv ist (Toggle-Verhalten)
            let isActive = false;
            try {
                isActive = document.queryCommandState(format);
            } catch (error) {
                // queryCommandState kann in manchen Browsern fehlschlagen
                console.warn('Fehler beim Prüfen des Format-Status:', error);
            }
            
            // Wende Formatierung an oder entferne sie
            try {
                if (isActive && format !== 'createLink') {
                    // Entferne Formatierung
                    document.execCommand(format, false, null);
                } else {
                    // Wende Formatierung an
                    document.execCommand(format, false, null);
                }
            } catch (error) {
                console.warn('Fehler beim Anwenden der Formatierung:', error);
                this.showNotification('Formatierung konnte nicht angewendet werden', 'warning');
                return;
            }
            
            // Aktualisiere Block-Inhalt oder Checklist-Eintrag
            this.$nextTick(() => {
                try {
                    if (isChecklistItem && checklistItemElement) {
                        const itemId = checklistItemElement.getAttribute('data-item-id');
                        const blockId = checklistItemElement.getAttribute('data-block-id');
                        if (itemId && blockId) {
                            this.updateChecklistItemText(blockId, itemId, checklistItemElement.innerHTML);
                        }
                    } else {
                        const { block } = this.findBlockById(this.selectedBlockId);
                        if (block && element) {
                            this.updateBlockContent(this.selectedBlockId, element.innerHTML);
                        }
                    }
                    // Aktualisiere selectedRange für weitere Formatierungen
                    try {
                        const newSelection = window.getSelection();
                        if (newSelection && newSelection.rangeCount > 0) {
                            this.selectedRange = newSelection.getRangeAt(0).cloneRange();
                        }
                    } catch (error) {
                        // Ignoriere Fehler beim Aktualisieren des Ranges
                    }
                } catch (error) {
                    console.warn('Fehler beim Aktualisieren des Block-Inhalts:', error);
                }
            });
        },

        removeFormatting() {
            if (!this.selectedRange || !this.selectedBlockId) return;
            
            const element = this.getBlockElement(this.selectedBlockId);
            if (!element) {
                this.showFloatingToolbar = false;
                return;
            }
            
            // Stelle Selektion wieder her
            let selection;
            try {
                selection = window.getSelection();
                if (!selection) return;
                selection.removeAllRanges();
                selection.addRange(this.selectedRange);
            } catch (error) {
                console.warn('Fehler beim Wiederherstellen der Selektion:', error);
                return;
            }
            
            // Prüfe ob es ein Checklist-Eintrag ist
            const checklistItemElement = selection.anchorNode ? 
                (selection.anchorNode.nodeType === 3 ? selection.anchorNode.parentElement : selection.anchorNode).closest('[data-item-id]') : null;
            const isChecklistItem = checklistItemElement !== null;
            const targetElement = isChecklistItem ? checklistItemElement : element;
            
            // Entferne alle Formatierungen
            try {
                document.execCommand('removeFormat', false, null);
                document.execCommand('unlink', false, null);
            } catch (error) {
                console.warn('Fehler beim Entfernen der Formatierung:', error);
                this.showNotification('Formatierung konnte nicht entfernt werden', 'warning');
                return;
            }
            
            // Aktualisiere Block-Inhalt oder Checklist-Eintrag
            this.$nextTick(() => {
                if (isChecklistItem) {
                    const itemId = checklistItemElement.getAttribute('data-item-id');
                    const blockId = checklistItemElement.getAttribute('data-block-id');
                    this.updateChecklistItemText(blockId, itemId, checklistItemElement.innerHTML);
                } else {
                    const { block } = this.findBlockById(this.selectedBlockId);
                    if (block) {
                        this.updateBlockContent(this.selectedBlockId, element.innerHTML);
                    }
                }
            });
            
            this.showNotification('Formatierung entfernt', 'success');
            this.showFloatingToolbar = false;
            this.selectedRange = null;
        },

        // Rückwärtskompatibilität: Alte Funktionen für Links in Text
        editLink(linkElement, blockElement) {
            this.openLinkModal('edit', { element: linkElement, blockElement });
        },
        
        updateLink() {
            this.saveLink();
        },
        
        openLinkInputForSelection() {
            this.openLinkModal('selection');
        },
        
        closeLinkInputModal() {
            this.closeLinkModal();
        },
        
        applyLinkToSelection() {
            this.saveLink();
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
        },

        applyTextAlignmentToSelection(alignment) {
            if (!this.selectedRange || !this.selectedBlockId) return;
            
            const element = this.getBlockElement(this.selectedBlockId);
            if (!element) {
                this.showFloatingToolbar = false;
                return;
            }
            
            // Stelle Selektion wieder her
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(this.selectedRange);
            
            // Wende Ausrichtung an
            try {
                if (alignment === 'center') {
                    document.execCommand('justifyCenter', false, null);
                } else if (alignment === 'right') {
                    document.execCommand('justifyRight', false, null);
                } else if (alignment === 'left') {
                    document.execCommand('justifyLeft', false, null);
                } else {
                    document.execCommand('justifyLeft', false, null);
                }
            } catch (e) {
                console.warn('Text alignment command not supported:', e);
                this.showNotification('Text-Ausrichtung konnte nicht angewendet werden', 'warning');
                return;
            }
            
            // Prüfe ob es ein Checklist-Eintrag ist
            const checklistItemElement = selection.anchorNode ? 
                (selection.anchorNode.nodeType === 3 ? selection.anchorNode.parentElement : selection.anchorNode).closest('[data-item-id]') : null;
            const isChecklistItem = checklistItemElement !== null;
            
            // Aktualisiere Block-Inhalt oder Checklist-Eintrag
            this.$nextTick(() => {
                if (isChecklistItem) {
                    const itemId = checklistItemElement.getAttribute('data-item-id');
                    const blockId = checklistItemElement.getAttribute('data-block-id');
                    this.updateChecklistItemText(blockId, itemId, checklistItemElement.innerHTML);
                } else {
                    const { block } = this.findBlockById(this.selectedBlockId);
                    if (block) {
                        this.updateBlockContent(this.selectedBlockId, element.innerHTML);
                    }
                }
            });
            
            // Verstecke Toolbar nicht, damit weitere Formatierungen möglich sind
            this.selectedRange = selection.getRangeAt(0).cloneRange();
        },

        getTextAlignmentState(alignment) {
            if (!this.selectedRange || !this.selectedBlockId) return 'off';
            
            try {
                const element = this.getBlockElement(this.selectedBlockId);
                if (!element) return 'off';
                
                // Speichere aktuelle Selektion
                const currentSelection = window.getSelection();
                const savedRanges = [];
                for (let i = 0; i < currentSelection.rangeCount; i++) {
                    savedRanges.push(currentSelection.getRangeAt(i).cloneRange());
                }
                
                // Stelle temporär unsere Selektion wieder her
                currentSelection.removeAllRanges();
                currentSelection.addRange(this.selectedRange);
                
                // Prüfe Computed Style
                const range = currentSelection.getRangeAt(0);
                let node = range.commonAncestorContainer;
                if (node.nodeType === 3) {
                    node = node.parentElement;
                }
                
                const computedStyle = window.getComputedStyle(node);
                const textAlign = computedStyle.textAlign;
                
                // Stelle ursprüngliche Selektion wieder her
                currentSelection.removeAllRanges();
                savedRanges.forEach(r => currentSelection.addRange(r));
                
                if (alignment === 'left' && (textAlign === 'left' || textAlign === 'start' || !textAlign)) {
                    return 'on';
                } else if (alignment === 'center' && textAlign === 'center') {
                    return 'on';
                } else if (alignment === 'right' && (textAlign === 'right' || textAlign === 'end')) {
                    return 'on';
                }
                
                return 'off';
            } catch (e) {
                return 'off';
            }
        },

        applyTextColor(color) {
            if (!this.selectedRange || !this.selectedBlockId) return;
            
            const element = this.getBlockElement(this.selectedBlockId);
            if (!element) {
                this.showFloatingToolbar = false;
                return;
            }
            
            // Stelle Selektion wieder her
            let selection;
            try {
                selection = window.getSelection();
                if (!selection) return;
                selection.removeAllRanges();
                selection.addRange(this.selectedRange);
            } catch (error) {
                console.warn('Fehler beim Wiederherstellen der Selektion:', error);
                return;
            }
            
            // Wende Textfarbe an
            try {
                document.execCommand('foreColor', false, color);
            } catch (e) {
                // Fallback: Erstelle span mit color style
                try {
                    const range = selection.getRangeAt(0);
                    const span = document.createElement('span');
                    span.style.color = color;
                    try {
                        range.surroundContents(span);
                    } catch (e2) {
                        // Wenn surroundContents fehlschlägt, verwende extractContents
                        const contents = range.extractContents();
                        span.appendChild(contents);
                        range.insertNode(span);
                    }
                } catch (e3) {
                    console.warn('Fehler beim Anwenden der Textfarbe:', e3);
                    this.showNotification('Textfarbe konnte nicht angewendet werden', 'warning');
                    return;
                }
            }
            
            // Prüfe ob es ein Checklist-Eintrag ist
            const checklistItemElement = selection.anchorNode ? 
                (selection.anchorNode.nodeType === 3 ? selection.anchorNode.parentElement : selection.anchorNode).closest('[data-item-id]') : null;
            const isChecklistItem = checklistItemElement !== null;
            
            // Aktualisiere Block-Inhalt oder Checklist-Eintrag
            this.$nextTick(() => {
                if (isChecklistItem) {
                    const itemId = checklistItemElement.getAttribute('data-item-id');
                    const blockId = checklistItemElement.getAttribute('data-block-id');
                    this.updateChecklistItemText(blockId, itemId, checklistItemElement.innerHTML);
                } else {
                    const { block } = this.findBlockById(this.selectedBlockId);
                    if (block) {
                        this.updateBlockContent(this.selectedBlockId, element.innerHTML);
                    }
                }
            });
            
            // Aktualisiere selectedRange
            this.selectedRange = selection.getRangeAt(0).cloneRange();
        },

        applyBackgroundColor(color) {
            if (!this.selectedRange || !this.selectedBlockId) return;
            
            const element = this.getBlockElement(this.selectedBlockId);
            if (!element) {
                this.showFloatingToolbar = false;
                return;
            }
            
            // Stelle Selektion wieder her
            let selection;
            try {
                selection = window.getSelection();
                if (!selection) return;
                selection.removeAllRanges();
                selection.addRange(this.selectedRange);
            } catch (error) {
                console.warn('Fehler beim Wiederherstellen der Selektion:', error);
                return;
            }
            
            // Prüfe ob es ein Checklist-Eintrag ist
            const checklistItemElement = selection.anchorNode ? 
                (selection.anchorNode.nodeType === 3 ? selection.anchorNode.parentElement : selection.anchorNode).closest('[data-item-id]') : null;
            const isChecklistItem = checklistItemElement !== null;
            
            // Wende Hintergrundfarbe an
            try {
                document.execCommand('backColor', false, color);
            } catch (e) {
                // Fallback: Erstelle span mit backgroundColor style
                try {
                    const range = selection.getRangeAt(0);
                    const span = document.createElement('span');
                    span.style.backgroundColor = color;
                    try {
                        range.surroundContents(span);
                    } catch (e2) {
                        // Wenn surroundContents fehlschlägt, verwende extractContents
                        const contents = range.extractContents();
                        span.appendChild(contents);
                        range.insertNode(span);
                    }
                } catch (e3) {
                    console.warn('Fehler beim Anwenden der Hintergrundfarbe:', e3);
                    this.showNotification('Hintergrundfarbe konnte nicht angewendet werden', 'warning');
                    return;
                }
            }
            
            // Aktualisiere Block-Inhalt oder Checklist-Eintrag
            this.$nextTick(() => {
                if (isChecklistItem) {
                    const itemId = checklistItemElement.getAttribute('data-item-id');
                    const blockId = checklistItemElement.getAttribute('data-block-id');
                    this.updateChecklistItemText(blockId, itemId, checklistItemElement.innerHTML);
                } else {
                    const { block } = this.findBlockById(this.selectedBlockId);
                    if (block) {
                        this.updateBlockContent(this.selectedBlockId, element.innerHTML);
                    }
                }
            });
            
            // Aktualisiere selectedRange
            this.selectedRange = selection.getRangeAt(0).cloneRange();
        }
    }
}

// Registriere die Komponente global für Alpine.js
window.blockEditor = blockEditor;



