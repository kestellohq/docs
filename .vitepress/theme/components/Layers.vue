<script setup lang="ts">
/**
 * Layers stacked top to bottom: what sits on what, and what each one adds.
 *
 *   <Layers :layers="[
 *       { title: 'Your edit', text: 'Settings → Emails', tone: 'brand' },
 *       { title: 'The theme', items: ['colours', 'font'] },
 *       { title: 'Kestello', text: 'The words every email starts with' },
 *   ]" caption="Where an email's look and words come from" />
 *
 * The top layer is the one a reader sees first; each one wins over those
 * below it. A real list, like Flow.
 */
export interface Layer {
    title: string;
    text?: string;
    /** small labels for what the layer holds */
    items?: string[];
    tone?: 'brand' | 'muted';
}

defineProps<{ layers: Layer[]; caption?: string }>();
</script>

<template>
    <figure class="k-layers">
        <ul class="k-layers__list">
            <li v-for="(layer, i) in layers" :key="i" class="k-layers__layer" :class="layer.tone && `is-${layer.tone}`">
                <span class="k-layers__head">
                    <strong>{{ layer.title }}</strong>
                    <span v-if="layer.text" class="k-layers__text">{{ layer.text }}</span>
                </span>
                <span v-if="layer.items?.length" class="k-layers__items">
                    <span v-for="item in layer.items" :key="item" class="k-layers__item">{{ item }}</span>
                </span>
            </li>
        </ul>
        <figcaption v-if="caption">{{ caption }}</figcaption>
    </figure>
</template>

<style scoped>
.k-layers {
    margin: 24px 0;
}
.k-layers__list {
    list-style: none;
    margin: 0 !important;
    padding: 0 !important;
    display: grid;
    gap: 6px;
}
.k-layers__layer {
    margin: 0 !important;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 8px 16px;
    padding: 12px 16px;
    border: 1px solid var(--vp-c-divider);
    border-radius: 10px;
    background: var(--vp-c-bg-soft);
}
/* each layer a little narrower than the one under it reads as a stack */
.k-layers__layer:nth-child(1) {
    margin-inline: 24px !important;
}
.k-layers__layer:nth-child(2) {
    margin-inline: 12px !important;
}
.k-layers__head {
    display: grid;
    gap: 2px;
    font-size: 14px;
    color: var(--vp-c-text-1);
}
.k-layers__text {
    font-size: 13px;
    color: var(--vp-c-text-2);
}
.k-layers__items {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
}
.k-layers__item {
    padding: 2px 8px;
    border: 1px solid var(--vp-c-divider);
    border-radius: 999px;
    font-size: 12px;
    color: var(--vp-c-text-2);
    background: var(--vp-c-bg);
}
.k-layers__layer.is-brand {
    border-color: var(--vp-c-brand-1);
    background: var(--vp-c-brand-soft);
}
.k-layers__layer.is-muted {
    border-style: dashed;
    background: transparent;
}
.k-layers figcaption {
    margin-top: 10px;
    font-size: 13px;
    color: var(--vp-c-text-3);
    text-align: center;
}
@media (max-width: 640px) {
    .k-layers__layer:nth-child(1),
    .k-layers__layer:nth-child(2) {
        margin-inline: 0 !important;
    }
}
</style>
