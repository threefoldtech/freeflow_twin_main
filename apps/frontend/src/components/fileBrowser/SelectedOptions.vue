<template>
    <div class="flex flex-row">
        <div class="hidden lg:flex flex-row">
            <div v-if="selectedPaths.length > 0" class="mx-2">
                <p>{{ selectedPaths.length }} File(s) selected</p>
            </div>
            <Tooltip v-if="selectedPaths.length === 1 && !selectedPaths[0]?.isDirectory" textItem="Share">
                <template #source>
                    <div v-if="selectedPaths.length === 1" class="mx-2 cursor-pointer" @click="showShareDialog = true">
                        <span class="text-gray-400 hover:text-gray-500">
                            <i class="fas fa-lg fa-share-alt"></i>
                        </span>
                    </div>
                </template>
            </Tooltip>
            <Tooltip v-if="selectedPaths.length === 1" textItem="Rename">
                <template #source>
                    <div
                        v-if="selectedPaths.length === 1"
                        class="mx-2 cursor-pointer"
                        @click="makeRenameDialogVisible()"
                    >
                        <span class="text-gray-400 hover:text-gray-500">
                            <i class="fas fa-lg fa-pen"></i>
                        </span>
                    </div>
                </template>
            </Tooltip>
            <Tooltip v-if="selectedPaths.length > 0" textItem="Download">
                <template #source>
                    <div v-if="selectedPaths.length > 0" class="mx-2 cursor-pointer" @click="downloadFiles">
                        <span class="text-gray-400 hover:text-gray-500">
                            <i class="fas fa-lg fa-download"></i>
                        </span>
                    </div>
                </template>
            </Tooltip>

            <Tooltip v-if="selectedPaths.length > 0" textItem="Copy">
                <template #source>
                    <div v-if="selectedPaths.length > 0" class="mx-2 cursor-pointer" @click="copyFiles()">
                        <span class="text-gray-400 hover:text-gray-500">
                            <i class="fas fa-lg fa-copy"></i>
                        </span>
                    </div>
                </template>
            </Tooltip>

            <Tooltip v-if="selectedPaths.length > 0" textItem="Cut">
                <template #source>
                    <div v-if="selectedPaths.length > 0" class="mx-2 cursor-pointer" @click="cutFiles()">
                        <span class="text-gray-400 hover:text-gray-500">
                            <i class="fas fa-lg fa-cut"></i>
                        </span>
                    </div>
                </template>
            </Tooltip>

            <Tooltip v-if="selectedPaths.length > 0" textItem="Delete">
                <template #source>
                    <div v-if="selectedPaths.length > 0" class="mx-2 cursor-pointer" @click="showDeleteDialog = true">
                        <span class="text-red-300 hover:text-red-500">
                            <i class="fas fa-lg fa-trash-alt"></i>
                        </span>
                    </div>
                </template>
            </Tooltip>

            <div
                v-if="copiedFiles.length > 0"
                class="mx-2 px-2 py-1 text-white font-bold bg-primary border-2 border-primary hover:text-primary hover:bg-white rounded-md cursor-pointer flex flex-row"
                @click="copyPasteSelected"
            >
                <p>Paste {{ copiedFiles.length }} file(s)</p>
                <div @click.stop="clearClipboard">
                    <i class="fas fill-current text-red-400 fa-window-close fa-1x ml-1"></i>
                </div>
            </div>
        </div>

        <div
            v-if="selectedPaths.length > 0 || copiedFiles.length > 0"
            class="lg:hidden fixed top-0 left-0 flex-shrink-0 h-16 w-full bg-white border-b border-gray-200 flex items-center"
            style="z-index: 40"
        >
            <x-icon
                v-if="selectedPaths.length > 0"
                @click="selectedPaths = []"
                class="h-7 w-7 ml-3 text-blue-500"
                aria-hidden="true"
            />

            <div class="flex justify-between w-full px-4 items-center">
                <p v-if="selectedPaths.length > 0" class="text-lg text-blue-500">
                    {{ selectedPaths.length }} item<span v-if="selectedPaths.length > 1">s</span>
                </p>

                <div
                    v-if="copiedFiles.length > 0"
                    @click="copyPasteSelected"
                    class="mx-2 px-2 py-1 text-white font-bold bg-primary border-2 border-primary hover:text-primary hover:bg-white rounded-md cursor-pointer flex flex-row items-center"
                >
                    <ClipboardIcon class="h-5 w-5 text-gray-500" aria-hidden="true" />
                    <p class="text-gray-600 pl-1 pr-2">Paste {{ copiedFiles.length }} file(s)</p>
                    <div @click.stop="clearClipboard">
                        <i class="fas fill-current text-red-400 fa-window-close text-[25px] ml-1"></i>
                    </div>
                </div>

                <dots-horizontal-icon
                    v-if="selectedPaths.length > 0"
                    class="h-5 w-5 text-blue-500"
                    aria-hidden="true"
                    @click="showSelectedActions = true"
                />
            </div>
        </div>

        <MainActionsOverlay
            :model-value="showSelectedActions"
            class="lg:hidden"
            @update-model-value="showSelectedActions = false"
        >
            <template v-slot:content>
                <div class="border-b border-gray-200 py-3 px-4 text-base text-black text-left">
                    <p>{{ selectedPaths.length }} item<span v-if="selectedPaths.length > 1">s</span></p>
                </div>
                <div class="text-left space-y-6 py-4">
                    <div
                        v-if="selectedPaths.length === 1 && !selectedPaths[0]?.isDirectory"
                        class="mx-4 cursor-pointer flex"
                        @click="
                            () => {
                                showShareDialog = true;
                                showSelectedActions = false;
                            }
                        "
                    >
                        <share-icon
                            class="h-5 w-5 text-gray-500"
                            aria-hidden="true"
                            @click="showSelectedActions = true"
                        />
                        <p class="text-gray-600 pl-5">Share with</p>
                    </div>
                    <div
                        v-if="selectedPaths.length === 1"
                        class="mx-4 cursor-pointer flex"
                        @click="makeRenameDialogVisible()"
                    >
                        <pencil-icon
                            class="h-5 w-5 text-gray-500"
                            aria-hidden="true"
                            @click="showSelectedActions = true"
                        />
                        <p class="text-gray-600 pl-5">Rename</p>
                    </div>
                    <div
                        v-if="selectedPaths.length === 1"
                        class="mx-4 cursor-pointer flex"
                        @click="
                            cutFiles();
                            showSelectedActions = false;
                        "
                    >
                        <ScissorsIcon class="h-5 w-5 text-gray-500" aria-hidden="true" />
                        <p class="text-gray-600 pl-5">Cut</p>
                    </div>
                    <div
                        v-if="selectedPaths.length === 1"
                        class="mx-4 cursor-pointer flex"
                        @click="
                            copyFiles();
                            showSelectedActions = false;
                        "
                    >
                        <ClipboardCopyIcon class="h-5 w-5 text-gray-500" aria-hidden="true" />
                        <p class="text-gray-600 pl-5">Copy</p>
                    </div>
                    <div
                        v-if="selectedPaths.length > 0"
                        class="mx-4 cursor-pointer flex"
                        @click="
                            () => {
                                downloadFiles;
                                showSelectedActions = false;
                            }
                        "
                    >
                        <download-icon
                            class="h-5 w-5 text-gray-500"
                            aria-hidden="true"
                            @click="showSelectedActions = true"
                        />
                        <p class="text-gray-600 pl-5">Download selected</p>
                    </div>
                    <div
                        v-if="selectedPaths.length > 0"
                        class="mx-4 cursor-pointer flex"
                        @click="
                            () => {
                                showDeleteDialog = true;
                                showSelectedActions = false;
                            }
                        "
                    >
                        <trash-icon
                            class="h-5 w-5 text-gray-500"
                            aria-hidden="true"
                            @click="showSelectedActions = true"
                        />
                        <p class="text-gray-600 pl-5">Delete</p>
                    </div>
                </div>
            </template>
        </MainActionsOverlay>

        <Alert v-if="showDeleteDialog" :showAlert="showDeleteDialog" @close="showDeleteDialog = false">
            <template #title> Deleting Files</template>
            <template #content>
                Do you really want to delete {{ selectedPaths.length }} item(s)? When deleted these items will be
                forever lost!
            </template>
            <template #actions>
                <button
                    @click="
                        deleteFiles(selectedPaths);
                        showDeleteDialog = false;
                    "
                    class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                >
                    Delete
                </button>
                <button
                    @click="showDeleteDialog = false"
                    class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:w-auto sm:text-sm"
                >
                    Cancel
                </button>
            </template>
        </Alert>
        <Dialog :modelValue="showRenameDialog" @updateModelValue="doRenameFile" :noActions="true">
            <template v-slot:title class="center">
                <h1 class="font-medium">Renaming {{ selectedPaths[0].name }}</h1>
            </template>
            <div class="relative mx-4">
                <label for="rename" class="sr-only">Rename</label>
                <input
                    type="text"
                    ref="newNameInput"
                    v-model="newName"
                    name="rename"
                    id="rename"
                    class="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md"
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
            <div class="flex justify-end mt-2 px-4">
                <button
                    @click="doRenameFile(false)"
                    class="rounded-md border border-gray-400 px-4 py-2 justify-self-end"
                >
                    Cancel
                </button>
                <button
                    @click="doRenameFile(true)"
                    class="py-2 px-4 ml-2 text-white rounded-md justify-self-end bg-primary"
                >
                    Rename
                </button>
            </div>
        </Dialog>
        <Dialog :modelValue="showShareDialog" @update-model-value="resetShareDialog" :noActions="true">
            <template v-slot:title>
                <h1 class="font-medium">Share files</h1>
            </template>

            <div class="grid grid-cols-2 px-4">
                <a
                    v-for="(item, index) in tabs"
                    :key="item.name"
                    :class="[
                        index == selectedTab
                            ? 'bg-primary text-white'
                            : 'bg-gray-100 text-black hover:bg-gray-200 transition duration-300',
                        index === 0 ? 'rounded-l-md' : '',
                        index === tabs.length - 1 ? 'rounded-r-md' : '',
                    ]"
                    class="nav-link grid-cols-6 text-center py-2 font-normal"
                    href="#"
                    @click.prevent="selectedTab = index"
                >
                    {{ item }}
                </a>
            </div>
            <ShareChatTable v-if="selectedTab === 0" :data="filteredContacts"></ShareChatTable>
            <EditShare v-if="selectedTab === 1" :selectedFile="selectedPaths[0]"></EditShare>
        </Dialog>
    </div>
