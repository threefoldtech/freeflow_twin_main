<template>
    <div class="mx-2" :class="{ hidden: sharedDir }">
        <button
            @click="showCreateFolderDialog = true"
            class="text-white py-2 px-4 mr-2 rounded-md bg-primary hover:bg-accent-800 transition duration:300"
        >
            <i class="fas fa-plus"></i> New Folder
        </button>
        <button
            @click="showCreateFileDialog = true"
            class="text-white py-2 px-4 mr-2 rounded-md bg-primary hover:bg-accent-800 transition duration:300"
        >
            <i class="fas fa-plus"></i> Upload File(s)
        </button>
    </div>
    <Dialog :model-value="showCreateFolderDialog" @update-model-value="val => updateCreateFolderDialog(val)">
        <template v-slot:title>
            <h1>Create folder</h1>
        </template>
        <div>
            <p class="text-sm font-medium text-red-500" v-for="(error, idx) in createFolderErrors" :key="idx">
                {{ error }}
            </p>
            <label for="newFolder" class="block text-sm font-medium text-gray-700">Folder name</label>
            <div>
                <input
                    type="text"
                    name="newFolder"
                    id="newFolder"
                    ref="newFolderInput"
                    @input="disableSlash"
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
                    placeholder="New folder name"
                />
            </div>
        </div>
    </Dialog>

    <Dialog :model-value="showCreateFileDialog" @update-model-value="val => updateCreateFileDialog(val)">
        <template v-slot:title>
            <h1>Add files</h1>
        </template>
        <div class="flex flex-col">
            <p class="text-sm font-medium text-red-500" v-for="(error, idx) in fileUploadErrors" :key="idx">
                {{ error }}
            </p>
            <span>Files*</span>
            <button class="py-2 px-4 text-white rounded-md bg-primary max-w-max" @click="newFileInput.click()">
                Select files
            </button>
        </div>
        <input type="file" ref="newFileInput" hidden multiple @change="handleFileSelectChange" />
        <FileDropArea :show="true" @send-file="handleDragAndDrop">
            <div class="h-44"></div>
        </FileDropArea>
        <div class="">
            <div
                v-if="selectedFiles.length"
                v-for="file in selectedFiles"
                :key="`${file.name}-${file.lastModified}`"
                class="flex flex-row justify-between mt-2 pb-2 border-b border-bordergrey"
            >
                <div class="flex">
                    <DocumentTextIcon class="h-5 w-5 mr-1 text-gray-400" aria-hidden="true" />
                    <span>{{ file.name }}</span>
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
    import { defineComponent, ref, watch } from 'vue';
    import Dialog from '@/components/Dialog.vue';
    import FileDropArea from '@/components/FileDropArea.vue';
    import { createDirectory, uploadFiles, sharedDir } from '@/store/fileBrowserStore';
    import Button from '@/components/Button.vue';
    import { DocumentTextIcon, XIcon } from '@heroicons/vue/solid';

    export default defineComponent({
        name: 'MainActionButtons',
        components: {
            Button,
            Dialog,
            FileDropArea,
            DocumentTextIcon,
            XIcon,
        },
        setup() {
            const showCreateFolderDialog = ref(false);
            const showCreateFileDialog = ref(false);
            const newFolderInput = ref<HTMLInputElement>();
            const newFileInput = ref<any>(undefined);
            const selectedFiles = ref<File[]>([]);
            const newFileInputArray = ref<File[]>([]);
            const createFolderErrors = ref<string[]>([]);
            const manualContactAdd = ref<string>('');
            const fileUploadErrors = ref<string[]>([]);

            watch(manualContactAdd, () => {
                createFolderErrors.value = [];
                if (manualContactAdd.value.includes('/')) {
                    createFolderErrors.value.push("'/' is not allowed in folder names.");
                }
                if (manualContactAdd.value.length >= 50) {
                    createFolderErrors.value.push('Folder names have a maximum character length of 50 characters.');
                }
            });

            const updateCreateFolderDialog = (val: boolean) => {
                createFolderErrors.value = [];
                if (!val) {
                    showCreateFolderDialog.value = false;
                    return;
                }

                if (!newFolderInput.value) return;
                if (!newFolderInput.value.value) {
                    createFolderErrors.value.push('Give the folder a name.');
                    newFolderInput.value.classList.add('border-red-500');
                    return;
                }
                if (manualContactAdd.value.includes('/') || manualContactAdd.value.length >= 50) {
                    if (manualContactAdd.value.includes('/')) {
                        createFolderErrors.value.push("'/' is not allowed in folder names.");
                    }
                    if (manualContactAdd.value.length >= 50) {
                        createFolderErrors.value.push('Folder names have a maximum character length of 50 characters.');
                    }
                    return;
                }
                createDirectory(newFolderInput.value.value);
                showCreateFolderDialog.value = false;
                
            };

            const deleteFile = (file: File) => {
                selectedFiles.value.splice(selectedFiles.value.indexOf(file), 1);

                newFileInputArray.value.splice(newFileInputArray.value.indexOf(file), 1);
                newFileInput.value.value = newFileInputArray.value;
            };

            const updateCreateFileDialog = (val: boolean) => {
                fileUploadErrors.value = [];
                if (!val) {
                    showCreateFileDialog.value = false;
                    return;
                }
                console.log(selectedFiles.value);

                if (!selectedFiles.value?.length) {
                    fileUploadErrors.value.push('Please upload atleast one file.');
                    return;
                }
                uploadFiles(selectedFiles.value);
                clearFiles();
                showCreateFileDialog.value = false;
            };

            const handleDragAndDrop = (files: File[]) => {
                selectedFiles.value.push(...files);
            };

            const clearFiles = () => {
                selectedFiles.value = [];
                newFileInput.value.value = null;
            };

            const handleFileSelectChange = () => {
                newFileInputArray.value = Array.from(newFileInput.value?.files);
                newFileInputArray.value.forEach(file => selectedFiles.value.push(file));
            };

            return {
                showCreateFolderDialog,
                showCreateFileDialog,
                newFolderInput,
                newFileInput,
                newFileInputArray,
                handleDragAndDrop,
                updateCreateFolderDialog,
                handleFileSelectChange,
                selectedFiles,
                clearFiles,
                updateCreateFileDialog,
                deleteFile,
                sharedDir,
                createFolderErrors,
                manualContactAdd,
                fileUploadErrors,
            };
        },
    });
</script>

<style scoped></style>
