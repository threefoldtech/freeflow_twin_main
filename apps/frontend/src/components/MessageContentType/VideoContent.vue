<template>
    <video controls>
        <source :src="src" />
    </video>
</template>

<script lang="ts" setup>
    import { calcExternalResourceLink } from '@/services/urlService';
    import { Message, MessageBodyType } from '@/types';

    interface IProp {
        message: Message<MessageBodyType>;
    }

    const props = defineProps<IProp>();
    const msgUrl = props.message.body.url;
    const src = calcExternalResourceLink(msgUrl);
</script>

<style scoped></style>
