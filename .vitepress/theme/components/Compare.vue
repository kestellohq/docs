<script setup lang="ts">
/**
 * Two (or three) cases side by side: before and after, this host or that,
 * one database or another. Each column has a title, a tone and lines, with
 * code written as code.
 *
 *   <Compare :columns="[
 *       { title: 'Before', items: ['/services/web-design'] },
 *       { title: 'After', tone: 'brand', items: ['/what-we-do/web-design'] },
 *   ]" caption="…" />
 *
 * A line in backticks (`like this`) is shown as code. Columns stack on a phone.
 */
export interface Column {
    title: string;
    text?: string;
    items?: string[];
    tone?: 'brand' | 'danger' | 'muted';
}

defineProps<{ columns: Column[]; caption?: string; arrow?: boolean }>();
const code = (line: string) => /^`[^`]+`$/.test(line);
</script>

<template>
    <figure class="k-compare" :class="{ 'has-arrow': arrow }">
        <div class="k-compare__cols" :style="{ '--n': columns.length }">
            <section v-for="(c, i) in columns" :key="i" class="k-compare__col" :class="c.tone && `is-${c.tone}`">
                <h4 class="k-compare__title">{{ c.title }}</h4>
                <p v-if="c.text" class="k-compare__text">{{ c.text }}</p>
                <ul v-if="c.items?.length" class="k-compare__items">
                    <li v-for="(item, j) in c.items" :key="j">
                        <code v-if="code(item)">{{ item.slice(1, -1) }}</code>
                        <template v-else>{{ item }}</template>
                    </li>
                </ul>
            </section>
        </div>
        <figcaption v-if="caption">{{ caption }}</figcaption>
    </figure>
</template>

<style scoped>
.k-compare {
    margin: 28px 0;
}
.k-compare__cols {
    display: grid;
    grid-template-columns: repeat(var(--n), minmax(0, 1fr));
    gap: 12px;
}
.has-arrow .k-compare__cols {
    gap: 30px;
}
.k-compare__col {
    position: relative;
    padding: 14px 16px;
    border: 1px solid var(--vp-c-divider);
    border-radius: 12px;
    background: var(--vp-c-bg-soft);
}
.has-arrow .k-compare__col:not(:last-child)::after {
    content: '→';
    position: absolute;
    right: -22px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--vp-c-text-3);
}
.k-compare__col.is-brand {
    border-color: color-mix(in srgb, var(--vp-c-brand-1) 55%, transparent);
    background: var(--vp-c-brand-soft);
}
.k-compare__col.is-danger {
    border-color: color-mix(in srgb, var(--vp-c-danger-1) 45%, transparent);
    background: var(--vp-c-danger-soft);
}
.k-compare__col.is-muted {
    border-style: dashed;
    background: transparent;
}
.k-compare__title {
    margin: 0 0 6px !important;
    padding: 0 !important;
    border: 0 !important;
    font-size: 14px !important;
    line-height: 1.4;
    color: var(--vp-c-text-1);
}
.k-compare__text {
    margin: 0 0 8px !important;
    font-size: 13px;
    line-height: 1.5;
    color: var(--vp-c-text-2);
}
.k-compare__items {
    list-style: none;
    margin: 0 !important;
    padding: 0 !important;
    display: grid;
    gap: 4px;
}
.k-compare__items li {
    margin: 0 !important;
    font-size: 13px;
    line-height: 1.5;
    color: var(--vp-c-text-1);
}
.k-compare__items code {
    font-size: 12px;
}
.k-compare figcaption {
    margin-top: 14px;
    font-size: 13px;
    color: var(--vp-c-text-3);
    text-align: center;
}
@media (max-width: 640px) {
    .k-compare__cols {
        grid-template-columns: 1fr;
    }
    .has-arrow .k-compare__col:not(:last-child)::after {
        content: '↓';
        right: auto;
        left: 50%;
        top: auto;
        bottom: -26px;
        transform: translateX(-50%);
    }
}
</style>