</template>

<script setup lang="ts">
    import { computed, nextTick, ref, watch } from 'vue';
    import {
        Action,
        clearClipboard,
        copiedFiles,
        copyPasteSelected,
        deleteFiles,
        downloadFiles,
        renameFile,
        selectedAction,
        selectedPaths,
        selectedTab,
    } from '@/store/fileBrowserStore';
    import Dialog from '@/components/Dialog.vue';
    import Button from '@/components/Button.vue';
    import ShareChatTable from '@/components/fileBrowser/ShareChatTable.vue';
    import EditShare from '@/components/fileBrowser/EditShare.vue';
    import { useChatsState } from '@/store/chatStore';

    import { showShareDialog } from '@/services/dialogService';
    import {
        currentRightClickedItem,
        RIGHT_CLICK_ACTIONS_FILE_BROWSER_ITEM,
        rightClickedItemIsFile,
        rightClickItemAction,
        triggerWatchOnRightClickItem,
    } from '@/store/contextmenuStore';
    import Alert from '@/components/Alert.vue';
    import MainActionsOverlay from '@/components/fileBrowser/MainActionsOverlay.vue';
    import {
        ClipboardCopyIcon,
        ClipboardIcon,
        DotsHorizontalIcon,
        DownloadIcon,
        PencilIcon,
        ScissorsIcon,
        ShareIcon,
        TrashIcon,
        XIcon,
    } from '@heroicons/vue/outline';
    import Tooltip from '@/components/Tooltip.vue';
    import { Chat } from '@/types';
    import { userIsBlocked } from '@/store/blockStore';

    const { chats } = useChatsState();

    const tabs = ['Create shares', 'Edit shares'];
    const newNameInput = ref<HTMLInputElement>();
    const showRenameDialog = ref(false);
    const newName = ref<string>('');
    const showSelectedActions = ref(false);

    const makeRenameDialogVisible = () => {
        showRenameDialog.value = true;
        newName.value = selectedPaths.value[0].name;
        showSelectedActions.value = false;
        nextTick(() => {
            newNameInput.value.focus();
        });
    };

    const doRenameFile = (rename: boolean) => {
        if (rename) renameFile(selectedPaths.value[0], newName.value);

        newName.value = '';
        showRenameDialog.value = false;
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

    const showDeleteDialog = ref(false);

    const filteredContacts = computed(() => {
        return chats.value.filter((chat: Chat) => !userIsBlocked(chat.chatId));
    });

    watch(
        triggerWatchOnRightClickItem,
        async () => {
            if (!rightClickedItemIsFile(currentRightClickedItem.value)) return;

            selectedPaths.value.length = 0;
            selectedPaths.value[0] = currentRightClickedItem.value.data;
            switch (rightClickItemAction.value) {
                case RIGHT_CLICK_ACTIONS_FILE_BROWSER_ITEM.DELETE:
                    showDeleteDialog.value = true;
                    break;

                case RIGHT_CLICK_ACTIONS_FILE_BROWSER_ITEM.RENAME:
                    showRenameDialog.value = true;
                    newName.value = currentRightClickedItem.value.data.name;
                    await nextTick(() => newNameInput.value.focus());
                    break;

                case RIGHT_CLICK_ACTIONS_FILE_BROWSER_ITEM.DOWNLOAD:
                    await downloadFiles();
                    break;

                case RIGHT_CLICK_ACTIONS_FILE_BROWSER_ITEM.SHARE:
                    showShareDialog.value = true;
                    break;

                default:
                    break;
            }
        },
        { deep: true }
    );
</script>

<style scoped>
    input:checked ~ .dot {
        transform: translateX(100%);
        background-color: #48bb78;
    }
</style>
