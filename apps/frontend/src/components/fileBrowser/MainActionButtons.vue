<template>
    <div :class="{ hidden: sharedDir || savedAttachments }" class="mx-2 hidden lg:flex justify-between">
        <button
            class="text-white py-2 px-4 mr-2 rounded-md bg-primary hover:bg-accent-800 transition duration:300"
            @click="showNewFolderDialog()"
        >
            <i class="fas fa-plus"></i> New Folder
        </button>
        <button
            class="text-white py-2 px-4 rounded-md bg-primary hover:bg-accent-800 transition duration:300"
            @click="showCreateFileDialog = true"
        >
            <i class="fas fa-plus"></i> Upload File(s)
        </button>
    </div>
    <button
        type="button"
        class="fixed right-5 bottom-5 inline-flex lg:hidden items-center p-2 border border-transparent rounded-full shadow-sm text-white bg-accent-600 hover:bg-accent-700 focus:outline-none z-50"
        @click="showMainActionsOverlay = true"
    >
        <PlusSmIconOutline class="h-6 w-6" aria-hidden="true" />
    </button>
    <MainActionsOverlay :model-value="showMainActionsOverlay" @update-model-value="showMainActionsOverlay = false">
        <template v-slot:header>
            <h2 class="py-2">Create new</h2>
        </template>
        <template v-slot:content>
            <div class="flex justify-around py-4">
                <div class="flex flex-col items-center" @click="showNewFolderDialog()">
                    <div class="inline-flex items-center p-2.5 border border-gray-400 rounded-full">
                        <FolderAddIcon aria-hidden="true" class="h-6 w-6 text-gray-400" />
                    </div>
                    <p class="mt-1">Folder</p>
                </div>
                <div
                    class="flex flex-col items-center"
                    @click="
                        () => {
                            showCreateFileDialog = true;
                            showMainActionsOverlay = false;
                        }
                    "
                >
                    <div class="inline-flex items-center p-2.5 border border-gray-400 rounded-full">
                        <DocumentAddIcon aria-hidden="true" class="h-6 w-6 text-gray-400" />
                    </div>
                    <p class="mt-1">File</p>
                </div>
            </div>
        </template>
    </MainActionsOverlay>
    <Dialog
        :model-value="showCreateFolderDialog"
        :noActions="false"
        okButtonText="Create"
        @update-model-value="val => updateCreateFolderDialog(val)"
    >
        <template v-slot:title>
            <h1 class="font-medium">Create folder</h1>
        </template>
        <div class="px-4">
            <p v-for="(error, idx) in createFolderErrors" :key="idx" class="text-sm font-medium text-red-500">
                {{ error }}
            </p>
            <label class="block text-sm font-medium text-gray-700" for="newFolder">Folder name</label>
            <div class="relative">
                <input
                    id="newFolder"
                    ref="newFolderInput"
                    v-model="manualContactAdd"
                    class="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md mt-1"
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

    <Dialog
        :model-value="showCreateFileDialog"
        :noActions="false"
        okButtonText="Add"
        @update-model-value="val => updateCreateFileDialog(val)"
    >
        <template v-slot:title>
            <h1 class="font-medium">Add files</h1>
        </template>
        <div class="flex flex-col px-4">
            <p class="text-sm font-medium text-red-500">
                {{ fileUploadErrors }}
            </p>
            <span>Files*</span>
            <button class="py-2 px-4 text-white rounded-md bg-primary max-w-max" @click="newFileInput.click()">
                Select files
            </button>
        </div>
        <input ref="newFileInput" hidden multiple type="file" @change="handleFileSelectChange" />
        <FileDropArea :show="true" @send-file="handleDragAndDrop">
            <div class="md:h-44"></div>
        </FileDropArea>
        <div class="px-4">
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

