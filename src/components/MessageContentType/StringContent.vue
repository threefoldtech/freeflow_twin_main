<template>
    <span class="pt-2 pl-4 pb-2 pr-8 break-all text-sm" v-html="computedMessage"></span>
</template>

<script lang="ts" setup>
    import { computed } from 'vue';
    import { marked } from 'marked';
    import DOMPurify from 'dompurify';
    import emoji from 'node-emoji';

    interface IProp {
        message: {
            body: string;
        };
    }

    const props = defineProps<IProp>();
    let { body } = props.message;
    const replacer = (match: string) => emoji.emojify(match);
    const words = body.split(' ');

    const computedMessage = computed(() => {
        body = body.replace(/(:.*:)/g, replacer);
        words.map(word =>
            word.startsWith('@')
                ? (body = body.replace(
                      word,
                      `<span class="bg-blue-400 text-white p-1 text-sm rounded-sm cursor-pointer hover:bg-blue-500">${word}</span>`
                  ))
                : (body = body)
        );
        return DOMPurify.sanitize(marked(body));
    });
</script>

<style></style>
