<template>
    <div
        id="image-viewer"
        class="fixed z-10 left-0 top-0 w-full h-full overflow-auto bg-black bg-opacity-90 flex"
        v-if='src'
        @click="close"
        tabindex="0"
        @keydown.esc="close"
        v-focus
    >
        <div class="absolute w-full top-4 left-0 flex justify-end md:pr-8">
            <a class="cursor-pointer text-gray-100 size hover:text-accent mr-4" :href='src' :download='src.split("/").reverse()[0]'>
                <i class="fas fa-download fa-2x"></i>
            </a>
            <button class="cursor-pointer text-gray-100 size hover:text-gray-500" @click="close">
                <i class="fas fa-times fa-2x"></i>
            </button>
        </div>

        <img class="modal-content m-auto block md:max-w-80p md:max-h-80p max-w-full max-w-full self-center" id="full-image" :src="src" />
    </div>
</template>

<script lang="ts">
    import { defineComponent, onMounted } from 'vue';
    import { clearImageSrc, getImageSrc } from '@/store/imageStore';

    export default defineComponent({
        name: 'ImagePreview',
        setup() {
            const close = () => {
                clearImageSrc();
            };

            return {
                close,
                src: getImageSrc(),
            };
        },
    });
</script>

<style scoped>
    @media (min-width: 768px) {
        .md\:max-w-80p {     max-width: 80%;   }
        .md\:max-h-80p {     max-height: 80%;   }
    }
</style>
