<template>
    <component
        :is="contentComponent"
        :message="message"
        :preventRecursion="preventRecursion"
        :type="contentComponent"
    />
</template>

<script lang="ts">
    import { defineComponent } from 'vue';

    import StringContent from '@/components/MessageContentType/StringContent.vue';
    import SystemContent from '@/components/MessageContentType/SystemContent.vue';
    import FileContent from '@/components/MessageContentType/FileContent.vue';
    import AudioContent from '@/components/MessageContentType/AudioContent.vue';
    import ImageContent from '@/components/MessageContentType/ImageContent.vue';
    import GifContent from '@/components/MessageContentType/GifContent.vue';
    import QuoteContent from '@/components/MessageContentType/QuoteContent.vue';
    import { getComponentForType } from '@/services/contentService';

    export default defineComponent({
        name: 'MessageContent',
        components: {
            StringContent,
            SystemContent,
            FileContent,
            AudioContent,
            ImageContent,
            GifContent,
            QuoteContent,
        },
        props: {
            message: {
                type: Object,
                required: true,
            },
            preventRecursion: {
                type: Boolean,
                default: false,
            },
        },
        setup(props) {
            return {
                contentComponent: getComponentForType(props.message),
            };
        },
    });
</script>
