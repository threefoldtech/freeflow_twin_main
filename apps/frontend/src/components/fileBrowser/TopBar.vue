<template>
    <div>
        <div class="flex flex-col lg:flex-row my-4 lg:items-center justify-between">
            <div class="mt-1 mx-2 relative rounded-md shadow-sm">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <SearchIcon aria-hidden="true" class="h-5 w-5 text-gray-400" />
                </div>
                <input
                    v-model="searchDirValue"
                    class="focus:ring-primary focus:border-primary block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                    placeholder="Search"
                    type="text"
                    @input="debounceSearch"
                />
                <div
                    v-if="searchDirValue !== ''"
                    class="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                    @click="clearInput()"
                >
                    <i aria-hidden="true" class="fa fa-window-close h-5 w-5 text-gray-400" />
                </div>
            </div>
            <div v-if="!savedAttachments" class="flex flex-col-reverse lg:flex-row items-center">
                <SelectedOptions v-if="!sharedDir"></SelectedOptions>
                <MainActionButtons v-if="!sharedDir"></MainActionButtons>
            </div>
        </div>
        <div class="flex items-center justify-between px-2">
            <Breadcrumbs></Breadcrumbs>
            <ViewSelect class="hidden lg:block" />
        </div>
    </div>
</template>

<script lang="ts" setup>
    import { watch } from 'vue';
    import {
        selectedPaths,
        searchDir,
        searchDirValue,
        searchResults,
        sharedDir,
        savedAttachments,
    } from '@/store/fileBrowserStore';
    import MainActionButtons from '@/components/fileBrowser/MainActionButtons.vue';
    import Breadcrumbs from '@/components/fileBrowser/Breadcrumbs.vue';
    import ViewSelect from '@/components/fileBrowser/ViewSelect.vue';
    import SelectedOptions from '@/components/fileBrowser/SelectedOptions.vue';
    import { useChatsState } from '@/store/chatStore';
    import { SearchIcon } from '@heroicons/vue/solid';
    import { useRoute } from 'vue-router';
    import { useDebounceFn } from '@vueuse/core';

    const route = useRoute();

    const { chats } = useChatsState();

    const debounceSearch = useDebounceFn(async () => {
        if (searchDirValue.value === '') {
            searchResults.value = [];
            return;
        }
        await searchDir();
    }, 1);

    const clearInput = () => {
        searchDirValue.value = '';
        searchResults.value = [];
    };

    watch(selectedPaths, () => {
        clearInput();
    });
</script>

<style scoped>
    input:checked ~ .dot {
        transform: translateX(100%);
        background-color: #48bb78;
    }
</style>
