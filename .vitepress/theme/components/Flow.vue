<script setup lang="ts">
import { computed } from 'vue';

/**
 * Steps in order, joined by arrows: what happens, one box per step.
 *
 *   In the page's script setup block:
 *       const sending = [
 *           { title: 'Build', text: 'The code writes the email.' },
 *           { title: 'Your edit', text: 'Settings → Emails, in the reader’s language.', tone: 'brand' },
 *           { title: 'Send', note: 'A plugin can stop it here.' },
 *       ];
 *   and where it goes:
 *       <Flow :steps="sending" caption="How an email is sent" />
 *
 * Up to four steps sit in a row on a wide screen; more, or `vertical`, run
 * top to bottom, and every flow does on a phone. The steps are a real list,
 * so they are read aloud, found by search and translated with the page.
 */
export interface FlowStep {
    title: string;
    text?: string;
    /** brand: the step the page is about; muted: optional or skipped */
    tone?: 'brand' | 'muted';
    /** a side note under the step, such as where it can stop */
    note?: string;
    /** what happens instead when this step fails: "If it fails: …" */
    fail?: string;
}

const props = withDefaults(defineProps<{ steps: FlowStep[]; caption?: string; vertical?: boolean; failLabel?: string }>(), { failLabel: 'If it fails:' });
// a failure branch needs the room of a timeline
const column = computed(() => props.vertical || props.steps.length > 4 || props.steps.some((s) => s.fail));
</script>

<template>
    <figure class="k-flow" :class="{ 'is-column': column }">
        <ol class="k-flow__steps">
            <li v-for="(step, i) in steps" :key="i" class="k-flow__step" :class="step.tone && `is-${step.tone}`">
                <span class="k-flow__n" aria-hidden="true">{{ i + 1 }}</span>
                <span class="k-flow__body">
                    <strong class="k-flow__title">{{ step.title }}</strong>
                    <span v-if="step.text" class="k-flow__text">{{ step.text }}</span>
                    <span v-if="step.note" class="k-flow__note">{{ step.note }}</span>
                    <span v-if="step.fail" class="k-flow__fail"><span class="k-flow__fail-label">{{ failLabel }}</span> {{ step.fail }}</span>
                </span>
            </li>
        </ol>
        <figcaption v-if="caption">{{ caption }}</figcaption>
    </figure>
</template>

<style scoped>
.k-flow {
    margin: 28px 0;
}
.k-flow__steps {
    list-style: none;
    margin: 0 !important;
    padding: 0 !important;
}
.k-flow__step {
    position: relative;
    margin: 0 !important;
}
.k-flow__n {
    flex: none;
    display: grid;
    place-items: center;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    font-size: 12px;
    font-weight: 600;
    line-height: 1;
    font-variant-numeric: tabular-nums;
    color: var(--vp-c-text-2);
    background: var(--vp-c-bg);
    border: 1px solid var(--vp-c-divider);
}
.k-flow__body {
    display: grid;
    gap: 2px;
    min-width: 0;
}
.k-flow__title {
    font-size: 14px;
    line-height: 1.4;
    color: var(--vp-c-text-1);
}
.k-flow__text {
    font-size: 13px;
    line-height: 1.5;
    color: var(--vp-c-text-2);
}
.k-flow__note {
    justify-self: start;
    margin-top: 6px;
    padding: 2px 8px;
    border: 1px dashed var(--vp-c-divider);
    border-radius: 6px;
    font-size: 12px;
    line-height: 1.5;
    color: var(--vp-c-text-2);
}
.k-flow__step.is-brand .k-flow__n {
    color: var(--vp-c-white, #fff);
    background: var(--vp-c-brand-1);
    border-color: var(--vp-c-brand-1);
}
.dark .k-flow__step.is-brand .k-flow__n {
    color: var(--vp-c-bg);
}
.k-flow__fail {
    justify-self: start;
    margin-top: 6px;
    padding: 3px 9px;
    border-left: 2px solid var(--vp-c-danger-1);
    border-radius: 0 6px 6px 0;
    font-size: 12px;
    line-height: 1.5;
    color: var(--vp-c-text-2);
    background: var(--vp-c-danger-soft);
}
.k-flow__fail-label {
    font-weight: 600;
    color: var(--vp-c-danger-1);
}
.k-flow__step.is-muted .k-flow__n {
    border-style: dashed;
}
.k-flow__step.is-muted .k-flow__title {
    color: var(--vp-c-text-2);
}
.k-flow figcaption {
    margin-top: 14px;
    font-size: 13px;
    color: var(--vp-c-text-3);
    text-align: center;
}

/* a row of cards with arrows: up to four steps on a wide screen */
.k-flow:not(.is-column) .k-flow__steps {
    display: grid;
    grid-auto-flow: column;
    grid-auto-columns: minmax(0, 1fr);
    gap: 28px;
}
.k-flow:not(.is-column) .k-flow__step {
    display: flex;
    gap: 10px;
    align-items: flex-start;
    padding: 14px;
    border: 1px solid var(--vp-c-divider);
    border-radius: 12px;
    background: var(--vp-c-bg-soft);
}
.k-flow:not(.is-column) .k-flow__step.is-brand {
    border-color: color-mix(in srgb, var(--vp-c-brand-1) 55%, transparent);
    background: var(--vp-c-brand-soft);
}
.k-flow:not(.is-column) .k-flow__step.is-muted {
    border-style: dashed;
    background: transparent;
}
.k-flow:not(.is-column) .k-flow__step:not(:last-child)::after {
    content: '';
    position: absolute;
    top: 50%;
    right: -23px;
    width: 18px;
    height: 18px;
    transform: translateY(-50%);
    background: var(--vp-c-text-3);
    -webkit-mask: var(--k-arrow) center / contain no-repeat;
    mask: var(--k-arrow) center / contain no-repeat;
    --k-arrow: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M4 12h14m-5-5 5 5-5 5' fill='none' stroke='%23000' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
}

/* a timeline: a rail with a node per step, for many steps or a narrow screen */
.k-flow.is-column .k-flow__steps {
    padding: 18px 20px 6px !important;
    border: 1px solid var(--vp-c-divider);
    border-radius: 12px;
    background: var(--vp-c-bg-soft);
}
.k-flow.is-column .k-flow__step {
    display: flex;
    gap: 14px;
    padding-bottom: 16px;
}
.k-flow.is-column .k-flow__step:not(:last-child)::before {
    content: '';
    position: absolute;
    left: 11.5px;
    top: 26px;
    bottom: 2px;
    width: 1px;
    background: var(--vp-c-divider);
}
.k-flow.is-column .k-flow__step.is-brand .k-flow__body {
    margin: -6px 0 0 -6px;
    padding: 6px 10px 8px;
    border-radius: 8px;
    background: var(--vp-c-brand-soft);
}
.k-flow.is-column .k-flow__body {
    padding-top: 2px;
}
@media (max-width: 640px) {
    .k-flow:not(.is-column) .k-flow__steps {
        grid-auto-flow: row;
        gap: 24px;
    }
    .k-flow:not(.is-column) .k-flow__step:not(:last-child)::after {
        top: auto;
        right: auto;
        left: 22px;
        bottom: -22px;
        transform: rotate(90deg);
    }
}
</style>
