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
                bg-green-400
                border-2 border-green-400
                hover:text-green-400 hover:bg-white
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

        <jdialog v-model="showRenameDialog" @update-model-value="showRenameDialog = false" noActions class="max-w-10">
            <template v-slot:title class="center">
                <h1 class="text-center">Renaming {{ selectedPaths[0].name }}</h1>
            </template>
            <div>
                <input v-model="newName" :placeholder="selectedPaths[0].name" tabindex="0" maxlength="260" />
            </div>
            <div class="grid grid-cols-2 mt-2">
                <button
                    @click="
                        renameFile(selectedPaths[0], newName);
                        newName = '';
                        showRenameDialog = false;
                    "
                    class="bg-red-500 p-2 text-white font-bold"
                >
                    RENAME
                </button>
                <button
                    @click="
                        showRenameDialog = false;
                        newName = '';
                    "
                    class="p-2"
                >
                    CANCEL
                </button>
            </div>
        </jdialog>
        <jdialog v-model="showShareDialog" @update-model-value="showShareDialog = false" noActions>
            <template v-slot:title>
                <h1 class="text-center">Share files</h1>
            </template>

            <div class="flex w-full items-center rounded-xl bg-gray-100 mb-2" :key="selectedTab">
                <div class="flex-grow" v-for="(tab,index) in tabs" :key="tab">
                <button @click="selectedTab = index" class="w-full p-2 rounded-xl " :class ="{'bg-btngreen text-white':index==selectedTab}">{{tab}}</button>
                </div>
            </div>

            <chatTable v-if="selectedTab === 0" :data="chats"></chatTable>
            <edit-share v-if="selectedTab === 1 " :selectedFile="selectedPaths[0]"></edit-share>
        </jdialog>
    </div>
</template>

<script lang="ts">
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
        getToken,
        sharedDir,
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

    const { chats } = usechatsState();
    const { retrievechats, sendMessage } = usechatsActions();

    const tabs = [
        "Create shares",
        "Edit shares"
    ]
    const selectedTab = ref(0)

    export default defineComponent({
        name: 'SelectedOptions',
        components: { AvatarImg, Button, jdialog: Dialog, chatTable: ShareChatTable,EditShare },
        setup() {
            let debounce;
            let showDeleteDialog = ref(false);
            let showRenameDialog = ref(false);
            let newName = ref<string>('');
            let showShareDialog = ref(false);
            let writeRights = ref(false);

            onBeforeMount(() => {
                retrievechats();
            });
            function debounceSearch(event) {
                clearTimeout(debounce);
                debounce = setTimeout(() => {
                    if (searchDirValue.value === '') {
                        searchResults.value = [];
                        return;
                    }
                    searchDir();
                }, 600);
            }

            async function cutFiles() {
                selectedAction.value = Action.CUT;
                await copyPasteSelected();
            }

            async function copyFiles() {
                selectedAction.value = Action.COPY;
                await copyPasteSelected();
            }
   
            return {
                selectedPaths,
                deleteFiles,
                showDeleteDialog,
                showRenameDialog,
                downloadFiles,
                copyPasteSelected,
                copiedFiles,
                clearClipboard,
                newName,
                renameFile,
                searchDirValue,
                searchDir,
                searchResults,
                debounceSearch,
                isDraggingFiles,
                cutFiles,
                copyFiles,
                showShareDialog,
                chats,
                createNotification,
                sharedDir,
                writeRights,
                tabs,
                selectedTab
            };
        },
    });
</script>

<style scoped>
    input:checked ~ .dot {
        transform: translateX(100%);
        background-color: #48bb78;
    }
</style>
