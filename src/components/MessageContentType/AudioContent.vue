<template>
    <audio
        controls
        class="max-w-full"
        :src="calcExternalResourceLink(message.body.url)"
        @load="$emit('scroll')"
    ></audio>
</template>

<script lang="ts">
    import { computed, defineComponent } from 'vue';
    import { calcExternalResourceLink } from '@/services/urlService';

    export default defineComponent({
        name: 'AudioContent',
        props: {
            message: { type: Object, required: true },
        },
        emits: ['scroll'],
        setup(props) {
            const url = computed(() => {
                return;
            });
            return {
                calcExternalResourceLink,
            };
        },
    });
</script>
