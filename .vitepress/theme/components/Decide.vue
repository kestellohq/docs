<script setup lang="ts">
/**
 * A decision: a question, its answers, and where each one leads (another
 * question, or an outcome). A nested list drawn as a tree.
 *
 *   const request = {
 *       question: 'Is there a page at this address?',
 *       answers: [
 *           { label: 'Yes', result: 'The page is shown.', tone: 'brand' },
 *           { label: 'No', next: { question: 'Does a redirect match?', answers: [...] } },
 *       ],
 *   };
 *   <Decide :tree="request" caption="…" />
 *
 * An outcome can link to the section that explains it.
 */
import DecideNode from './DecideNode.vue';
import type { Question } from './decide';

defineProps<{ tree: Question; caption?: string }>();
</script>

<template>
    <figure class="k-decide">
        <div class="k-decide__box">
            <DecideNode :node="tree" />
        </div>
        <figcaption v-if="caption">{{ caption }}</figcaption>
    </figure>
</template>

<style scoped>
.k-decide {
    margin: 28px 0;
}
.k-decide__box {
    padding: 16px 18px;
    border: 1px solid var(--vp-c-divider);
    border-radius: 12px;
    background: var(--vp-c-bg-soft);
    overflow-x: auto;
}
.k-decide figcaption {
    margin-top: 14px;
    font-size: 13px;
    color: var(--vp-c-text-3);
    text-align: center;
}
</style>
