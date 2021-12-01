<template>
  <Dialog :model-value="showCreateFolderDialog" :noActions='false' @update-model-value="val => updateCreateFolderDialog(val)">
    <template v-slot:title>
      <h1>Create folder</h1>
    </template>
    <div>
      <p v-for="(error, idx) in createFolderErrors" :key="idx" class="text-sm font-medium text-red-500">
        {{ error }}
      </p>
      <label class="block text-sm font-medium text-gray-700" for="newFolder">Folder name</label>
      <div class="relative">
        <input
            id="newFolder"
            ref="newFolderInput"
            v-model="manualContactAdd"
            class="
                        shadow-sm
                        focus:ring-primary focus:border-primary
                        block
                        w-full
                        sm:text-sm
                        border-gray-300
                        rounded-md
                        mt-1
                    "
            name="newFolder"
            placeholder="New folder name"
            type="text"
        />
        <div class="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer" @click="clearFolderInput">
          <i aria-hidden="true" class="fa fa-window-close h-5 w-5 text-gray-400" />
        </div>
      </div>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import {onBeforeMount, onUpdated, ref, watch} from "vue";
import Dialog from '@/components/Dialog.vue'
import {createDirectory} from "@/store/fileBrowserStore";
import { DocumentTextIcon, XIcon } from '@heroicons/vue/solid';

const createFolderErrors = ref<string[]>([]);
const manualContactAdd = ref<string>('');
const newFolderInput = ref<HTMLInputElement>();

const emit = defineEmits(['updateModal'])

const props = defineProps<{showCreateFolderDialog: boolean}>()


onBeforeMount(() => {
  manualContactAdd.value = ''
})

onUpdated(() => {
  manualContactAdd.value = ''
})

watch(manualContactAdd, () => {
  createFolderErrors.value = [];
  if (manualContactAdd.value.includes('/')) {
    createFolderErrors.value.push("'/' is not allowed in folder names.");
  }
  if (manualContactAdd.value.length >= 50) {
    createFolderErrors.value.push('Folder names have a maximum character length of 50 characters.');
  }
});

const clearFolderInput = () => {
  newFolderInput.value.value = '';
  manualContactAdd.value = "";
  createFolderErrors.value = [];

};

const updateCreateFolderDialog = (val: boolean) => {
  createFolderErrors.value = [];
  if (!val) {
    emit('updateModal',false)
    return;
  }

  if (!newFolderInput.value) return;
  if (!newFolderInput.value.value) {
    createFolderErrors.value.push('Give the folder a name.');
    newFolderInput.value.classList.add('border-red-500');
    return;
  }
  if (manualContactAdd.value.includes('/')) {
    createFolderErrors.value.push("'/' is not allowed in folder names.");
  }
  if (manualContactAdd.value.length >= 50) {
    createFolderErrors.value.push('Folder names have a maximum character length of 50 characters.');
  }
  if (manualContactAdd.value.includes('/') || manualContactAdd.value.length >= 50) return;

  createDirectory(newFolderInput.value.value);
  emit('updateModal',false)
};
</script>

<style scoped>

</style>