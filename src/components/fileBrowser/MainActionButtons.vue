<template>
    <div>
        <button @click="showCreateFolderDialog = true" class="text-white py-2 px-4 mr-2 rounded-md bg-btngreen">
            <i class="fas fa-plus"></i> New Folder
        </button>
        <button @click="showCreateFileDialog = true" class="text-white py-2 px-4 rounded-md bg-btngreen">
            <i class="fas fa-plus"></i> Upload Files
        </button>
    </div>
    <Dialog :model-value="showCreateFolderDialog" @update-model-value="val => updateCreateFolderDialog(val)">
        <template v-slot:title>
            <h1>Create folder</h1>
        </template>
        <input type="text" placeholder="New Folder" ref="newFolderInput" />
    </Dialog>

    <Dialog :model-value="showCreateFileDialog" @update-model-value="val => updateCreateFileDialog(val)">
        <template v-slot:title>
            <h1>Add files</h1>
        </template>
        <div class="flex flex-col justify-center items-center">
            <button class="bg-accent-300 text-white hover:bg-green-600" @click="newFileInput.click()">Select files</button>
            <span>OR</span>
        </div>
        <input type="file" ref="newFileInput" hidden multiple @change="handleFileSelectChange" />
        <FileDropArea :show="true" @send-file="handleDragAndDrop">
            <div class="h-44"></div>
        </FileDropArea>
        <div class="text-center">
            {{ selectedFiles.length }} files selected
            <button class="bg-red-400" @click="clearFiles">Clear</button>
        </div>
    </Dialog>
</template>

<script lang="ts">
    import { defineComponent, ref } from 'vue';
    import Dialog from '@/components/Dialog.vue';
    import FileDropArea from '@/components/FileDropArea.vue';
    import { createDirectory, uploadFiles } from '@/store/fileBrowserStore';
    import Button from '@/components/Button.vue';

    export default defineComponent({
        name: 'MainActionButtons',
        components: {
            Button,
            Dialog,
            FileDropArea,
        },
        setup() {
            const showCreateFolderDialog = ref(false);
            const showCreateFileDialog = ref(false);
            const newFolderInput = ref<HTMLInputElement>();
            const newFileInput = ref<HTMLInputElement>();
            const selectedFiles = ref<File[]>([]);

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
            };
        },
    });
</script>

<style scoped></style>
