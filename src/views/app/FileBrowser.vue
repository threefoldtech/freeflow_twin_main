<template>
    <appLayout>
        <template v-slot:default>
            <div class='flex flex-row w-full h-full'>
                <div>
                    <SideBar/>
                </div>
                <div class='flex flex-col flex-1'>
                    <TopBar/>
                    <DirectoryContent v-if="searchResults.length === 0"/>
                    <SearchContent v-if="searchResults.length > 0"/>
                </div>
            </div>

        </template>
    </appLayout>
</template>

<script lang="ts">
    import appLayout from '../../layout/AppLayout.vue';
    import { defineComponent, onBeforeMount } from 'vue';
    import DirectoryContent from '@/components/fileBrowser/DirectoryContent.vue';
    import SearchContent from '@/components/fileBrowser/SearchContent.vue';
    import SideBar from '@/components/fileBrowser/SideBar.vue'
    import { updateContent, searchResults } from '@/store/fileBrowserStore';
    import TopBar from '@/components/fileBrowser/TopBar.vue';

    export default defineComponent({
        name: 'Apps',
        components: {
            TopBar,
            appLayout, DirectoryContent, SideBar, SearchContent
        },
        setup() {
            onBeforeMount(async() => {
               await updateContent();
            })

            return {
                searchResults
            };
        },
    });
</script>

<style scoped type="text/css"></style>
