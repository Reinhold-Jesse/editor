/**
 * Template Index
 * Exportiert alle HTML-Templates für die Verwendung in index.html
 */
import { getNotificationTemplate } from './notification.js';
import { getSidebarTemplate } from './sidebar.js';
import { getBlockToolbarTemplate } from './block-toolbar.js';
import { getFloatingToolbarTemplate } from './floating-toolbar.js';
import { getJsonImportModalTemplate } from './modals/json-import-modal.js';
import { getJsonExportModalTemplate } from './modals/json-export-modal.js';
import { getThemeSaveModalTemplate } from './modals/theme-save-modal.js';
import { getThemeEditModalTemplate } from './modals/theme-edit-modal.js';
import { getThemeImportModalTemplate } from './modals/theme-import-modal.js';
import { getLinkModalTemplate } from './modals/link-modal.js';
import { getConfirmModalTemplate } from './modals/confirm-modal.js';
import { getImageSettingsModalTemplate } from './modals/image-settings-modal.js';

/**
 * Lädt alle Templates und gibt sie als Objekt zurück
 * Kann in block-editor.js verwendet werden, um Templates zu rendern
 */
export function getAllTemplates() {
    return {
        notification: getNotificationTemplate(),
        sidebar: getSidebarTemplate(),
        blockToolbar: getBlockToolbarTemplate(),
        floatingToolbar: getFloatingToolbarTemplate(),
        modals: {
            jsonImport: getJsonImportModalTemplate(),
            jsonExport: getJsonExportModalTemplate(),
            themeSave: getThemeSaveModalTemplate(),
            themeEdit: getThemeEditModalTemplate(),
            themeImport: getThemeImportModalTemplate(),
            link: getLinkModalTemplate(),
            confirm: getConfirmModalTemplate(),
            imageSettings: getImageSettingsModalTemplate()
        }
    };
}

/**
 * Gibt ein spezifisches Template zurück
 */
export function getTemplate(name) {
    const templates = getAllTemplates();
    const parts = name.split('.');
    let result = templates;
    for (const part of parts) {
        result = result[part];
        if (!result) return '';
    }
    return result || '';
}
