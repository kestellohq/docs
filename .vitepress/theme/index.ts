import DefaultTheme from 'vitepress/theme';
import type { Theme } from 'vitepress';
import './kestello.css';
import Flow from './components/Flow.vue';
import Layers from './components/Layers.vue';

export default {
    extends: DefaultTheme,
    enhanceApp({ app }) {
        // diagrams any page can use: <Flow :steps="…" /> and <Layers :layers="…" /> (see STYLE.md)
        app.component('Flow', Flow);
        app.component('Layers', Layers);
        if (typeof window === 'undefined') {
            return;
        }
        // A screenshot opens full size in a new tab: they are taken at twice the screen's
        // resolution, so the small labels can be read there.
        window.addEventListener('click', (event) => {
            const img = (event.target as Element | null)?.closest?.('.vp-doc img');
            if (img instanceof HTMLImageElement && img.src.includes('/screenshots/')) {
                window.open(img.src, '_blank', 'noopener');
            }
        });
    },
} satisfies Theme;
