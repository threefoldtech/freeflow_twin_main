<template>
    <SomethingWentWrongModal />
    <appLayout>
        <template v-slot:default>
            <div
                @click="selectedPaths = []"
                ref="fileTableDiv"
                @keydown.esc="closeEditor()"
                tabindex="0"
                class="flex flex-row w-full h-full"
            >
                <div class="flex flex-col flex-1">
                    <TopBar @click.stop />
                    <FileDropArea class="h-full" @send-file="uploadFiles">
                        <FileTable
                            v-if="!sharedDir && searchResults.length === 0 && !isQuantumChatFiles"
                            @itemClicked="handleItemClick"
                        />
                        <ResultsTable
                            v-if="!sharedDir && searchResults.length > 0 && !isQuantumChatFiles"
                            @itemClicked="handleItemClick"
                        />
                        <SharedContent v-if="sharedDir || isQuantumChatFiles" @itemClicked="handleShareClick" />
                    </FileDropArea>
                </div>
            </div>

            <div
                v-if="showFilePreview"
                class="inset-0 bg-black bg-opacity-50 w-full h-full flex justify-center items-center z-50 fixed md:p-8 p-0"
                @click.self="closeEditor()"
            >
                <XIcon
                    class="absolute right-4 top-4 md:w-12 md:h-12 sm:w-10 sm:h-10 w-8 h-8 cursor-pointer text-white z-50"
                    @click="closeEditor()"
                />
                <div v-if="filePreviewType === FileTypes.IMAGE">
                    <img
                        :src="filePreviewSrc"
                        class="pointer-events-none z-50 max-h-full"
                        @click.stop
                        alt="filePreview"
                    />
                </div>

                <div v-else-if="filePreviewType === FileTypes.VIDEO">
                    <video controls>
                        <source :src="filePreviewSrc" />
                    </video>
                </div>

                <div v-else-if="filePreviewType === FileTypes.SIMPLE">
                    <button
                        @click="saveChanges()"
                        class="sm:py-2 py-1 sm:px-4 px-2 ml-2 text-white rounded-md justify-self-end bg-primary absolute left-5 top-4 border-2"
                    >
                        <SaveIcon class="w-6 h-6 inline-block mr-2" />
                        Save changes
                    </button>
                    <MonacoEditor
                        @keydown.esc="fileTableDiv.focus()"
                        theme="vs"
                        v-model="editedFileContent"
                        :extension="clickedItem?.extension"
                        :options="monacoOptions"
                        class="w-screen md:h-[80vh] sm:h-[85vh] h-[88vh] md:mt-0 mt-10"
                    />
                </div>
            </div>

            <Dialog
                :modelValue="showConfirmDialog"
                @updateModelValue="
                    showConfirmDialog = false;
                    clickedItem = undefined;
                    showFilePreview = false;
                "
                :noActions="true"
            >
                <template v-slot:title class="center">
                    <h1 class="font-medium">File has been modified</h1>
                </template>
                <div class="flex justify-end mt-2 px-4">
                    <button
                        @click="
                            showConfirmDialog = false;
                            clickedItem = undefined;
                            showFilePreview = false;
                        "
                        class="rounded-md border border-gray-400 px-4 py-2 justify-self-end"
                    >
                        Discard changes
                    </button>
                    <button
                        @click="saveChanges()"
                        class="py-2 px-4 ml-2 text-white rounded-md justify-self-end bg-primary"
                    >
                        Save changes
                    </button>
                </div>
            </Dialog>
        </template>
    </appLayout>
</template>

