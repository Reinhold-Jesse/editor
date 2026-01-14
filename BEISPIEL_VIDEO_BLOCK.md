# Praktisches Beispiel: Video Block hinzufügen

Dieses Beispiel zeigt Schritt-für-Schritt, wie du einen Video Block hinzufügst, der YouTube und Vimeo Videos einbetten kann.

## Schritt 1: Block-Typ definieren

**Datei:** `components/block-types.js`

Füge nach Zeile 106 hinzu:

```javascript
video: {
    label: '🎥 Video',
    tag: 'div',
    placeholder: '',
    classes: 'w-full',
    isVoid: true,
    hasVideoData: true,
    canHaveChildren: false
}
```

## Schritt 2: Block-Komponente erstellen

**Datei:** `components/blocks/video.js` (NEU ERSTELLEN)

```javascript
/**
 * Video Block Component
 * Unterstützt YouTube und Vimeo Videos
 */
import { BLOCK_TYPES } from '../block-types.js';

export const VideoBlock = {
    type: 'video',
    
    options: BLOCK_TYPES.video,
    
    structure: {
        id: '',
        type: 'video',
        videoUrl: '',
        videoType: '', // 'youtube', 'vimeo', 'direct'
        videoId: '', // Für YouTube/Vimeo
        videoWidth: '100%',
        videoHeight: '315',
        autoplay: false,
        loop: false,
        muted: false,
        style: '',
        classes: '',
        htmlId: '',
        createdAt: '',
        updatedAt: ''
    },
    
    // Extrahiert Video-ID aus URL
    extractVideoId(url, type) {
        if (!url) return '';
        
        if (type === 'youtube') {
            // YouTube URL Patterns:
            // https://www.youtube.com/watch?v=VIDEO_ID
            // https://youtu.be/VIDEO_ID
            // https://www.youtube.com/embed/VIDEO_ID
            const patterns = [
                /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
                /youtube\.com\/.*[?&]v=([^&\n?#]+)/
            ];
            
            for (const pattern of patterns) {
                const match = url.match(pattern);
                if (match && match[1]) {
                    return match[1];
                }
            }
        } else if (type === 'vimeo') {
            // Vimeo URL Patterns:
            // https://vimeo.com/VIDEO_ID
            // https://player.vimeo.com/video/VIDEO_ID
            const patterns = [
                /vimeo\.com\/(?:.*\/)?(\d+)/,
                /player\.vimeo\.com\/video\/(\d+)/
            ];
            
            for (const pattern of patterns) {
                const match = url.match(pattern);
                if (match && match[1]) {
                    return match[1];
                }
            }
        }
        
        return '';
    },
    
    // Erkennt Video-Typ aus URL
    detectVideoType(url) {
        if (!url) return '';
        
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            return 'youtube';
        } else if (url.includes('vimeo.com')) {
            return 'vimeo';
        } else if (url.match(/\.(mp4|webm|ogg)$/i)) {
            return 'direct';
        }
        
        return '';
    },
    
    // Generiert Embed-URL
    getEmbedUrl(block) {
        if (!block.videoId && !block.videoUrl) return '';
        
        const videoId = block.videoId || this.extractVideoId(block.videoUrl, block.videoType);
        const type = block.videoType || this.detectVideoType(block.videoUrl);
        
        if (type === 'youtube') {
            let embedUrl = `https://www.youtube.com/embed/${videoId}`;
            const params = [];
            if (block.autoplay) params.push('autoplay=1');
            if (block.loop) params.push('loop=1');
            if (block.muted) params.push('mute=1');
            if (params.length > 0) {
                embedUrl += '?' + params.join('&');
            }
            return embedUrl;
        } else if (type === 'vimeo') {
            let embedUrl = `https://player.vimeo.com/video/${videoId}`;
            const params = [];
            if (block.autoplay) params.push('autoplay=1');
            if (block.loop) params.push('loop=1');
            if (block.muted) params.push('muted=1');
            if (params.length > 0) {
                embedUrl += '?' + params.join('&');
            }
            return embedUrl;
        } else if (type === 'direct') {
            return block.videoUrl;
        }
        
        return '';
    },
    
    renderHTML(block, context = {}) {
        const { selectedBlockId } = context;
        const isSelected = selectedBlockId === block.id;
        
        // Wenn kein Video gesetzt ist, zeige Platzhalter
        if (!block.videoUrl || block.videoUrl.trim() === '') {
            return `
                <div x-show="block.type === 'video'" class="relative w-full">
                    <div 
                        :data-block-id="block.id"
                        class="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-8 bg-gray-50 min-h-[300px] cursor-pointer hover:bg-gray-100 transition-colors w-full"
                        @click.stop="openVideoSettingsModal(block.id)"
                    >
                        <div class="text-center text-gray-500">
                            <svg class="w-16 h-16 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                            </svg>
                            <p class="text-sm font-medium">Video hinzufügen</p>
                            <p class="text-xs text-gray-400 mt-1">YouTube, Vimeo oder direkter Video-Link</p>
                        </div>
                    </div>
                </div>
            `;
        }
        
        // Video-Typ erkennen
        const videoType = block.videoType || this.detectVideoType(block.videoUrl);
        const embedUrl = this.getEmbedUrl(block);
        
        if (!embedUrl) {
            return `
                <div x-show="block.type === 'video'" class="relative w-full">
                    <div class="p-4 bg-red-50 border border-red-200 rounded text-red-700">
                        Ungültige Video-URL. Bitte überprüfe die URL.
                    </div>
                </div>
            `;
        }
        
        // YouTube/Vimeo Embed
        if (videoType === 'youtube' || videoType === 'vimeo') {
            return `
                <div x-show="block.type === 'video'" class="relative w-full" :style="block.style || ''">
                    <div 
                        :data-block-id="block.id"
                        :id="block.htmlId || null"
                        :class="['relative', block.classes || '']"
                        style="padding-bottom: 56.25%; height: 0; overflow: hidden;"
                    >
                        <iframe 
                            :src="'${embedUrl}'"
                            :width="block.videoWidth || '100%'"
                            :height="block.videoHeight || '315'"
                            frameborder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowfullscreen
                            class="absolute top-0 left-0 w-full h-full"
                            style="width: 100%; height: 100%;"
                        ></iframe>
                    </div>
                </div>
            `;
        }
        
        // Direktes Video (MP4, WebM, etc.)
        if (videoType === 'direct') {
            return `
                <div x-show="block.type === 'video'" class="relative w-full" :style="block.style || ''">
                    <video 
                        :data-block-id="block.id"
                        :id="block.htmlId || null"
                        :src="block.videoUrl"
                        :autoplay="block.autoplay"
                        :loop="block.loop"
                        :muted="block.muted"
                        :class="['w-full rounded', block.classes || '']"
                        controls
                    ></video>
                </div>
            `;
        }
        
        return '';
    },
    
    renderChildHTML(child, context = {}) {
        return this.renderHTML(child, context);
    },
    
    initialize(block, blockIdCounter) {
        block.videoUrl = block.videoUrl || '';
        block.videoType = block.videoType || '';
        block.videoId = block.videoId || '';
        block.videoWidth = block.videoWidth || '100%';
        block.videoHeight = block.videoHeight || '315';
        block.autoplay = block.autoplay || false;
        block.loop = block.loop || false;
        block.muted = block.muted || false;
        return block;
    },
    
    ensureInitialized(block, blockIdCounter) {
        if (!block.hasOwnProperty('videoUrl')) block.videoUrl = '';
        if (!block.hasOwnProperty('videoType')) block.videoType = '';
        if (!block.hasOwnProperty('videoId')) block.videoId = '';
        if (!block.hasOwnProperty('videoWidth')) block.videoWidth = '100%';
        if (!block.hasOwnProperty('videoHeight')) block.videoHeight = '315';
        if (!block.hasOwnProperty('autoplay')) block.autoplay = false;
        if (!block.hasOwnProperty('loop')) block.loop = false;
        if (!block.hasOwnProperty('muted')) block.muted = false;
        return block;
    },
    
    cleanup(block) {
        delete block.videoUrl;
        delete block.videoType;
        delete block.videoId;
        delete block.videoWidth;
        delete block.videoHeight;
        delete block.autoplay;
        delete block.loop;
        delete block.muted;
        return block;
    }
};
```

## Schritt 3: Block registrieren

**Datei:** `components/blocks/index.js`

Füge den Import hinzu (nach Zeile 17):
```javascript
import { VideoBlock } from './video.js';
```

Füge in `BlockComponents` hinzu (nach Zeile 34):
```javascript
video: VideoBlock
```

## Schritt 4: Rendering-Funktion hinzufügen

**Datei:** `block-editor.js`

Suche nach `renderImageBlock` (ca. Zeile 1738) und füge danach hinzu:

```javascript
renderVideoBlock(block) {
    const component = getBlockComponent('video');
    if (component && component.renderHTML) {
        return component.renderHTML(block, {
            selectedBlockId: this.selectedBlockId,
            draggingBlockId: this.draggingBlockId,
            hoveredBlockId: this.hoveredBlockId
        });
    }
    return '';
}
```

Und für Child-Rendering:

```javascript
renderVideoChild(child, parent, childIndex) {
    const component = getBlockComponent('video');
    if (component && component.renderChildHTML) {
        return component.renderChildHTML(child, {
            block: parent,
            childIndex: childIndex
        });
    }
    return '';
}
```

## Schritt 5: Video Settings Modal hinzufügen

**Datei:** `block-editor.js`

Füge State-Variablen hinzu (nach `imageSettingsActiveTab`):

```javascript
showVideoSettingsModal: false,
videoSettingsBlockId: null,
videoSettingsUrl: '',
videoSettingsType: 'youtube', // 'youtube', 'vimeo', 'direct'
videoSettingsWidth: '100%',
videoSettingsHeight: '315',
videoSettingsAutoplay: false,
videoSettingsLoop: false,
videoSettingsMuted: false,
```

Füge Funktionen hinzu:

```javascript
openVideoSettingsModal(blockId) {
    const { block } = Utils.findBlockById(this.blocks, blockId);
    if (block) {
        this.videoSettingsBlockId = blockId;
        this.videoSettingsUrl = block.videoUrl || '';
        this.videoSettingsType = block.videoType || this.detectVideoType(block.videoUrl);
        this.videoSettingsWidth = block.videoWidth || '100%';
        this.videoSettingsHeight = block.videoHeight || '315';
        this.videoSettingsAutoplay = block.autoplay || false;
        this.videoSettingsLoop = block.loop || false;
        this.videoSettingsMuted = block.muted || false;
        this.showVideoSettingsModal = true;
    }
},

