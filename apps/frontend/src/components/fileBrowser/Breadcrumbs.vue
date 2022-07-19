<template>
    <div class="flex flex-row items-center">
        <div class="cursor-pointer" @click="goToHome">
            <HomeIcon class="h-5 w-5 text-gray-400 hover:text-gray-500" aria-hidden="true" />
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
            <div class="flex items-center" v-if="!sharedDir && !isQuantumChatFiles && !savedAttachments">
                <template v-for="(item, i) in parts">
                    <span v-if="i !== 0 && item">
                        <ChevronRightIcon class="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </span>
                    <span
                        v-if="item && i !== 0"
                        :title="item"
                        class="cursor-pointer text-sm font-medium text-gray-500 hover:text-gray-700 p-2 rounded-md"
                        @click="i === 0 ? goToHome() : goToAPreviousDirectory(i)"
                        @dragenter="event => onDragEnter(event, i)"
                        @dragleave="event => onDragLeave(event, i)"
                        @dragover="event => event.preventDefault()"
                        @drop="event => onDrop(event, i)"
                    >
                        {{ truncate(item) }}
                    </span>
                </template>
            </div>

            <!-- SHARED BREADCRUMBS -->
            <div class="flex items-center" v-if="sharedDir && !isQuantumChatFiles">
                <!--<span class="mx-2 cursor-pointer" @click="router.push({ path: '/quantum' })">Home</span> -->

                <template v-for="(breadcrumb, idx) in sharedBreadcrumbs">
                    <span v-if="i !== 0 && breadcrumb">
                        <ChevronRightIcon class="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </span>
                    <span
                        v-if="breadcrumb || idx === 0"
                        :key="idx"
                        :title="breadcrumb.name"
                        class="cursor-pointer text-sm font-medium text-gray-500 hover:text-gray-700 p-2 rounded-md"
                        @click="clickBreadcrumb(breadcrumb, sharedBreadcrumbs, idx)"
                    >
                        {{ idx === 0 ? 'Shared with me' : truncate(breadcrumb.name) }}
                    </span>
                </template>
            </div>
            <!-- CHAT FILES BREADCRUMBS -->
            <div class="flex items-center" v-if="isQuantumChatFiles">
                <!--<span class="mx-2 cursor-pointer" @click="router.push({ path: '/quantum' })">Home</span> -->
                <ChevronRightIcon class="h-5 w-5 text-gray-400" aria-hidden="true" />
                <template v-for="(breadcrumb, idx) in chatFilesBreadcrumbs" :key="idx">
                    <span v-if="idx !== 0 && breadcrumb">
                        <ChevronRightIcon class="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </span>
                    <span class="mx-2 cursor-pointer" @click="router.push({ path: breadcrumb.path })">
                        {{ breadcrumb.name }}
                    </span>
                </template>
            </div>
            <!-- SAVED ATTACHMENTS -->
            <div class="flex items-center" v-if="!isQuantumChatFiles && savedAttachments">
                <!--<span class="mx-2 cursor-pointer" @click="router.push({ path: '/quantum' })">Home</span> -->
                <ChevronRightIcon class="h-5 w-5 text-gray-400" aria-hidden="true" />
                <template v-for="(breadcrumb, idx) in savedAttachmentsBreadcrumbs" :key="idx">
                    <span v-if="idx !== 0 && breadcrumb">
                        <ChevronRightIcon class="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </span>
                    <span
                        class="mx-2 text-sm font-medium text-gray-500 hover:text-gray-700 cursor-pointer"
                        @click="router.push({ path: breadcrumb.path })"
                    >
                        {{ breadcrumb.name }}
                    </span>
                </template>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
    import { computed } from 'vue';
    import { ChevronRightIcon, HomeIcon } from '@heroicons/vue/solid';
    import {
        clickBreadcrumb,
        currentDirectory,
        goToAPreviousDirectory,
        goToHome,
        isDraggingFiles,
        moveFiles,
        selectedPaths,
        sharedBreadcrumbs,
        sharedDir,
        chatFilesBreadcrumbs,
        savedAttachments,
        isQuantumChatFiles,
        savedAttachmentsBreadcrumbs,
    } from '@/store/fileBrowserStore';
    import { useRouter } from 'vue-router';
    import { createNotification } from '@/store/notificiationStore';

    const router = useRouter();

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

    const truncate = name => {
        return name.length < 50 ? name : `${name.slice(0, 25)}...${name.slice(-25)}`;
    };
</script>

<style scoped>
    input:checked ~ .dot {
        transform: translateX(100%);
        background-color: #48bb78;
    }
</style>
