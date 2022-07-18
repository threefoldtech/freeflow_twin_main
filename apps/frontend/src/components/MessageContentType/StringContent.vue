<template>
    <span class="pt-2 pl-4 pb-2 pr-8 break-all text-sm" v-html="computedMessage"></span>
</template>

<script lang="ts" setup>
    import { computed, onBeforeMount } from 'vue';
    import { marked } from 'marked';
    import DOMPurify from 'dompurify';
    import emoji from 'node-emoji';
    import { getPreview } from '@/store/chatStore';

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

        const markedBody = marked(body);
        const sanitizedBody = DOMPurify.sanitize(markedBody);

        const link = getLinkFromString(sanitizedBody);

        console.log(link);

        getPreview(getLinkFromString(sanitizedBody));

        return DOMPurify.sanitize(marked(body));
    });

    onBeforeMount(async () => {
        await getPreview('http://jimber.io');
    });

    const getLinkFromString = (body: string) => {
        const regex = /href="([^"]*)/;

        return body.match(regex)[1];
    };
</script>

<style></style>
