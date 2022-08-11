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
    let msgUrl = props.message.body.url;
    if (!msgUrl) {
        const ownerLocation = props.message.body.owner.location;
        let path = props.message.body.path;
        path = path.replace('/appdata/storage/', '');
        msgUrl = `http://[${ownerLocation}]/api/v2/files/${btoa(path)}`;
    }
    const src = calcExternalResourceLink(msgUrl);
</script>

<style scoped></style>