detectVideoType(url) {
    if (!url) return 'youtube';
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
    if (url.includes('vimeo.com')) return 'vimeo';
    if (url.match(/\.(mp4|webm|ogg)$/i)) return 'direct';
    return 'youtube';
},

saveVideoSettings() {
    if (!this.videoSettingsBlockId) return;
    
    const { block } = Utils.findBlockById(this.blocks, this.videoSettingsBlockId);
    if (block) {
        block.videoUrl = this.videoSettingsUrl.trim();
        block.videoType = this.detectVideoType(block.videoUrl);
        
        // Extrahiere Video-ID
        const component = getBlockComponent('video');
        if (component && component.extractVideoId) {
            block.videoId = component.extractVideoId(block.videoUrl, block.videoType);
        }
        
        block.videoWidth = this.videoSettingsWidth;
        block.videoHeight = this.videoSettingsHeight;
        block.autoplay = this.videoSettingsAutoplay;
        block.loop = this.videoSettingsLoop;
        block.muted = this.videoSettingsMuted;
        block.updatedAt = new Date().toISOString();
        
        this.showVideoSettingsModal = false;
        this.showNotification('Video-Einstellungen gespeichert', 'success');
        
        // Cache invalidieren
        this.invalidateBlockCache(this.videoSettingsBlockId);
    }
},

