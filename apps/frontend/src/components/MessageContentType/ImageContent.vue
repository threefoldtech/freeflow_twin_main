<template>
    <img :src="src" class="cursor-pointer h-64 object-contain" @click="show" @load="imageLoaded" />
</template>

<script lang="ts" setup>
    import { calcExternalResourceLink } from '@/services/urlService';
    import { useScrollActions } from '@/store/scrollStore';
    import { setImageSrc } from '@/store/imageStore';

    interface IProp {
        message: Object;
    }

    const props = defineProps<IProp>();
    const { addScrollEvent } = useScrollActions();
    let msgUrl = props.message.body.url;
    if (!msgUrl) {
        const ownerLocation = props.message.body.owner.location;
        let path = props.message.body.path;
        path = path.replace('/appdata/storage/', '');
        msgUrl = `http://[${ownerLocation}]/api/v2/files/${btoa(path)}`;
    }
    const src = calcExternalResourceLink(msgUrl);
    const imageLoaded = () => {
        addScrollEvent();
    };

    const show = () => {
        setImageSrc(src);
    };
</script>
