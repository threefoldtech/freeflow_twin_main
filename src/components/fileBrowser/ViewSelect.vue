<template>
    <div @click.stop class="flex justify-end mb-2">
        <ViewListIcon
            class="h-6 w-6 text-gray-400 hover:text-primary transition duration-100 cursor-pointer"
            :class="{ 'text-primary': fileBrowserTypeView === ViewType.LIST }"
            @click="fileBrowserTypeView = ViewType.LIST"
        />
        <ViewGridIcon
            class="h-6 w-6 text-gray-400 hover:text-primary transition duration-100 cursor-pointer"
            :class="{ 'text-primary': fileBrowserTypeView === ViewType.GRID }"
            @click="fileBrowserTypeView = ViewType.GRID"
        />
    </div>
</template>

<script setup lang="ts">
    import { ViewGridIcon, ViewListIcon } from '@heroicons/vue/solid';
    import { fileBrowserTypeView, ViewType } from '@/store/fileBrowserStore';

</script>

<style scoped></style>
