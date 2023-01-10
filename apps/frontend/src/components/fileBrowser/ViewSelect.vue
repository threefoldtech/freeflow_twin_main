<template>
    <div @click.stop class="flex justify-between items-center mb-2">
        <div>
            <p v-if="searchDirValue?.split('')?.length > 0" class="pl-2">Search results for {{ searchDirValue }}</p>
        </div>
        <button
            v-if="fileBrowserTypeView === 'LIST'"
            type="button"
            class="p-2 ml-5 sm:ml-7 text-gray-400 hover:text-gray-500"
            @click="fileBrowserTypeView = 'GRID'"
        >
            <span class="sr-only">View grid</span>
            <ViewListIcon class="w-6 h-6" aria-hidden="true" />
        </button>
        <button
            v-else
            type="button"
            class="p-2 ml-5 sm:ml-7 text-gray-400 hover:text-gray-500"
            @click="fileBrowserTypeView = 'LIST'"
        >
            <span class="sr-only">View list</span>
            <ViewGridIcon class="w-6 h-6" aria-hidden="true" />
        </button>
    </div>
</template>

<script setup lang="ts">
    import { ViewGridIcon, ViewListIcon } from '@heroicons/vue/solid';
    import { fileBrowserTypeView } from '@/store/fileBrowserStore';

    const props = defineProps<{ searchDirValue?: string }>();
</script>

<style scoped></style>
