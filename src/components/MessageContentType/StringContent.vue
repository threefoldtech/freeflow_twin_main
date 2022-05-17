<template>
    <span class="pt-2 pl-4 pb-2 pr-8 break-all text-xs" v-html="computedMessage"></span>
</template>

<script lang="ts" setup>
    import { computed } from 'vue';
    import { marked } from 'marked';
    import DOMPurify from 'dompurify';
    import emoji from 'node-emoji';

    // Disclaimer: This is not yet proven to be SAFE, this might contain XSS. Use with caution!
    // const regularExpression = /((http|https):\/\/([a-zA-Z0-9.\/?=&\[\]:\_\-\;\%]+))/g;

    interface IProp {
        message: {
            body: string;
        };
    }

    const props = defineProps<IProp>();
    // const escapeHtml = (unsafeHtml: string) => {
    //     return unsafeHtml
    //         .replace(/&/g, '&amp;')
    //         .replace(/</g, '&lt;')
    //         .replace(/>/g, '&gt;')
    //         .replace(/"/g, '&quot;')
    //         .replace(/'/g, '&#039;');
    // };

    const computedMessage = computed(() => {
        let { body } = props.message;
        const replacer = (match: string) => emoji.emojify(match);
        body = body.replace(/(:.*:)/g, replacer);

        // const words = body.split(' ');
        // words.map(word =>
        //     word.startsWith('@')
        //         ? (body = body.replace(
        //               word,
        //               `<span class="bg-blue-500 text-white px-2 py-1 rounded-sm cursor-pointer hover:bg-blue-400">${word}<span>`
        //           ))
        //         : (body = body)
        // );
        return DOMPurify.sanitize(marked(body));
    });
</script>

<style></style>
