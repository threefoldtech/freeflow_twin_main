<template>
    <video controls>
        <source :src="src" />
    </video>
</template>

<script lang="ts" setup>
    import { calcExternalResourceLink } from '@/services/urlService';
    import { Message, MessageBodyType, SharedFileInterface } from '@/types';
    import { getMsgUrl } from '@/store/fileBrowserStore';

    interface IProp {
        message: Message<MessageBodyType | SharedFileInterface>;
    }

    const props = defineProps<IProp>();

    const src = calcExternalResourceLink(getMsgUrl(props.message.body));
</script>

<style scoped></style>
