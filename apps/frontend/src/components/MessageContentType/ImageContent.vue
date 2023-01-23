<template>
    <img :src="src" class="cursor-pointer h-64 object-contain" @click="show" @load="imageLoaded" />
</template>

<script lang="ts" setup>
    import { calcExternalResourceLink } from '@/services/urlService';
    import { setImageSrc } from '@/store/imageStore';
    import { Message, MessageBodyType, SharedFileInterface } from '@/types';
    import { getMsgUrl } from '@/store/fileBrowserStore';

    interface IProp {
        message: Message<MessageBodyType | SharedFileInterface>;
    }

    const props = defineProps<IProp>();

    const src = calcExternalResourceLink(getMsgUrl(props.message.body));

    const show = () => {
        setImageSrc(src);
    };
</script>
