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
    const src = calcExternalResourceLink(props.message.body.url);
    const imageLoaded = () => {
        addScrollEvent();
    };

    const show = () => {
        setImageSrc(src);
    };
</script>
