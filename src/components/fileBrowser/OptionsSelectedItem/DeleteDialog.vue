<template>
  <Dialog
      :modelValue="showDeleteDialog"
      @update-model-value="$emit('updateModel', false)"
      :noActions='true'
      class="max-w-10"
  >
    <template v-slot:title class="center">
      <h1 class="text-center">Deleting Files</h1>
    </template>
    <div>
      Do you really want to delete {{ selectedPaths.length }} item(s)? When deleted these items will be
      forever lost!
    </div>
    <div class="flex justify-end mt-2">
      <button
          @click="$emit('updateModel', false)"
          class="rounded-md border border-gray-400 px-4 py-2 justify-self-end"
      >
        Cancel
      </button>
      <button
          @click="
                        deleteFiles(selectedPaths);
                        $emit('updateModel', false);
                    "
          class="py-2 px-4 ml-2 text-white rounded-md justify-self-end bg-btnred"
      >
        Delete
      </button>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import {deleteFiles, selectedPaths} from "@/store/fileBrowserStore";
import Dialog from '@/components/Dialog.vue';


interface IProps{
  showDeleteDialog: boolean;
}

const props = defineProps<IProps>()

const emit = defineEmits(['updateModel'])

</script>

<style scoped>

</style>