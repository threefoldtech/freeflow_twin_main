<template>
    <div class="flex flex-row">
        <div v-if="selectedPaths.length > 0" class="mx-2">
            <p>{{ selectedPaths.length }} File(s) selected</p>
        </div>
        <div v-if="selectedPaths.length === 1" class="mx-2 cursor-pointer" @click="showShareDialog = true">
            <span class="text-gray-400 hover:text-gray-500">
                <i class="fas fa-share-alt"></i>
            </span>
        </div>
        <div
            v-if="selectedPaths.length === 1"
            class="mx-2 cursor-pointer"
            @click="
                showRenameDialog = true;
                newName = selectedPaths[0].name;
            "
        >
            <span class="text-gray-400 hover:text-gray-500">
                <i class="fas fa-pen"></i>
            </span>
        </div>
        <div v-if="selectedPaths.length > 0" class="mx-2 cursor-pointer" @click="downloadFiles">
            <span class="text-gray-400 hover:text-gray-500">
                <i class="fas fa-download"></i>
            </span>
        </div>
        <div v-if="selectedPaths.length > 0" class="mx-2 cursor-pointer" @click="copyFiles()">
            <span class="text-gray-400 hover:text-gray-500">
                <i class="fas fa-copy"></i>
            </span>
        </div>
        <div v-if="selectedPaths.length > 0" class="mx-2 cursor-pointer" @click="cutFiles()">
            <span class="text-gray-400 hover:text-gray-500">
                <i class="fas fa-cut"></i>
            </span>
        </div>
        <div v-if="selectedPaths.length > 0" class="mx-2 cursor-pointer" @click="showDeleteDialog = true">
            <span class="text-red-300 hover:text-red-500">
                <i class="fas fa-trash-alt"></i>
            </span>
        </div>
        <div
            v-if="copiedFiles.length > 0"
            class="
                mx-2
                px-2
                py-1
                text-white
                font-bold
                bg-primary
                border-2 border-primary
                hover:text-primary hover:bg-white
                rounded-md
                cursor-pointer
                flex
                fex-row
            "
            @click="copyPasteSelected"
        >
            <p>Paste {{ copiedFiles.length }} file(s)</p>
            <div @click.stop="clearClipboard">
                <i class="fas fill-current text-red-400 fa-window-close fa-1x ml-1"></i>
            </div>
        </div>
        <Dialog
            :modelValue="showDeleteDialog"
            @update-model-value="showDeleteDialog = false"
            noActions
            class="max-w-10"
        >
            <template v-slot:title class="center">
                <h1 class="text-center">Deleting Files</h1>
            </template>
            <div>
                Do you really want to delete {{ selectedPaths.length }} item(s)? When deleted these items will be
                forever lost!
            </div>
            <div class="flex justify-end mt-2">
                <button
                    @click="showDeleteDialog = false"
                    class="rounded-md border border-gray-400 px-4 py-2 justify-self-end"
                >
                    Cancel
                </button>
                <button
                    @click="
                        deleteFiles(selectedPaths);
                        showDeleteDialog = false;
                    "
                    class="py-2 px-4 ml-2 text-white rounded-md justify-self-end bg-btnred"
                >
                    Delete
                </button>
            </div>
        </Dialog>
        <Dialog :modelValue="showRenameDialog" @updateModelValue="showRenameDialog = false" noActions>
            <template v-slot:title class="center">
                <h1 class="text-center">Renaming {{ selectedPaths[0].name }}</h1>
            </template>
            <div class="relative">
                <label for="rename" class="sr-only">Rename</label>
                <input
                    type="text"
                    v-model="newName"
                    name="rename"
                    id="rename"
                    class="
                        shadow-sm
                        focus:ring-primary focus:border-primary
                        block
                        w-full
                        sm:text-sm
                        border-gray-300
                        rounded-md
                    "
                    :placeholder="selectedPaths[0].name"
                />
                <div
                    v-if="!!newName"
                    @click="newName = ''"
                    class="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                >
                    <i class="fa fa-window-close h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
            </div>
            <div class="flex justify-end mt-2">
                <button
                    @click="
                        showRenameDialog = false;
                        newName = '';
                    "
                    class="rounded-md border border-gray-400 px-4 py-2 justify-self-end"
                >
                    Cancel
                </button>
                <button
                    @click="
                        renameFile(selectedPaths[0], newName);
                        newName = '';
                        showRenameDialog = false;
                    "
                    class="py-2 px-4 ml-2 text-white rounded-md justify-self-end bg-primary"
                >
                    Rename
                </button>
            </div>
        </Dialog>
        <Dialog :modelValue="showShareDialog" @update-model-value="resetShareDialog" noActions>
            <template v-slot:title>
                <h1 class="text-center">Share files</h1>
            </template>
            <div class="flex w-full items-center rounded-xl bg-gray-100 mb-2" :key="selectedTab">
                <div class="flex-grow" v-for="(tab, index) in tabs" :key="`${tab}-${index}`">
                    <button
                        @click="selectedTab = index"
                        class="w-full p-2 rounded-xl"
                        :class="{ 'bg-primary text-white': index == selectedTab }"
                    >
                        {{ tab }}
                    </button>
                </div>
            </div>
            <ShareChatTable v-if="selectedTab === 0" :data="chats"></ShareChatTable>
            <EditShare v-if="selectedTab === 1" :selectedFile="selectedPaths[0]"></EditShare>
        </Dialog>
    </div>
