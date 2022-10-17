<template>
    <SomethingWentWrongModal />
    <appLayout>
        <template v-slot:default>
            <FileDropArea class="h-full" @click.stop @send-file="uploadFiles">
                <div
                    @click="selectedPaths = []"
                    ref="fileTableDiv"
                    @keydown.esc="closeEditor()"
                    tabindex="0"
                    class="flex flex-row w-full h-full"
                >
                    <div class="flex flex-col flex-1">
                        <TopBar @click.stop />
                        <FileTable
                            v-if="!sharedDir && searchResults.length === 0 && !isQuantumChatFiles"
                            @itemClicked="handleItemClick"
                        />
                        <ResultsTable
                            v-if="!sharedDir && searchResults.length > 0 && !isQuantumChatFiles"
                            @itemClicked="handleItemClick"
                        />
                        <SharedContent v-if="sharedDir || isQuantumChatFiles" @itemClicked="handleItemClick" />
                    </div>
                </div>
            </FileDropArea>

            <div
                v-if="showFilePreview"
                class="inset-0 bg-black bg-opacity-50 w-full h-full flex justify-center items-center z-50 fixed p-8"
                @click.self="closeEditor()"
            >
                <XIcon class="absolute right-4 top-4 w-12 h-12 cursor-pointer text-white z-50" @click="closeEditor()" />
                <div v-if="filePreviewType === 'image'">
                    <img
                        :src="filePreviewSrc"
                        class="pointer-events-none z-50 max-h-full"
                        @click.stop
                        alt="filePreview"
                    />
                </div>

                <div v-else-if="filePreviewType === 'video'">
                    <video controls>
                        <source :src="filePreviewSrc" />
                    </video>
                </div>

                <div v-else-if="filePreviewType === 'simpleFile'">
                    <button
                        @click="saveChanges()"
                        class="py-2 px-4 ml-2 text-white rounded-md justify-self-end bg-primary absolute left-5 top-4 border-2"
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
                        class="w-screen h-[750px]"
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
        isQuantumChatFiles,
        searchDirValue,
        searchResults,
        selectedPaths,
        selectedTab,
        selectItem,
        sharedDir,
        sharedItem,
        fileBrowserTypeView,
        updateContent,
        uploadFiles,
        PathInfoModel,
        itemAction,
    } from '@/store/fileBrowserStore';
    import TopBar from '@/components/fileBrowser/TopBar.vue';
    import { useRoute, useRouter } from 'vue-router';
    import { isUndefined } from 'lodash';
    import { showShareDialog } from '@/services/dialogService';
    import SomethingWentWrongModal from '@/components/fileBrowser/SomethingWentWrongModal.vue';
    import { decodeString } from '@/utils/files';
    import Dialog from '@/components/Dialog.vue';
    import MonacoEditor from '@/components/MonacoEditor.vue';
    import { XIcon, SaveIcon } from '@heroicons/vue/solid';
    import { isImage, isSimpleTextFile, isVideo } from '@/services/contentService';
    import { calcExternalResourceLink } from '@/services/urlService';
    import { getFileInfo, updateFile } from '@/services/fileBrowserService';
    import { useAuthState } from '@/store/authStore';

    const { user } = useAuthState();

    const fileTableDiv = ref<HTMLDivElement>();

    nextTick(() => {
        fileTableDiv.value?.focus();
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

    onBeforeMount(async () => {
        if (route.params.name === 'sharedWithMeItemNested') {
            currentDirectory.value = decodeString(<string>route.params.path);
        }

        if (window.innerWidth < 1024) {
            fileBrowserTypeView.value = 'GRID';
        }

        window.addEventListener('resize', handleResize);

        if (!sharedDir.value) {
            if (route.params.editFileShare === 'true') {
                selectItem(sharedItem.value);
                selectedTab.value = 1;
                showShareDialog.value = true;
                await updateContent(currentDirectory.value);
                sharedItem.value = null;
                sharedDir.value = false;
                searchResults.value = [];
                searchDirValue.value = '';

                return;
            }
            if (isUndefined(currentDirectory.value)) currentDirectory.value = '/';
            sharedDir.value = false;
            searchResults.value = [];
            searchDirValue.value = '';
            return;
        }
    });

    const showFilePreview = ref(false);
    const filePreviewSrc = ref('');
    const filePreviewType = ref('');
    const fileContent = ref('');
    const editedFileContent = ref('');
    const clickedItem = ref<PathInfoModel>();

    const handleItemClick = async (item: PathInfoModel) => {
        if (isVideo(item.path) || isImage(item.path) || isSimpleTextFile(item.path)) {
            clickedItem.value = item;
            const ownerLocation = user.location;
            let path = item.path;
            path = path.replace('/appdata/storage/', '');
            const src = `http://[${ownerLocation}]/api/v2/files/${btoa(path)}`;
            filePreviewSrc.value = calcExternalResourceLink(src);

            filePreviewType.value = isVideo(item.path) ? 'video' : isImage(item.path) ? 'image' : 'simpleFile';

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

    const showConfirmDialog = ref(false);

    const closeEditor = () => {
        showFilePreview.value = false;
        if (filePreviewType.value !== 'simpleFile' || editedFileContent.value === fileContent.value) {
            return;
        }
        showConfirmDialog.value = true;
    };

    const saveChanges = async () => {
        if (editedFileContent.value !== fileContent.value) {
            const fileAccessDetails = (await getFileInfo(clickedItem.value.path, false)).data;
            const { readToken, key } = fileAccessDetails;
            await updateFile(clickedItem.value.path, editedFileContent.value, user.location, readToken, key);
        }
        showFilePreview.value = false;
        showConfirmDialog.value = false;
        clickedItem.value = undefined;
    };
</script>

<style scoped type="text/css"></style>
