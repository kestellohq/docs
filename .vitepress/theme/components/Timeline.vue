<script setup lang="ts">
/**
 * Points in time on one line, each with when, what and why: retries,
 * nightly tasks, the days around a launch. Times come from the code.
 *
 *   <Timeline :points="[
 *       { at: 'At once', title: 'First try' },
 *       { at: '+1 min', title: 'Second try' },
 *       { at: 'After 6 tries', title: 'Given up', tone: 'danger' },
 *   ]" caption="…" />
 *
 * Horizontal on a wide screen when there are up to six points, otherwise
 * top to bottom.
 */
import { computed } from 'vue';

export interface Point {
    at: string;
    title: string;
    text?: string;
    tone?: 'brand' | 'danger' | 'muted';
}

const props = defineProps<{ points: Point[]; caption?: string; vertical?: boolean }>();
const column = computed(() => props.vertical || props.points.length > 6);
</script>

<template>
    <figure class="k-time" :class="{ 'is-column': column }">
        <ol class="k-time__points">
            <li v-for="(p, i) in points" :key="i" class="k-time__point" :class="p.tone && `is-${p.tone}`">
                <span class="k-time__at">{{ p.at }}</span>
                <span class="k-time__dot" aria-hidden="true"></span>
                <span class="k-time__body">
                    <strong>{{ p.title }}</strong>
                    <span v-if="p.text" class="k-time__text">{{ p.text }}</span>
                </span>
            </li>
        </ol>
        <figcaption v-if="caption">{{ caption }}</figcaption>
    </figure>
</template>

<style scoped>
.k-time {
    margin: 28px 0;
}
.k-time__points {
    list-style: none;
    margin: 0 !important;
    padding: 18px 16px 14px !important;
    border: 1px solid var(--vp-c-divider);
    border-radius: 12px;
    background: var(--vp-c-bg-soft);
}
.k-time__point {
    position: relative;
    margin: 0 !important;
}
.k-time__at {
    font-size: 12px;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
    color: var(--vp-c-text-3);
}
.k-time__dot {
    display: block;
    width: 11px;
    height: 11px;
    border-radius: 50%;
    border: 2px solid var(--vp-c-text-3);
    background: var(--vp-c-bg-soft);
    position: relative;
    z-index: 1;
}
.is-brand .k-time__dot {
    border-color: var(--vp-c-brand-1);
    background: var(--vp-c-brand-1);
}
.is-danger .k-time__dot {
    border-color: var(--vp-c-danger-1);
    background: var(--vp-c-danger-1);
}
.is-muted .k-time__dot {
    border-style: dashed;
}
.k-time__body {
    display: grid;
    gap: 2px;
    font-size: 13px;
    line-height: 1.45;
    color: var(--vp-c-text-1);
}
.k-time__text {
    color: var(--vp-c-text-2);
}
.k-time figcaption {
    margin-top: 14px;
    font-size: 13px;
    color: var(--vp-c-text-3);
    text-align: center;
}

/* across: time above a line, what happens below */
.k-time:not(.is-column) .k-time__points {
    display: grid;
    grid-auto-flow: column;
    grid-auto-columns: minmax(0, 1fr);
    gap: 12px;
}
.k-time:not(.is-column) .k-time__point {
    display: grid;
    grid-template-rows: auto auto 1fr;
    gap: 8px;
}
.k-time:not(.is-column) .k-time__point:not(:last-child)::after {
    content: '';
    position: absolute;
    top: calc(1.5em + 9px);
    left: 11px;
    right: -12px;
    height: 2px;
    background: var(--vp-c-divider);
}

/* down: time on the left, a rail in the middle */
.k-time.is-column .k-time__point {
    display: grid;
    grid-template-columns: 7.5em 11px 1fr;
    gap: 12px;
    padding-bottom: 14px;
}
.k-time.is-column .k-time__at {
    text-align: right;
    padding-top: 1px;
}
.k-time.is-column .k-time__dot {
    margin-top: 4px;
}
.k-time.is-column .k-time__point:not(:last-child)::after {
    content: '';
    position: absolute;
    left: calc(7.5em + 12px + 4.5px);
    top: 17px;
    bottom: 0;
    width: 2px;
    background: var(--vp-c-divider);
}
@media (max-width: 640px) {
    .k-time:not(.is-column) .k-time__points {
        grid-auto-flow: row;
    }
    .k-time:not(.is-column) .k-time__point {
        grid-template-rows: none;
        grid-template-columns: 6em 11px 1fr;
        gap: 12px;
        padding-bottom: 14px;
    }
    .k-time:not(.is-column) .k-time__at {
        text-align: right;
    }
    .k-time:not(.is-column) .k-time__dot {
        margin-top: 4px;
    }
    .k-time:not(.is-column) .k-time__point:not(:last-child)::after {
        top: 17px;
        bottom: 0;
        left: calc(6em + 12px + 4.5px);
        right: auto;
        width: 2px;
        height: auto;
    }
}
</style>