closeVideoSettingsModal() {
    this.showVideoSettingsModal = false;
    this.videoSettingsBlockId = null;
    this.videoSettingsUrl = '';
},
```

## Schritt 6: HTML-Template hinzufügen

**Datei:** `index.html`

Füge nach dem Image Block hinzu (ca. Zeile 793):

```html
<!-- Video -->
<div x-show="block.type === 'video'" x-html="renderVideoBlock(block)"></div>
```

Füge auch Child-Rendering hinzu (in den Spalten-Bereichen, ca. Zeile 844):

```html
<!-- Video in Spalte -->
<div x-show="child.type === 'video'" x-html="renderVideoChild(child, column, childIndex)"></div>
```

## Schritt 7: Video Settings Modal HTML

**Datei:** `index.html`

Füge nach dem Image Settings Modal hinzu (suche nach `showImageSettingsModal`):

```html
<!-- Video Settings Modal -->
<div 
    x-show="showVideoSettingsModal"
    x-transition:enter="transition ease-out duration-300"
    x-transition:enter-start="opacity-0"
    x-transition:enter-end="opacity-100"
    x-transition:leave="transition ease-in duration-200"
    x-transition:leave-start="opacity-100"
    x-transition:leave-end="opacity-0"
    class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
    @click.self="closeVideoSettingsModal()"
    @keydown.escape.window="closeVideoSettingsModal()"
