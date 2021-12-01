<template>
  <Dialog :model-value="showCreateFileDialog" :noActions='false' @update-model-value="val => updateCreateFileDialog(val)">
    <template v-slot:title>
      <h1>Add files</h1>
    </template>
    <div class="flex flex-col">
      <p v-for="(error, idx) in fileUploadErrors" :key="idx" class="text-sm font-medium text-red-500">
        {{ error }}
      </p>
      <span>Files*</span>
      <button class="py-2 px-4 text-white rounded-md bg-primary max-w-max" @click="newFileInput.click()">
        Select files
      </button>
    </div>
    <input ref="newFileInput" hidden multiple type="file" @change="handleFileSelectChange" />
    <FileDropArea :show="true" @send-file="handleDragAndDrop">
      <div class="h-44"></div>
    </FileDropArea>
    <div class="">
      <div
          v-for="file in selectedFiles"
          v-if="selectedFiles.length"
          :key="`${file.name}-${file.lastModified}`"
          class="flex flex-row justify-between mt-2 pb-2 border-b border-bordergrey"
      >
        <div class="flex">
          <DocumentTextIcon aria-hidden="true" class="h-5 w-5 mr-1 text-gray-400" />
          <span>{{ file.name }}</span>
        </div>
        <XIcon aria-hidden="true" class="h-5 w-5 mr-1 text-btnred cursor-pointer" @click="deleteFile(file)" />
      </div>
      <div v-else class="mt-2 pb-2 border-b border-bordergrey">
        <span>No files selected</span>
      </div>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import Dialog from '@/components/Dialog.vue'
import {ref} from "vue";
import {uploadFiles} from "@/store/fileBrowserStore";
import { DocumentTextIcon, XIcon } from '@heroicons/vue/solid';
import FileDropArea from '@/components/FileDropArea.vue';

const fileUploadErrors = ref<string[]>([]);
const newFileInput = ref<any>(undefined);
const selectedFiles = ref<File[]>([]);
const newFileInputArray = ref<File[]>([]);

const emit = defineEmits(['updateModal'])
const props = defineProps<{showCreateFileDialog: boolean}>()


const clearFiles = () => {
  selectedFiles.value = [];
  newFileInput.value.value = null;
};

const handleDragAndDrop = (files: File[]) => {
  selectedFiles.value.push(...files);
};

const updateCreateFileDialog = (val: boolean) => {
  fileUploadErrors.value = [];
  if (!val) {
    emit('updateModal',false);
    return;
  }

  if (!selectedFiles.value?.length) {
    fileUploadErrors.value.push('Please upload atleast one file.');
    return;
  }
  uploadFiles(selectedFiles.value);
  clearFiles();
  emit('updateModal',false);
};

const handleFileSelectChange = () => {
  newFileInputArray.value = Array.from(newFileInput.value?.files);
  newFileInputArray.value.forEach(file => selectedFiles.value.push(file));
};

const deleteFile = (file: File) => {
  selectedFiles.value.splice(selectedFiles.value.indexOf(file), 1);

  newFileInputArray.value.splice(newFileInputArray.value.indexOf(file), 1);
  newFileInput.value.value = newFileInputArray.value;
};



</script>

<style scoped>

</style>