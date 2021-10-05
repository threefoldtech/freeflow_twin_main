<template>
    <div @click.stop class="flex justify-end mb-2">
                    <ViewListIcon
                        class="h-6 w-6 text-gray-400 hover:text-primary transition duration-100 cursor-pointer"
                        :class="{ 'text-primary': fileBrowserTypeView === 'LIST' }"
                        @click="fileBrowserTypeView = 'LIST'"
                    />
                    <ViewGridIcon
                        class="h-6 w-6 text-gray-400 hover:text-primary transition duration-100 cursor-pointer"
                        :class="{ 'text-primary': fileBrowserTypeView === 'GRID' }"
                        @click="fileBrowserTypeView = 'GRID'"
                    />
</div>
</template>

<script setup lang="ts">
import { ViewGridIcon, ViewListIcon } from '@heroicons/vue/solid';
import {fileBrowserTypeView} from '@/store/fileBrowserStore'


</script>

<style scoped>

</style>