<template>
    <div :class="{ hidden: sharedDir }" class="mx-2">
        <button
            class="text-white py-2 px-4 mr-2 rounded-md bg-primary hover:bg-accent-800 transition duration:300"
            @click="showCreateFolderDialog = true"
        >
            <i class="fas fa-plus"></i> New Folder
        </button>
        <button
            class="text-white py-2 px-4 mr-2 rounded-md bg-primary hover:bg-accent-800 transition duration:300"
            @click="showCreateFileDialog = true"
        >
            <i class="fas fa-plus"></i> Upload File(s)
        </button>
    </div>
    <Dialog :model-value="showCreateFolderDialog" @update-model-value="val => updateCreateFolderDialog(val)">
        <template v-slot:title>
            <h1>Create folder</h1>
        </template>
        <div>
            <p v-for="(error, idx) in createFolderErrors" :key="idx" class="text-sm font-medium text-red-500">
                {{ error }}
            </p>
            <label class="block text-sm font-medium text-gray-700" for="newFolder">Folder name</label>
            <div>
                <input
                    id="newFolder"
                    ref="newFolderInput"
                    v-model="addFolderName"
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
                    @input="disableSlash"
                />
            </div>
        </div>
    </Dialog>

    <Dialog :model-value="showCreateFileDialog" @update-model-value="val => updateCreateFileDialog(val)">
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

<script lang="ts" setup>
    import { defineComponent, ref, watch } from 'vue';
    import Dialog from '@/components/Dialog.vue';
    import FileDropArea from '@/components/FileDropArea.vue';
    import { createDirectory, uploadFiles, sharedDir } from '@/store/fileBrowserStore';
    import Button from '@/components/Button.vue';
    import { DocumentTextIcon, XIcon } from '@heroicons/vue/solid';

    const showCreateFolderDialog = ref(false);
    const showCreateFileDialog = ref(false);
    const newFolderInput = ref<HTMLInputElement>();
    const newFileInput = ref<any>(undefined);
    const selectedFiles = ref<File[]>([]);
    const newFileInputArray = ref<File[]>([]);
    const createFolderErrors = ref<string[]>([]);
    const addFolderName = ref<string>('');
    const fileUploadErrors = ref<string[]>([]);

    watch(addFolderName, () => {
        createFolderErrors.value = [];
        if (addFolderName.value.includes('/')) {
            createFolderErrors.value.push("'/' is not allowed in folder names.");
        }
        if (addFolderName.value.length >= 50) {
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

        if (addFolderName.value.includes('/')) {
            createFolderErrors.value.push("'/' is not allowed in folder names.");
        }
        if (addFolderName.value.length >= 50) {
            createFolderErrors.value.push('Folder names have a maximum character length of 50 characters.');
        }

        if (addFolderName.value.includes('/') || addFolderName.value.length >= 50) return;

        createDirectory(newFolderInput.value.value);
        addFolderName.value = '';
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
</script>

<style scoped></style>
