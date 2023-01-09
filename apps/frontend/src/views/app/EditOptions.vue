<template>
    <appLayout>
        <template v-slot:default>
            <div class="flex flex-row w-full h-full">
                <div class="flex flex-col flex-1">
                    <TopBar ref="childRef" />
                    <FileTable v-if="searchResults.length === 0" />
                    <ResultsTable v-if="searchResults.length > 0" />
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
    import { currentDirectory, getFile, searchResults, selectItem } from '@/store/fileBrowserStore';
    import TopBar from '@/components/fileBrowser/TopBar.vue';
    import { useRoute } from 'vue-router';
    import { showShareDialog } from '@/services/dialogService';
    import { decodeString } from '@/utils/files';

    const route = useRoute();

    onBeforeMount(async () => {
        const path = decodeString(String(route.params.path));
        const item = await getFile(path);
        selectItem(item);

        currentDirectory.value = '/';
        showShareDialog.value = true;
    });
</script>

<style scoped type="text/css"></style>