>
    <div 
        class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        @click.stop
    >
        <div class="p-6">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-2xl font-bold text-gray-900">Video-Einstellungen</h2>
                <button 
                    @click="closeVideoSettingsModal()"
                    class="text-gray-400 hover:text-gray-600"
                >
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>

            <div class="space-y-4">
                <!-- Video URL -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        Video URL
                    </label>
                    <input 
                        type="text"
                        x-model="videoSettingsUrl"
                        placeholder="https://www.youtube.com/watch?v=... oder https://vimeo.com/..."
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        @input="videoSettingsType = detectVideoType(videoSettingsUrl)"
                    />
                    <p class="mt-1 text-xs text-gray-500">
                        Unterstützt: YouTube, Vimeo oder direkte Video-Links (MP4, WebM, OGG)
                    </p>
                </div>

                <!-- Video Type -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        Video-Typ
                    </label>
                    <select 
                        x-model="videoSettingsType"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="youtube">YouTube</option>
                        <option value="vimeo">Vimeo</option>
                        <option value="direct">Direktes Video</option>
                    </select>
                </div>

                <!-- Größe -->
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            Breite
                        </label>
                        <input 
                            type="text"
                            x-model="videoSettingsWidth"
                            placeholder="100%"
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            Höhe
                        </label>
                        <input 
                            type="text"
                            x-model="videoSettingsHeight"
                            placeholder="315"
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                    </div>
                </div>

                <!-- Optionen -->
                <div class="space-y-2">
                    <label class="flex items-center">
                        <input 
                            type="checkbox"
                            x-model="videoSettingsAutoplay"
                            class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span class="ml-2 text-sm text-gray-700">Automatisch abspielen</span>
                    </label>
                    <label class="flex items-center">
                        <input 
                            type="checkbox"
                            x-model="videoSettingsLoop"
                            class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span class="ml-2 text-sm text-gray-700">Wiederholen</span>
                    </label>
                    <label class="flex items-center">
                        <input 
                            type="checkbox"
                            x-model="videoSettingsMuted"
                            class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span class="ml-2 text-sm text-gray-700">Stumm</span>
                    </label>
                </div>
            </div>

            <div class="flex justify-end gap-3 mt-6">
                <button 
                    @click="closeVideoSettingsModal()"
                    class="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                    Abbrechen
                </button>
                <button 
                    @click="saveVideoSettings()"
                    class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Speichern
                </button>
            </div>
        </div>
    </div>
</div>
```

## Fertig! 🎉

Jetzt kannst du:
1. Einen Video Block hinzufügen
2. YouTube, Vimeo oder direkte Video-URLs einfügen
3. Video-Einstellungen anpassen
4. Videos in Spalten-Layouts verwenden

## Testen

1. Öffne `index.html` im Browser
2. Klicke auf "+ Block hinzufügen"
3. Wähle "🎥 Video"
4. Klicke auf den Platzhalter
5. Füge eine YouTube-URL ein (z.B. `https://www.youtube.com/watch?v=dQw4w9WgXcQ`)
6. Speichere die Einstellungen

Das Video sollte jetzt eingebettet werden!
