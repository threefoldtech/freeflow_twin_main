<template>
    <div @click.stop class="flex justify-between items-center mb-2">
      <div>
        <p v-if="sharedDir" class="pl-2">
          Shared with me: <span>{{ sharedWithMeCurrentFolder?.name }}</span>
        </p>
      </div>
      <div class="flex items-center">
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
    </div>
</template>

<script setup lang="ts">
    import { ViewGridIcon, ViewListIcon } from '@heroicons/vue/solid';
    import {fileBrowserTypeView, sharedDir, sharedWithMeCurrentFolder} from '@/store/fileBrowserStore';
</script>

<style scoped></style>
