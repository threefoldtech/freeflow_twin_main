<template>
    <div class="p-3 mt-2">
        <audio
            controls
            class="max-w-full"
            :src="calcExternalResourceLink(message.body.url)"
            @load="$emit('scroll')"
        ></audio>
    </div>
</template>

<script lang="ts">
    import { computed, defineComponent } from 'vue';
    import { calcExternalResourceLink } from '@/services/urlService';
    import AudioPlayer from '@/components/AudioPlayer.vue';

    export default defineComponent({
        name: 'AudioContent',
        components: { AudioPlayer },
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
