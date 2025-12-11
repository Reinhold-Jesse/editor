/**
 * Toolbar Components Index
 * Exportiert alle Toolbar-Komponenten zentral
 */
import { BlockSelectionToolbar } from './block-selection-toolbar.js';
import { FloatingToolbar } from './floating-toolbar.js';

// Exportiere alle Toolbar-Komponenten als Objekt
export const ToolbarComponents = {
    blockSelection: BlockSelectionToolbar,
    floating: FloatingToolbar
};

/**
 * Gibt die passende Toolbar-Komponente zurück
 */
export function getToolbarComponent(name) {
    return ToolbarComponents[name] || null;
}

