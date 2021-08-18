<template>
    <div class="flex flex-row items-center mb-4">
        <div class="ml-2 hover:text-green-500 cursor-pointer" @click="goToHome">
            <i class="fas fa-home text-accent-300"></i>
        </div>
        <!--<div
        class='rounded-full w-6 h-6 flex justify-center items-center'
        @click='goBack'
        :class='{
                "bg-accent-300 hover:text-green-500 cursor-pointer": currentDirectory !== "/",
                "bg-gray-500": currentDirectory === "/"
            }'
    >
      <i class='fas fa-arrow-up text-white'></i>
    </div>-->
        <div class="flex-1 mr-4">
            <template v-for="(item, i) in parts">
                <span v-if="i !== 0 && item">
                    <i class="fas fa-chevron-right"></i>
                </span>
                <span
                    class="cursor-pointer text-base p-2 rounded-md"
                    v-if="item || i === 0"
                    @click="i === 0 ? goToHome() : goToAPreviousDirectory(i)"
                    @dragenter="event => onDragEnter(event, i)"
                    @dragleave="event => onDragLeave(event, i)"
                    @dragover="event => event.preventDefault()"
                    @drop="event => onDrop(event, i)"
                >
                    {{ i === 0 ? 'Home' : item }}
                </span>
            </template>
        </div>
    </div>
</template>

<script lang="ts">
    import { computed, defineComponent, onBeforeMount, ref } from 'vue';
    import {
        selectedPaths,
        currentDirectory,
        goToHome,
        goToAPreviousDirectory,
        goBack,
        isDraggingFiles,
        moveFiles,
    } from '@/store/fileBrowserStore';
    import { createNotification } from '@/store/notificiationStore';

    export default defineComponent({
        name: 'Breadcrumbs',
        components: {},
        setup() {
            const parts = computed(() => currentDirectory.value.split('/'));

            const onDragEnter = (e: Event, i: number) => {
                if (!isDraggingFiles.value || !e || !e.target || i === parts.value.length - 1) return;
                (e.target as HTMLElement).classList.add('bg-accent-300');
                (e.target as HTMLElement).classList.add('text-white');
            };

            const onDragLeave = (e: Event, i: number) => {
                if (!isDraggingFiles.value || !e || !e.target || i === parts.value.length - 1) return;
                (e.target as HTMLElement).classList.remove('bg-accent-300');
                (e.target as HTMLElement).classList.remove('text-white');
            };

            const onDrop = (e: Event, i: number) => {
                if (!isDraggingFiles.value || !e || !e.target || i === parts.value.length - 1) return;
                let path = '/';
                if (i > 0) {
                    const parts = currentDirectory.value.split('/');
                    parts.splice(i + 1);
                    path = parts.join('/');
                }
                (e.target as HTMLElement).classList.remove('bg-accent-300');
                (e.target as HTMLElement).classList.remove('text-white');
                moveFiles(path);
                selectedPaths.value = [];
            };

            return {
                goToHome,
                goBack,
                goToAPreviousDirectory,
                currentDirectory,
                isDraggingFiles,
                onDragEnter,
                onDragLeave,
                onDrop,
                parts,
                createNotification,
            };
        },
    });
</script>

<style scoped>
    input:checked ~ .dot {
        transform: translateX(100%);
        background-color: #48bb78;
    }
</style>
