<template>
    <span class=" pt-2 pl-4 pb-2 pr-8 " v-html="computedMessage"></span>
</template>

<script lang="ts">
    // Disclaimer: This is not yet proven to be SAFE, this might contain XSS. Use with caution!
    import { computed, defineComponent } from 'vue';

    const regularExpression = /((http|https):\/\/([a-zA-Z0-9.\/?=&\[\]:\_\-\;\%]+))/g;

    export default defineComponent({
        name: 'StringContent',
        props: {
            message: { type: Object, required: true },
        },
        setup(props) {
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

            return { computedMessage };
        },
    });
</script>

<style></style>