<script lang="ts" setup>
    import { nextTick, ref, watch } from 'vue';
    import Dialog from '@/components/Dialog.vue';
    import FileDropArea from '@/components/FileDropArea.vue';
    import { createDirectory, uploadFiles, sharedDir, savedAttachments } from '@/store/fileBrowserStore';
    import Button from '@/components/Button.vue';
    import { DocumentTextIcon, XIcon } from '@heroicons/vue/solid';
    import { createErrorNotification } from '@/store/notificiationStore';
    import { hasSpecialCharacters } from '@/services/fileBrowserService';
    import { PlusSmIcon as PlusSmIconOutline, FolderAddIcon, DocumentAddIcon } from '@heroicons/vue/outline';
    import MainActionsOverlay from '@/components/fileBrowser/MainActionsOverlay.vue';

    const showCreateFileDialog = ref(false);
    const selectedFiles = ref<File[]>([]);
    const fileUploadErrors = ref<string>('');

    const updateCreateFileDialog = (val: boolean) => {
        if (!val) {
            showCreateFileDialog.value = false;
            return;
        }

        if (!selectedFiles.value?.length) {
            fileUploadErrors.value = 'Please upload atleast one file.';
            return;
        }
        uploadFiles(selectedFiles.value);
        clearFiles();
        showCreateFileDialog.value = false;
    };

    const showCreateFolderDialog = ref(false);
    const showMainActionsOverlay = ref(false);
    const newFolderInput = ref<HTMLInputElement>();

    const showNewFolderDialog = () => {
        showCreateFolderDialog.value = true;
        showMainActionsOverlay.value = false;
        nextTick(() => {
            newFolderInput.value.focus();
        });
    };

    const handleDragAndDrop = (files: File[]) => {
        for (let file of files) {
            if (hasSpecialCharacters(file.name)) {
                fileUploadErrors.value = 'No special characters allowed';
                return;
            }
        }
        selectedFiles.value.push(...files);
    };

    const newFileInput = ref<any>(undefined);

    const clearFiles = () => {
        selectedFiles.value = [];
        newFileInput.value.value = null;
    };
    const clearFolderInput = () => {
        newFolderInput.value.value = '';
    };

    const newFileInputArray = ref<File[]>([]);

    const handleFileSelectChange = () => {
        newFileInputArray.value = Array.from(newFileInput.value?.files);
        newFileInputArray.value.forEach(file => {
            if (hasSpecialCharacters(file.name)) {
                createErrorNotification('Failed to upload file', 'No special characters allowed');
                return;
            }
            selectedFiles.value.push(file);
        });
    };

    const createFolderErrors = ref<string[]>([]);
    const manualContactAdd = ref<string>('');

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

        if (hasSpecialCharacters(manualContactAdd.value))
            createFolderErrors.value.push('No special characters allowed in folder names.');
        if (manualContactAdd.value.length >= 50) {
            createFolderErrors.value.push('Folder names have a maximum character length of 50 characters.');
        }

        if (hasSpecialCharacters(manualContactAdd.value) || manualContactAdd.value.length >= 50) return;

        createDirectory(newFolderInput.value.value);
        showCreateFolderDialog.value = false;
    };

    const deleteFile = (file: File) => {
        selectedFiles.value.splice(selectedFiles.value.indexOf(file), 1);

        newFileInputArray.value.splice(newFileInputArray.value.indexOf(file), 1);
        newFileInput.value.value = newFileInputArray.value;
    };

    watch(manualContactAdd, () => {
        createFolderErrors.value = [];
        if (hasSpecialCharacters(manualContactAdd.value))
            createFolderErrors.value.push('No special characters allowed in folder names.');

        if (manualContactAdd.value.includes('/')) {
            createFolderErrors.value.push("'/' is not allowed in folder names.");
        }
        if (manualContactAdd.value.length >= 50) {
            createFolderErrors.value.push('Folder names have a maximum character length of 50 characters.');
        }
    });

    watch(showCreateFolderDialog, () => {
        manualContactAdd.value = '';
    });
</script>

<style scoped></style>
