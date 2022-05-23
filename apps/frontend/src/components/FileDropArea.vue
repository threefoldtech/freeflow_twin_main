<template>
    <div class="relative" @dragenter="handleDragEnter" @dragover="handleDragOver" @drop="handleDrop">
        <div
            v-if="show || showOverlay"
            :class="{ 'bg-accent-200/75': showOverlay }"
            class="hidden md:flex justify-center items-center absolute top-0 left-0 w-full h-full z-50 p-8"
            @dragleave="handleDragLeave"
        >
            <div
                class="flex border-dashed border-8 w-full h-full border-accent-800/50 justify-center items-center flex-col pointer-events-none rounded-lg bg-white/25"
            >
                <p class="text-accent-800/50 text-xl font-bold">Drag and drop files here</p>
            </div>
        </div>
        <slot class="pointer-events-none"></slot>
    </div>
</template>

<script lang="ts" setup>
    import { ref } from 'vue';

    interface IProps {
        show: boolean;
    }

    const props = defineProps<IProps>();
    const emit = defineEmits(['send-file']);
    const showOverlay = ref();

    const highLight = () => {
        showOverlay.value = true;
    };

    const unHighLight = () => {
        showOverlay.value = false;
    };

    const dragContainsFiles = e => {
        const dt = e?.dataTransfer;
        return dt?.types && (dt.types.indexOf ? dt.types.indexOf('Files') !== -1 : dt.types.contains('Files'));
    };

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    const handleDragEnter = e => {
        preventDefaults(e);
        if (!dragContainsFiles(e)) return;
        highLight();
    };

    const handleDragOver = e => {
        preventDefaults(e);
        if (!dragContainsFiles(e)) return;
        highLight();
    };

    const handleDragLeave = e => {
        preventDefaults(e);
        unHighLight();
    };

    const handleDrop = e => {
        preventDefaults(e);
        unHighLight();
        const files = e?.dataTransfer?.files;
        if (!files) return;
        emit('send-file', Array.from(files));
    };
</script>

<style scoped></style>
