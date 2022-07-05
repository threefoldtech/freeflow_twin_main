<template>
    <div class="p-3 mt-2">
        <audio
            :src="calcExternalResourceLink(message.body.url)"
            class="max-w-full"
            controls
            @load="$emit('scroll')"
        ></audio>
    </div>
</template>

<script lang="ts" setup>
    import { computed, defineComponent } from 'vue';
    import { calcExternalResourceLink } from '@/services/urlService';
    import AudioPlayer from '@/components/AudioPlayer.vue';

    interface IProp {
        message: Object;
    }

    const props = defineProps<IProp>();
    const emits = defineEmits(['scroll']);
</script>
