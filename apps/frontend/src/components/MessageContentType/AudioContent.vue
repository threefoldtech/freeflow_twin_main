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
    import { calcExternalResourceLink } from '@/services/urlService';

    interface IProp {
        message: Object;
    }

    const props = defineProps<IProp>();
    const emits = defineEmits(['scroll']);
</script>
