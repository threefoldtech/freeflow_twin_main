<template>
  <Dialog :modelValue="showRenameDialog" @updateModelValue="$emit('updateModel',false)" :noActions='true'>
    <template v-slot:title class="center">
      <h1 class="text-center">Renaming {{ selectedPaths[0].name }}</h1>
    </template>
    <div class="relative">
      <label for="rename" class="sr-only">Rename</label>
      <input
          type="text"
          v-model="newName"
          name="rename"
          id="rename"
          class="
                        shadow-sm
                        focus:ring-primary focus:border-primary
                        block
                        w-full
                        sm:text-sm
                        border-gray-300
                        rounded-md
                    "
          :placeholder="selectedPaths[0].name"
      />
      <div
          v-if="!!newName"
          @click="newName = ''"
          class="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
      >
        <i class="fa fa-window-close h-5 w-5 text-gray-400" aria-hidden="true" />
      </div>
    </div>
    <div class="flex justify-end mt-2">
      <button
          @click="
                        $emit('updateModel',false);
                        newName = '';
                    "
          class="rounded-md border border-gray-400 px-4 py-2 justify-self-end"
      >
        Cancel
      </button>
      <button
          @click="
                        renameFile(selectedPaths[0], newName);
                        newName = '';
                        $emit('updateModel',false);
                    "
          class="py-2 px-4 ml-2 text-white rounded-md justify-self-end bg-primary"
      >
        Rename
      </button>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import Dialog from '@/components/Dialog.vue';
import {renameFile, selectedPaths} from "@/store/fileBrowserStore";



interface IProps{
  showRenameDialog: boolean;
}

const props = defineProps<IProps>()
const emit = defineEmits(['updateModel'])
</script>

<style scoped>

</style>