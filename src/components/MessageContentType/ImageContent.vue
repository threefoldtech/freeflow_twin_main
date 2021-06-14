<template>
    <img width="450" :src="src" @load="imageLoaded" class="cursor-pointer" @click='show' />
</template>

<script lang="ts">
    import { defineComponent } from 'vue';
    import { calcExternalResourceLink } from '@/services/urlService';
    import { useScrollActions } from '@/store/scrollStore';
    import { setImageSrc } from '@/store/imageStore';

    export default defineComponent({
        name: 'ImageContent',
        props: {
            message: { type: Object, required: true },
        },
        setup(props) {
            const { addScrollEvent } = useScrollActions();
            const src = calcExternalResourceLink(props.message.body.url)
            const imageLoaded = () => {
                addScrollEvent();
            };

            const show = () => {
                setImageSrc(src);
            };

            return { imageLoaded, show, src};
        },
    });
</script>
