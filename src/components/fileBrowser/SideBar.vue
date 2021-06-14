<template>
    <div class='bg-white h-full w-52'>
        <div
            @click='showCreateFolderDialog = true'
            class='flex flex-row p-4 items-center w-full hover:bg-gray-200 cursor-pointer'
        >
            <div class='mr-3 w-7'>
                <i class="fas fa-folder-plus fa-2x text-accent"></i>
            </div>
            <span class='text-md text-gray-600'>New Folder</span>
        </div>
        <div
            @click='showCreateFileDialog = true'
            class='flex flex-row p-4 items-center w-full hover:bg-gray-200 cursor-pointer'
        >
            <div class='mr-3 w-7'>
                <i class="fas fa-file-upload fa-2x text-accent"></i>
            </div>
            <span class='text-md text-gray-600'>Upload Files</span>
        </div>
    </div>
    <Dialog :model-value='showCreateFolderDialog' @update-model-value='(val) => updateCreateFolderDialog(val)'>
        <template v-slot:title>
            <h1>Create folder</h1>
        </template>
        <input type='text' placeholder='New Folder' ref='newFolderInput'>
    </Dialog>

        <Dialog :model-value='showCreateFileDialog' @update-model-value='(val) => updateCreateFileDialog(val)'>
            <template v-slot:title>
                <h1>Add files</h1>
            </template>
            <div class='flex flex-col justify-center items-center'>
                <button
                    class='bg-accent text-white hover:bg-green-600'
                    @click='newFileInput.click()'
                >
                    Select files
                </button>
                <span>OR</span>
            </div>
            <input
                type='file'
                ref='newFileInput'
                hidden
                multiple
                @change='handleFileSelectChange'
            >
            <FileDropArea :show='true' @send-file='handleDragAndDrop'>
                <div class='h-44'></div>
            </FileDropArea>
            <div class='text-center'>
                {{selectedFiles.length}} files selected
                <button
                    class='bg-red-400'
                    @click='clearFiles'
                >
                    Clear
                </button>
            </div>
        </Dialog>
</template>

<script lang='ts'>
    import { defineComponent, ref } from 'vue';
    import Dialog from '@/components/Dialog.vue';
    import FileDropArea from '@/components/FileDropArea.vue';
    import { createDirectory, uploadFiles } from '@/store/fileBrowserStore';
    import Button from '@/components/Button.vue';

    export default defineComponent({
        name: 'SideBar',
        components: {
            Button, Dialog, FileDropArea,
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
            }

            const handleFileSelectChange = () => {
                Array.from(newFileInput.value?.files).forEach(file => selectedFiles.value.push(file));
            }

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
                updateCreateFileDialog
            };
        },
    });
</script>

<style scoped>

</style>