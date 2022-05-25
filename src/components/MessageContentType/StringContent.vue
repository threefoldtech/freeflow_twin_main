<template>
    <span class="pt-2 pl-4 pb-2 pr-8 break-all text-sm" v-html="computedMessage"></span>
</template>

<script lang="ts" setup>
    import { computed } from 'vue';

    // Disclaimer: This is not yet proven to be SAFE, this might contain XSS. Use with caution!
    const regularExpression = /((http|https):\/\/([a-zA-Z0-9.\/?=&\[\]:\_\-\;\%]+))/g;

    interface IProp {
        message: Object;
    }

    const props = defineProps<IProp>();
    const escapeHtml = (unsafeHtml: string) => {
        return unsafeHtml
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    };

    const computedMessage = computed(() => {
        let escapedHtml = escapeHtml(`${props.message.body}`);
        const matches = escapedHtml.match(regularExpression);

        if (matches === null) {
            return escapedHtml;
        }

        escapedHtml = escapedHtml.replace(
            regularExpression,
            `<a class='hover:underline' href='$1' target='_BLANK'>$1</a>`
        );

        return escapedHtml;
    });
</script>

<style></style>
