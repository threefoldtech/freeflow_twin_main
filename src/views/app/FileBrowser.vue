<template>
    <appLayout>
        <template v-slot:default>
            <div class='flex flex-row w-full h-full'>
                <!--<div>
                    <SideBar/>
                </div>-->
                <div class='flex flex-col flex-1'>
                    <TopBar/>
                  <DirectoryContent v-if="searchResults.length === 0 && sharedDir === false"/>
                  <SearchContent v-if="searchResults.length > 0 && sharedDir === false"/>
                  <SharedContent v-if="sharedDir === true"/>
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
    import { updateContent, getSharedContent, searchResults, sharedDir, } from '@/store/fileBrowserStore';
    import TopBar from '@/components/fileBrowser/TopBar.vue';
    import SharedContent from '@/components/fileBrowser/SharedContent.vue';

    export default defineComponent({
        name: 'Apps',
        components: {
            TopBar,
          appLayout, DirectoryContent, SearchContent, SharedContent
        },
        setup() {
            onBeforeMount(async() => {
               await updateContent();
               await getSharedContent();
            })

            return {
                searchResults,
              sharedDir,
            };
        },
    });
</script>

<style scoped type="text/css"></style>
