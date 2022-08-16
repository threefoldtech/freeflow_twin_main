<template>
    <SomethingWentWrongModal />
    <appLayout>
        <template v-slot:default>
            <div @click="selectedPaths = []" class="flex flex-row w-full h-full">
                <div class="flex flex-col flex-1">
                    <TopBar @click.stop />
                    <FileTable v-if="searchResults.length === 0 && !isQuantumChatFiles" />
                    <ResultsTable v-if="searchResults.length > 0 && !isQuantumChatFiles" />
                    <!--                    <SharedContent v-if="sharedDir === true || isQuantumChatFiles" />-->
                </div>
            </div>
        </template>
    </appLayout>
</template>

<script setup lang="ts">
    import AppLayout from '../../layout/AppLayout.vue';
    import { onBeforeMount } from 'vue';
    import FileTable from '@/components/fileBrowser/FileTable.vue';
    import ResultsTable from '@/components/fileBrowser/ResultsTable.vue';
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
    } from '@/store/fileBrowserStore';
    import TopBar from '@/components/fileBrowser/TopBar.vue';
    import SharedContent from '@/components/fileBrowser/SharedContent.vue';
    import { useRoute, useRouter } from 'vue-router';
    import { isUndefined } from 'lodash';
    import { showShareDialog } from '@/services/dialogService';
    import SomethingWentWrongModal from '@/components/fileBrowser/SomethingWentWrongModal.vue';
    import { decodeString } from '@/utils/files';

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
</script>

<style scoped type="text/css"></style>