</template>

<script setup lang="ts">
    import { computed, defineComponent, onBeforeMount, ref } from 'vue';
    import {
        selectedPaths,
        deleteFiles,
        downloadFiles,
        copyPasteSelected,
        copiedFiles,
        clearClipboard,
        renameFile,
        searchDir,
        searchDirValue,
        searchResults,
        isDraggingFiles,
        moveFiles,
        selectedAction,
        Action,
        addShare,
        sharedDir,
        selectedTab,
    } from '@/store/fileBrowserStore';
    import Dialog from '@/components/Dialog.vue';
    import Button from '@/components/Button.vue';
    import ShareChatTable from '@/components/fileBrowser/ShareChatTable.vue';
    import EditShare from '@/components/fileBrowser/EditShare.vue';
    import { sendMessageObject, usechatsActions, usechatsState } from '@/store/chatStore';
    import { useSocketActions } from '@/store/socketStore';
    import Avatar from '@/components/Avatar.vue';
    import AvatarImg from '@/components/AvatarImg.vue';
    import { SystemMessageTypes, MessageTypes } from '@/types';
    import { createNotification } from '@/store/notificiationStore';
    import { showShareDialog } from '@/services/dialogService';

    const { chats } = usechatsState();
    const { retrievechats, sendMessage } = usechatsActions();

    const tabs = ['Create shares', 'Edit shares'];

    let debounce;
    const showDeleteDialog = ref(false);
    const showRenameDialog = ref(false);
    const newName = ref<string>('');

    const writeRights = ref(false);

    onBeforeMount(() => {
        retrievechats();
    });
    const debounceSearch = event => {
        clearTimeout(debounce);
        debounce = setTimeout(() => {
            if (searchDirValue.value === '') {
                searchResults.value = [];
                return;
            }
            searchDir();
        }, 600);
    };

    const cutFiles = async () => {
        selectedAction.value = Action.CUT;
        await copyPasteSelected();
    };

    const copyFiles = async () => {
        selectedAction.value = Action.COPY;
        await copyPasteSelected();
    };

    const resetShareDialog = () => {
        showShareDialog.value = false;
        selectedPaths.value = [];
        selectedTab.value = 0;
    };
</script>

<style scoped>
    input:checked ~ .dot {
        transform: translateX(100%);
        background-color: #48bb78;
    }
</style>
