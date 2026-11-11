<script setup lang="ts">
import type { Question } from './decide';

defineProps<{ node: Question }>();
</script>

<template>
    <div class="k-dn">
        <p class="k-dn__q">{{ node.question }}</p>
        <ul class="k-dn__answers">
            <li v-for="(a, i) in node.answers" :key="i" class="k-dn__answer">
                <span class="k-dn__label">{{ a.label }}</span>
                <DecideNode v-if="a.next" :node="a.next" />
                <span v-else class="k-dn__result" :class="a.tone && `is-${a.tone}`">
                    <a v-if="a.link" :href="a.link">{{ a.result }}</a>
                    <template v-else>{{ a.result }}</template>
                </span>
            </li>
        </ul>
    </div>
</template>

<style scoped>
.k-dn__q {
    margin: 0 !important;
    font-size: 14px;
    font-weight: 600;
    line-height: 1.45;
    color: var(--vp-c-text-1);
}
.k-dn__answers {
    list-style: none;
    margin: 6px 0 0 !important;
    padding: 0 0 0 7px !important;
}
.k-dn__answer {
    position: relative;
    margin: 0 !important;
    padding: 6px 0 4px 22px;
    border-left: 1px solid var(--vp-c-divider);
    display: grid;
    gap: 4px;
}
.k-dn__answer:last-child {
    border-left-color: transparent;
}
/* the elbow from the rail to this answer */
.k-dn__answer::before {
    content: '';
    position: absolute;
    left: -1px;
    top: 0;
    width: 16px;
    height: 17px;
    border-left: 1px solid var(--vp-c-divider);
    border-bottom: 1px solid var(--vp-c-divider);
    border-bottom-left-radius: 6px;
}
.k-dn__label {
    justify-self: start;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.02em;
    text-transform: uppercase;
    color: var(--vp-c-text-3);
}
.k-dn__result {
    justify-self: start;
    padding: 4px 10px;
    border: 1px solid var(--vp-c-divider);
    border-radius: 8px;
    font-size: 13px;
    line-height: 1.45;
    color: var(--vp-c-text-1);
    background: var(--vp-c-bg);
}
.k-dn__result.is-brand {
    border-color: color-mix(in srgb, var(--vp-c-brand-1) 55%, transparent);
    background: var(--vp-c-brand-soft);
}
.k-dn__result.is-danger {
    border-color: color-mix(in srgb, var(--vp-c-danger-1) 45%, transparent);
    background: var(--vp-c-danger-soft);
}
.k-dn__result.is-muted {
    border-style: dashed;
    color: var(--vp-c-text-2);
}
.k-dn__result a {
    color: inherit;
    text-decoration: underline;
    text-underline-offset: 2px;
}
</style>