<script setup lang="ts">
    import AppLayout from '../../layout/AppLayout.vue';
    import { nextTick, onBeforeMount, ref } from 'vue';
    import FileTable from '@/components/fileBrowser/FileTable.vue';
    import ResultsTable from '@/components/fileBrowser/ResultsTable.vue';
    import SharedContent from '@/components/fileBrowser/SharedContent.vue';
    import FileDropArea from '@/components/FileDropArea.vue';
    import {
        currentDirectory,
        fileBrowserTypeView,
        isQuantumChatFiles,
        itemAction,
        PathInfoModel,
        searchDirValue,
        searchResults,
        selectedPaths,
        selectedTab,
        selectItem,
        sharedDir,
        sharedItem,
        updateContent,
        uploadFiles,
    } from '@/store/fileBrowserStore';
    import TopBar from '@/components/fileBrowser/TopBar.vue';
    import { useRoute, useRouter } from 'vue-router';
    import SomethingWentWrongModal from '@/components/fileBrowser/SomethingWentWrongModal.vue';
    import { decodeString } from '@/utils/files';
    import Dialog from '@/components/Dialog.vue';
    import MonacoEditor from '@/components/MonacoEditor.vue';
    import { SaveIcon, XIcon } from '@heroicons/vue/solid';
    import { isImage, isSimpleTextFile, isVideo } from '@/services/contentService';
    import { calcExternalResourceLink } from '@/services/urlService';
    import { getFileInfo, updateFile } from '@/services/fileBrowserService';
    import { useAuthState } from '@/store/authStore';
    import { SharedFileInterface } from '@/types';
    import { FileTypes } from 'custom-types/file-actions.type';
    import { createNotification } from '@/store/notificiationStore';
    import { Status } from '@/types/notifications';

    const { user } = useAuthState();

    const fileTableDiv = ref<HTMLDivElement>();

    nextTick(() => {
        fileTableDiv.value?.focus();
    });

    onBeforeMount(async () => {
        if (route.params.name === 'sharedWithMeItemNested') {
            currentDirectory.value = decodeString(<string>route.params.path);
        }

        if (window.innerWidth < 1024) {
            fileBrowserTypeView.value = 'GRID';
        }

        window.addEventListener('resize', handleResize);

        if (sharedDir.value) return;

        if (!currentDirectory.value) currentDirectory.value = '/';
        sharedDir.value = false;
        searchResults.value = [];
        searchDirValue.value = '';
        return;
    });

    const monacoOptions = {
        minimap: {
            enabled: false,
        },
        language: 'javascript',
    };

    const route = useRoute();
    const router = useRouter();

    const handleResize = () => {
        if (window.innerWidth <= 1024 && fileBrowserTypeView.value === 'LIST') {
            fileBrowserTypeView.value = 'GRID';
        }
    };

    const showFilePreview = ref(false);
    const filePreviewSrc = ref('');
    const filePreviewType = ref('');
    const fileContent = ref('');
    const editedFileContent = ref('');
    const clickedItem = ref<PathInfoModel | SharedFileInterface>();

    const handleItemClick = async (item: PathInfoModel, location = user?.location) => {
        if (isVideo(item.path) || isImage(item.path) || isSimpleTextFile(item.path)) {
            clickedItem.value = item;
            let path = item.path;
            path = path.replace('/appdata/storage/', '');
            const src = `http://[${location}]/api/v2/files/${btoa(path)}`;
            filePreviewSrc.value = calcExternalResourceLink(src);

            filePreviewType.value = isVideo(item.path)
                ? FileTypes.VIDEO
                : isImage(item.path)
                ? FileTypes.IMAGE
                : FileTypes.SIMPLE;

            if (filePreviewType.value !== 'simpleFile') {
                showFilePreview.value = true;
                return;
            }

            fileContent.value = await (await fetch(filePreviewSrc.value)).text();
            editedFileContent.value = fileContent.value;
            showFilePreview.value = true;
            return;
        }
        await itemAction(item);
    };

    const handleShareClick = async (item: SharedFileInterface) => {
        createNotification('Getting file information', 'This may take some time.');
        const res = (await getFileInfo(item.path, item.owner.location)).data;
        if (!res) {
            createNotification(
                'Failed to open file',
                'The file you are trying to open is no longer available.',
                Status.Error
            );
            return;
        }
        await handleItemClick(res, item.owner.location);
    };

    const showConfirmDialog = ref(false);

    const closeEditor = () => {
        showFilePreview.value = false;
        if (filePreviewType.value !== FileTypes.SIMPLE || editedFileContent.value === fileContent.value) {
            return;
        }
        showConfirmDialog.value = true;
    };

    const saveChanges = async () => {
        if (editedFileContent.value !== fileContent.value) {
            const fileAccessDetails = (await getFileInfo(clickedItem.value.path, undefined, false)).data;
            const { readToken, key } = fileAccessDetails;
            await updateFile(clickedItem.value.path, editedFileContent.value, user.location, readToken, key);
        }
        showFilePreview.value = false;
        showConfirmDialog.value = false;
        clickedItem.value = undefined;
    };
</script>

<style scoped type="text/css"></style>
