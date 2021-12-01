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
        <DeleteDialog @updateModel="bool => showDeleteDialog = bool" :showDeleteDialog="showDeleteDialog"  />
        <RenameDialog @updateModel="bool => showRenameDialog = bool" :showRenameDialog="showRenameDialog" />
        <ShareDialog  @updateModel="bool =>  {
                        showShareDialog = bool;
                        selectedPaths.value = [];
                        selectedTab.value = 0;
                      }" :showShareDialog="showShareDialog"/>
    </div>
</template>

<script setup lang="ts">
    import { ref } from 'vue';
    import {
        selectedPaths,
        downloadFiles,
        copyPasteSelected,
        copiedFiles,
        clearClipboard,
        searchDir,
        searchDirValue,
        searchResults,
        selectedAction,
        Action,
        selectedTab,
    } from '@/store/fileBrowserStore';
    import { showShareDialog } from '@/services/dialogService';
    import DeleteDialog from '@/components/fileBrowser/OptionsSelectedItem/DeleteDialog.vue'
    import RenameDialog from '@/components/fileBrowser/OptionsSelectedItem/RenameDialog.vue'
    import ShareDialog from '@/components/fileBrowser/OptionsSelectedItem/ShareDialog.vue'

    let debounce;
    const showDeleteDialog = ref(false);
    const showRenameDialog = ref(false);
    const newName = ref<string>('');

    const writeRights = ref(false);

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
</script>

<style scoped>
    input:checked ~ .dot {
        transform: translateX(100%);
        background-color: #48bb78;
    }
</style>
