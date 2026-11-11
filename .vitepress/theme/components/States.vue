<script setup lang="ts">
/**
 * A lifecycle: the states something can be in, and what moves it from one
 * to the next, labelled with the admin's own buttons.
 *
 *   const statuses = [
 *       { id: 'draft', title: 'Draft', text: 'Only people who can edit see it.' },
 *       { id: 'published', title: 'Published', tone: 'brand' },
 *   ];
 *   const moves = [{ from: 'draft', to: 'published', label: 'Publish' }];
 *   <States :states="statuses" :moves="moves" caption="…" />
 *
 * Each state is a card listing where it can go next, so the whole machine
 * reads top to bottom and aloud, with no lines to follow.
 */
import { computed } from 'vue';

export interface State {
    id: string;
    title: string;
    text?: string;
    /** brand: where things usually end up; muted: the way out, such as Trash */
    tone?: 'brand' | 'muted';
}
export interface Move {
    from: string;
    to: string;
    /** the button or event that makes the move */
    label: string;
    /** who or when, in a few words: "an editor", "at the time set" */
    note?: string;
}

const props = defineProps<{ states: State[]; moves: Move[]; caption?: string }>();
const byId = computed(() => new Map(props.states.map((s) => [s.id, s])));
const out = (id: string) => props.moves.filter((m) => m.from === id);
</script>

<template>
    <figure class="k-states">
        <ul class="k-states__list">
            <li v-for="state in states" :id="`state-${state.id}`" :key="state.id" class="k-states__state" :class="state.tone && `is-${state.tone}`">
                <span class="k-states__head">
                    <span class="k-states__pill">{{ state.title }}</span>
                    <span v-if="state.text" class="k-states__text">{{ state.text }}</span>
                </span>
                <ul v-if="out(state.id).length" class="k-states__moves">
                    <li v-for="(move, i) in out(state.id)" :key="i">
                        <span class="k-states__label">{{ move.label }}</span>
                        <span class="k-states__arrow" aria-hidden="true">→</span>
                        <span class="k-states__to" :class="byId.get(move.to)?.tone && `is-${byId.get(move.to)?.tone}`">{{ byId.get(move.to)?.title ?? move.to }}</span>
                        <span v-if="move.note" class="k-states__note">{{ move.note }}</span>
                    </li>
                </ul>
            </li>
        </ul>
        <figcaption v-if="caption">{{ caption }}</figcaption>
    </figure>
</template>

<style scoped>
.k-states {
    margin: 28px 0;
}
.k-states__list {
    list-style: none;
    margin: 0 !important;
    padding: 0 !important;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
    gap: 10px;
}
.k-states__state {
    margin: 0 !important;
    display: grid;
    align-content: start;
    gap: 10px;
    padding: 14px;
    border: 1px solid var(--vp-c-divider);
    border-radius: 12px;
    background: var(--vp-c-bg-soft);
}
.k-states__state.is-brand {
    border-color: color-mix(in srgb, var(--vp-c-brand-1) 55%, transparent);
}
.k-states__state.is-muted {
    border-style: dashed;
    background: transparent;
}
.k-states__head {
    display: grid;
    gap: 6px;
}
.k-states__pill,
.k-states__to {
    justify-self: start;
    padding: 1px 9px;
    border-radius: 999px;
    font-size: 13px;
    font-weight: 600;
    line-height: 1.6;
    color: var(--vp-c-text-1);
    background: var(--vp-c-default-soft);
}
.is-brand > .k-states__head .k-states__pill,
.k-states__to.is-brand {
    color: var(--vp-c-brand-1);
    background: var(--vp-c-brand-soft);
}
.is-muted > .k-states__head .k-states__pill,
.k-states__to.is-muted {
    color: var(--vp-c-text-2);
    background: transparent;
    outline: 1px dashed var(--vp-c-divider);
}
.k-states__text {
    font-size: 13px;
    line-height: 1.5;
    color: var(--vp-c-text-2);
}
.k-states__moves {
    list-style: none;
    margin: 0 !important;
    padding: 10px 0 0 !important;
    border-top: 1px solid var(--vp-c-divider);
    display: grid;
    gap: 6px;
}
.k-states__moves li {
    margin: 0 !important;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 4px 6px;
    font-size: 13px;
    line-height: 1.4;
}
.k-states__label {
    font-weight: 600;
    color: var(--vp-c-text-1);
}
.k-states__arrow {
    color: var(--vp-c-text-3);
}
.k-states__to {
    font-size: 12px;
    font-weight: 500;
}
.k-states__note {
    flex-basis: 100%;
    font-size: 12px;
    color: var(--vp-c-text-3);
}
.k-states figcaption {
    margin-top: 14px;
    font-size: 13px;
    color: var(--vp-c-text-3);
    text-align: center;
}
</style>
