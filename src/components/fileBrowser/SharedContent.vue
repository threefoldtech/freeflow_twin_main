<template>
    <div class="h-full overflow-y-auto px-3">
        <h1 v-if='!isQuantumChatFiles' class="p-2">
            Shared with me: <span>{{ sharedWithMeCurrentFolder?.name }}</span>
        </h1>
        <div v-if="sharedFolderIsloading" class="h-full w-full flex justify-center items-center z-50">
            <Spinner :xlarge="true" />
        </div>
        <div v-else class="flex flex-col mx-2">
            <div class="overflow-x-auto">
                <div class="py-2 align-middle inline-block min-w-full">
                    <ViewSelect />
                    <div class="overflow-hidden border-b border-gray-200 sm:rounded-lg">
                        <table
                            v-if="fileBrowserTypeView === ViewType.LIST"
                            class="min-w-full divide-y divide-gray-200 shadow"
                            :key="currentDirectory"
                        >
                            <thead class="bg-gray-50">
                                <tr>
                                    <th
                                        scope="col"
                                        class="
                                            px-6
                                            py-3
                                            text-left text-xs
                                            font-medium
                                            text-gray-500
                                            uppercase
                                            tracking-wider
                                        "
                                    >
                                        Name
                                    </th>
                                    <th
                                        scope="col"
                                        class="
                                            px-6
                                            py-3
                                            text-left text-xs
                                            font-medium
                                            text-gray-500
                                            uppercase
                                            tracking-wider
                                        "
                                    >
                                        Size
                                    </th>
                                </tr>
                            </thead>
                            <tbody class="bg-white divide-y divide-gray-200">
                                <SharedTableEmpty v-if="chatsWithFiles?.length === 0 && isQuantumChatFiles && $route.meta.chatsWithFiles && !$route.meta.chatFilesNested" />
                                <SharedTableEmpty v-if="chatFiles?.length === 0 && isQuantumChatFiles && $route.meta.chatFilesNested && !$route.meta.chatsWithFiles" />
                                <SharedTableItem v-for="item in sharedContent"
                                                 v-if='!isQuantumChatFiles'
                                                 class="hover:bg-gray-200 cursor-pointer h-10 border-b border-t border-gray-300"
                                                 :class="{
                                        'bg-gray-100': isSelected(item),
                                    }"
                                                 @click="goTo(item)"
                                                 :key="item.name"
                                                 :item="item"/>
                            </tbody>
                        </table>
                        <ul
                            role="list"
                            v-if="fileBrowserTypeView === ViewType.GRID"
                            class="
                                grid grid-cols-2
                                gap-x-2 gap-y-4
                                sm:grid-cols-4 sm:gap-x-4
                                lg:grid-cols-6
                                xl:grid-cols-8
                                2xl:grid-cols-10
                                xl:gap-x-6
                                mt-4
                            "
                        >

                          <GridItemEmpty  v-if="chatFiles?.length === 0 && isQuantumChatFiles && $route.meta.chatFilesNested && !$route.meta.chatsWithFiles" title="Nothing has been shared with you yet!" />
                          <GridItemEmpty  v-if="chatsWithFiles?.length === 0 && isQuantumChatFiles && $route.meta.chatsWithFiles && !$route.meta.chatFilesNested" title="Nothing has been shared with you yet!" />
                          <GridItem v-for="item in sharedContent" :key="item.name" :title="item.name" :item="item"   class="relative" @click="goTo(item)" />
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { ViewGridIcon, ViewListIcon } from '@heroicons/vue/solid';
    import { calcExternalResourceLink } from '@/services/urlService';
    import ViewSelect from '@/components/fileBrowser/ViewSelect.vue';
    import {
        PathInfoModel,
        selectedPaths,
        sharedContent,
        goTo,
        sharedBreadcrumbs,
        clickBreadcrumb,
        sharedFolderIsloading,
        fileBrowserTypeView,
        sharedWithMeCurrentFolder,
        chatsWithFiles,
        isQuantumChatFiles,
        ViewType,
        chatFiles,
    } from '@/store/fileBrowserStore';
    import SharedTableItem from '@/components/fileBrowser/Shared/SharedTableItem.vue'
    import GridItem from '@/components/fileBrowser/Grid/GridItem.vue'

    import { SharedFileInterface } from '@/types';
    import { cloneVNode, defineComponent } from '@vue/runtime-core';
    import { onBeforeMount, watch, computed } from 'vue';
    import { useRoute, useRouter } from 'vue-router';
    import Spinner from '@/components/Spinner.vue';
    import SomethingWentWrongModal from '@/components/fileBrowser/SomethingWentWrongModal.vue'
    import SharedTableEmpty from '@/components/fileBrowser/Shared/SharedTableEmpty.vue'
    import GridItemEmpty from '@/components/fileBrowser/Grid/GridItemEmpty.vue'

    onBeforeMount(async () => {
        sharedBreadcrumbs.value = [];
    });

    watch(sharedFolderIsloading, () => {});

    const router = useRouter();
    const route = useRoute();

    const currentFolderName = computed(() => {
        //@TODO add current folder

        return '';
    });

    const truncate = name => {
        return name.length < 50 ? name : `${name.slice(0, 25)}...${name.slice(-25)}`;
    };

    //const truncate = computed(name => (name.length < 50 ? name : `${name.slice(0, 25)}...${name.slice(-25)}`));

    const epochToDate = epoch => {
        let d = new Date(epoch).toLocaleDateString();

        return d === '1/20/1980' ? 'Never' : d;
    };

    const isSelected = (item: PathInfoModel) => selectedPaths.value.includes(item);
</script>

<style scoped></style>
