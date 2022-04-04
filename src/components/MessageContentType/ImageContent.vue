<template>
    <img :src="src" class="cursor-pointer h-64 object-contain" @click="show" @load="imageLoaded" />
</template>

<script lang="ts" setup>
    import { defineComponent } from 'vue';
    import { calcExternalResourceLink } from '@/services/urlService';
    import { useScrollActions } from '@/store/scrollStore';
    import { setImageSrc } from '@/store/imageStore';

    interface IProp {
        message: Object;
    }

    const props = defineProps<IProp>();
    const { addScrollEvent } = useScrollActions();
    const msgUrl = props.message.body.url;
    const txtToFind = `/api`;
    const apiIdx = msgUrl.indexOf(txtToFind);
    const urlV1 = `${msgUrl.substring(0, apiIdx)}/api/v1${msgUrl.substring(apiIdx + txtToFind.length, msgUrl.length)}`;
    const src = calcExternalResourceLink(urlV1);
    const imageLoaded = () => {
        addScrollEvent();
    };

    const show = () => {
        setImageSrc(src);
    };
</script>
