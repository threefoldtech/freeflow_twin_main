<template>
    <SomethingWentWrongModal />
    <appLayout>
        <template v-slot:default>
            <div class="flex flex-row w-full h-full">
                <div class="flex flex-col flex-1">
                    <TopBar />
                    <FileTable v-if="searchResults.length === 0 && sharedDir === false" />
                    <ResultsTable v-if="searchResults.length > 0 && sharedDir === false" />
                    <SharedContent v-if="sharedDir === true" />
                </div>
            </div>
        </template>
    </appLayout>
</template>

<script lang="ts">
    import appLayout from '../../layout/AppLayout.vue';
    import { computed, defineComponent, onBeforeMount } from 'vue';
    import FileTable from '@/components/fileBrowser/FileTable.vue';
    import ResultsTable from '@/components/fileBrowser/ResultsTable.vue';
    import {
        updateContent,
        searchResults,
        sharedDir,
        selectedPaths,
        searchDirValue,
        currentDirectory,
        currentShare,
        getFile,
        selectItem,
        selectedTab,
        goBack,
        currentDirectoryContent,
        sharedItem,
        goIntoSharedFolder,
        goTo,
        fetchBasedOnRoute,
    } from '@/store/fileBrowserStore';
    import TopBar from '@/components/fileBrowser/TopBar.vue';
    import SharedContent from '@/components/fileBrowser/SharedContent.vue';
    import router from '@/plugins/Router';
    import { useRoute, useRouter } from 'vue-router';
    import { isUndefined } from 'lodash';
    import { showShareDialog } from '@/services/dialogService';
    import Spinner from '@/components/Spinner.vue';
    import SomethingWentWrongModal from '@/components/fileBrowser/SomethingWentWrongModal.vue';

    export default defineComponent({
        name: 'Apps',
        components: {
            TopBar,
            appLayout,
            FileTable,
            ResultsTable,
            SharedContent,
            Spinner,
            SomethingWentWrongModal,
        },

        setup() {
            const route = useRoute();
            const router = useRouter();

            onBeforeMount(async () => {
                if (route.params.name === 'sharedWithMeItemNested') {
                    currentDirectory.value = atob(<string>route.params.path);
                }

                if (!sharedDir.value) {
                    if (route.params.editFileShare === 'true') {
                        selectItem(sharedItem.value);
                        selectedTab.value = 1;
                        showShareDialog.value = true;
                        await updateContent(currentDirectory.value);
                    }

                    if (isUndefined(currentDirectory.value)) currentDirectory.value = '/';
                    await updateContent(currentDirectory.value);
                    sharedDir.value = false;
                    // selectedPaths.value = [];
                    searchResults.value = [];
                    searchDirValue.value = '';
                    return;
                }
            });

            return {
                searchResults,
                sharedDir,
            };
        },
    });
</script>

<style scoped type="text/css"></style>
