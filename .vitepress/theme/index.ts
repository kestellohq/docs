import DefaultTheme from 'vitepress/theme';
import type { Theme } from 'vitepress';
import './kestello.css';
import Flow from './components/Flow.vue';
import Layers from './components/Layers.vue';
import States from './components/States.vue';
import Decide from './components/Decide.vue';
import Timeline from './components/Timeline.vue';
import Compare from './components/Compare.vue';

export default {
    extends: DefaultTheme,
    enhanceApp({ app }) {
        // diagrams any page can use (see STYLE.md, "Diagrams")
        for (const [name, component] of Object.entries({ Flow, Layers, States, Decide, Timeline, Compare })) {
            app.component(name, component);
        }
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
