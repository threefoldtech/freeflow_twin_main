<template>
    <div class="mr-2">
        <button @click="showCreateFolderDialog = true" class="text-white py-2 px-4 mr-2 rounded-md bg-btngreen">
            <i class="fas fa-plus"></i> New Folder
        </button>
        <button @click="showCreateFileDialog = true" class="text-white py-2 px-4 mr-2 rounded-md bg-btngreen">
            <i class="fas fa-plus"></i> Upload Files
        </button>
    </div>
    <Dialog :model-value="showCreateFolderDialog" @update-model-value="val => updateCreateFolderDialog(val)">
        <template v-slot:title>
            <h1>Create folder</h1>
        </template>
        <div>
            <label for="newFolder" class="block text-sm font-medium text-gray-700">Folder name</label>
            <div>
                <input type="text" name="newFolder" id="newFolder" ref="newFolderInput" v-model="manualContactAdd" class="shadow-sm focus:ring-btngreen focus:border-btngreen block w-full sm:text-sm border-gray-300 rounded-md mt-1" placeholder="New folder name" />
            </div>
        </div>
    </Dialog>

    <Dialog :model-value="showCreateFileDialog" @update-model-value="val => updateCreateFileDialog(val)">
        <template v-slot:title>
            <h1>Add files</h1>
        </template>
        <div class="flex flex-col">
            <span>Files*</span>
            <button class="py-2 px-4 text-white rounded-md bg-btngreen max-w-max" @click="newFileInput.click()">Select files</button>
        </div>
        <input type="file" ref="newFileInput" hidden multiple @change="handleFileSelectChange" />
        <FileDropArea :show="true" @send-file="handleDragAndDrop">
            <div class="h-44"></div>
        </FileDropArea>
        <div class="">
            <div v-if="selectedFiles.length" v-for="file in selectedFiles" :key="`${file.name}-${file.lastModified}`" class="flex flex-row justify-between mt-2 pb-2 border-b border-bordergrey">
                <div class="flex">
                    <DocumentTextIcon class="h-5 w-5 mr-1 text-gray-400" aria-hidden="true" />
                    <span>{{file.name}}</span>
                </div>
                <XIcon class="h-5 w-5 mr-1 text-btnred cursor-pointer" aria-hidden="true" @click="deleteFile(file)" />
            </div>
            <div v-else class="mt-2 pb-2 border-b border-bordergrey">
                <span>No files selected</span>
            </div>
        </div>
    </Dialog>
</template>

<script lang="ts">
    import { defineComponent, ref } from 'vue';
    import Dialog from '@/components/Dialog.vue';
    import FileDropArea from '@/components/FileDropArea.vue';
    import { createDirectory, uploadFiles } from '@/store/fileBrowserStore';
    import Button from '@/components/Button.vue';
    import {DocumentTextIcon, XIcon} from '@heroicons/vue/solid';

    export default defineComponent({
        name: 'MainActionButtons',
        components: {
            Button,
            Dialog,
            FileDropArea,
            DocumentTextIcon,
            XIcon
        },
        setup() {
            const showCreateFolderDialog = ref(false);
            const showCreateFileDialog = ref(false);
            const newFolderInput = ref<HTMLInputElement>();
            const newFileInput = ref<HTMLInputElement>();
            const selectedFiles = ref<File[]>([]);
            //const newFileInputArray = ref<File[]>([]);

            const updateCreateFolderDialog = (val: boolean) => {
                if (!val) {
                    showCreateFolderDialog.value = false;
                    return;
                }

                if (!newFolderInput.value) return;
                if (!newFolderInput.value.value) {
                    newFolderInput.value.classList.add('border-red-500');
                    return;
                }
                createDirectory(newFolderInput.value.value);
                showCreateFolderDialog.value = false;
            };
            
            const deleteFile = (file: File) => {
                selectedFiles.value.splice(selectedFiles.value.indexOf(file), 1);
                console.log(newFileInput.value.files);
                
                const indexOfKey = parseInt(Object.keys(newFileInput.value.files).find(index => newFileInput.value.files[index].name === file.name));
                console.log(indexOfKey);
                delete newFileInput.value.files[indexOfKey];
            }
            const updateCreateFileDialog = (val: boolean) => {
                if (!val) {
                    showCreateFileDialog.value = false;
                    return;
                }

                if (!selectedFiles.value?.length) return;
                uploadFiles(selectedFiles.value);
                clearFiles();
                showCreateFileDialog.value = false;
            };

            const handleDragAndDrop = (files: File[]) => {
                selectedFiles.value = files;
            };

            const clearFiles = () => {
                selectedFiles.value = [];
                console.log(newFileInput.value.files);
            };

            const handleFileSelectChange = () => {
                Array.from(newFileInput.value?.files).forEach(file => selectedFiles.value.push(file));
            };

            return {
                showCreateFolderDialog,
                showCreateFileDialog,
                newFolderInput,
                newFileInput,
                handleDragAndDrop,
                updateCreateFolderDialog,
                handleFileSelectChange,
                selectedFiles,
                clearFiles,
                updateCreateFileDialog,
                deleteFile,
            };
        },
    });
</script>

<style scoped></style>
