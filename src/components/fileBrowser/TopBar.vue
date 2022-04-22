<template>
    <div>
        <div class="flex flex-row my-4 items-center justify-between">
            <div class="mt-1 mx-2 relative rounded-md shadow-sm">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <SearchIcon aria-hidden="true" class="h-5 w-5 text-gray-400" />
                </div>
                <input
                    v-model="searchDirValue"
                    class="focus:ring-primary focus:border-primary block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                    placeholder="Search"
                    type="text"
                    :class="{
                        'opacity-50':
                            route.name === 'savedAttachments' || route.name === 'savedAttachmentsFromChat' || sharedDir,
                    }"
                    :disabled="
                        route.name === 'savedAttachments' || route.name === 'savedAttachmentsFromChat' || sharedDir
                    "
                    @input="debounceSearch"
                />
                <div
                    v-if="searchDirValue !== ''"
                    class="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                    @click="clearInput"
                >
                    <i aria-hidden="true" class="fa fa-window-close h-5 w-5 text-gray-400" />
                </div>
            </div>
            <div v-if="!savedAttachments" class="flex flex-row items-center">
                <SelectedOptions v-if="!sharedDir"></SelectedOptions>
                <MainActionButtons v-if="!sharedDir"></MainActionButtons>
            </div>
        </div>
        <div class="flex items-center justify-between px-2">
            <Breadcrumbs></Breadcrumbs>
            <ViewSelect />
        </div>
    </div>
</template>

<script lang="ts" setup>
    import { computed, onBeforeMount, ref } from 'vue';
    import {
        selectedPaths,
        currentDirectory,
        searchDir,
        searchDirValue,
        searchResults,
        isDraggingFiles,
        moveFiles,
        sharedDir,
        savedAttachments,
    } from '@/store/fileBrowserStore';
    import MainActionButtons from '@/components/fileBrowser/MainActionButtons.vue';
    import Breadcrumbs from '@/components/fileBrowser/Breadcrumbs.vue';
    import ViewSelect from '@/components/fileBrowser/ViewSelect.vue';
    import SelectedOptions from '@/components/fileBrowser/SelectedOptions.vue';
    import { usechatsActions, useChatsState } from '@/store/chatStore';
    import { SearchIcon } from '@heroicons/vue/solid';
    import { useRoute } from 'vue-router';

    const route = useRoute();

    const { chats } = useChatsState();
    const { retrieveChats, sendMessage } = usechatsActions();

    let debounce;
    const parts = computed(() => currentDirectory.value.split('/'));

    onBeforeMount(() => {
        retrieveChats();
    });

    function debounceSearch(event) {
        clearTimeout(debounce);
        debounce = setTimeout(() => {
            if (searchDirValue.value === '') {
                searchResults.value = [];
                return;
            }
            searchDir();
        }, 1);
    }

    const onDragEnter = (e: Event, i: number) => {
        if (!isDraggingFiles.value || !e || !e.target || i === parts.value?.length - 1) return;
        (e.target as HTMLElement).classList.add('bg-accent-300');
        (e.target as HTMLElement).classList.add('text-white');
    };

    function clearInput(event) {
        searchDirValue.value = '';
        searchResults.value = [];
    }

    const onDragLeave = (e: Event, i: number) => {
        if (!isDraggingFiles.value || !e || !e.target || i === parts.value?.length - 1) return;
        (e.target as HTMLElement).classList.remove('bg-accent-300');
        (e.target as HTMLElement).classList.remove('text-white');
    };

    const onDrop = (e: Event, i: number) => {
        if (!isDraggingFiles.value || !e || !e.target || i === parts.value?.length - 1) return;
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
</script>

<style scoped>
    input:checked ~ .dot {
        transform: translateX(100%);
        background-color: #48bb78;
    }
</style>
