<template>
    <appLayout>
        <template v-slot:default>
            <div class="flex flex-row w-full h-full">
                <div class="flex flex-col flex-1">
                    <TopBar ref="childRef" />
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
import { defineComponent, onBeforeMount, onMounted, onUpdated, ref } from 'vue';
import FileTable from '@/components/fileBrowser/FileTable.vue';
import ResultsTable from '@/components/fileBrowser/ResultsTable.vue';
import { updateContent, searchResults, sharedDir, getFile, selectItem, test } from '@/store/fileBrowserStore';
import TopBar from '@/components/fileBrowser/TopBar.vue';
import SharedContent from '@/components/fileBrowser/SharedContent.vue';
import { useRoute, useRouter } from 'vue-router';

export default defineComponent({
    name: 'Apps',
    components: {
        TopBar,
        appLayout,
        FileTable,
        ResultsTable,
        SharedContent,
    },

    setup({}, ctx) {
        const route = useRoute();
        onBeforeMount(async () => {
            const path = atob(<string>route.params.path);
            const item = await getFile(path);
            selectItem(item);
        });

        onMounted(async () => {
            document.onreadystatechange = () => {
                if (document.readyState == 'complete') {
                    document.getElementById('ShowShareDialog').click();
                }
            };
        });

        return {
            searchResults,
            sharedDir,
        };
    },
});
</script>


function emit(arg0: string) {
  throw new Error('Function not implemented.');
}


<style scoped type="text/css"></style>