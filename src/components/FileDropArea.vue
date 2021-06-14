<template>
    <div
        class='relative '
        @dragenter='handleDragEnter'
        @dragover='handleDragOver'
        @drop='handleDrop'
    >
        <div
            class='hidden md:flex justify-center items-center absolute top-0 left-0 w-full h-full z-50'
            v-if='show || showOverlay'
            :class='{ "bg-opacity-75 bg-gray-500": showOverlay }'
            @dragleave='handleDragLeave'
        >
            <div
                class='flex border-dashed border-4 w-80 h-40 bg-accent border-white justify-center items-center flex-col bg-opacity-75 pointer-events-none'>
                <div class=''>
                    <i class='fas fa-file fa-3x text-white'></i>
                </div>
                <p class='text-white text-lg bold'>Drag and drop files here</p>
            </div>
        </div>
        <slot class='pointer-events-none'></slot>
    </div>
</template>

<script lang='ts'>
    import { defineComponent, ref } from 'vue';

    export default defineComponent({
        props: {
          show: {type: Boolean}
        },
        name: 'FileDropArea',
        emits: ['send-file'],
        setup(props, {emit}) {
            const showOverlay = ref();

            const highLight = () => {
                showOverlay.value = true;
            };

            const unHighLight = () => {
                showOverlay.value = false;
            };

            function preventDefaults(e) {
                e.preventDefault();
                e.stopPropagation();
            }

            const handleDragEnter = (e) => {
                preventDefaults(e);
                highLight();
            };

            const handleDragOver = (e) => {
                preventDefaults(e);
                highLight();
            };

            const handleDragLeave = (e) => {
                preventDefaults(e);
                unHighLight();
            };

            const handleDrop = (e) => {
                preventDefaults(e);
                unHighLight();
                const files = e?.dataTransfer?.files;
                if(!files) return;
                emit("send-file", Array.from(files));
            };

            return {
                showOverlay,
                handleDragEnter,
                handleDrop,
                handleDragLeave,
                handleDragOver,
            };
        },
    });
</script>

<style scoped>
    addpointerevents * {

    }
</style>