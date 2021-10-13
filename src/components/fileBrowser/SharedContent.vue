<template>
    <div class="h-full overflow-y-auto px-3">
        <h1 class="p-2">
            Shared with me: <span>{{ currentFolderName }}</span>
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
                            v-if="fileBrowserTypeView === 'LIST'"
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
                                <tr v-if="sharedContent.length === 0">
                                    <td class="px-6 py-4 whitespace-nowrap">Nothing has been shared with you yet!</td>
                                    <td class="px-6 py-4 whitespace-nowrap"></td>
                                </tr>
                                <tr
                                    v-for="item in sharedContent"
                                    class="hover:bg-gray-200 cursor-pointer h-10 border-b border-t border-gray-300"
                                    :class="{
                                        'bg-gray-100': isSelected(item),
                                    }"
                                    @click="goTo(item)"
                                    :key="item.name"
                                >
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <div class="flex flex-row items-center text-md">
                                            <div class="mr-3 w-7 text-center">
                                                <i
                                                    :key="item.name"
                                                    class="fa-2x"
                                                    :class="
                                                        getIconDirty(
                                                            item.isFolder,
                                                            getFileType(getExtension(item.name))
                                                        ) +
                                                        ' ' +
                                                        getIconColorDirty(
                                                            item.isFolder,
                                                            getFileType(getExtension(item.name))
                                                        )
                                                    "
                                                ></i>
                                            </div>
                                            <div class="flex flex-col items-start py-1">
                                                <span class="text-md hover:underline cursor-pointer">
                                                    {{ item.name }}
                                                </span>
                                                <span class="text-xs opacity-50 cursor-pointer hover:underline">
                                                    From: {{ item.owner.id }}
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <div class="flex flex-row items-center text-md">
                                            {{ formatBytes(item.size, 2) }}
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>

                        <ul
                            role="list"
                            v-else
                            class="
                                grid grid-cols-2
                                gap-x-4 gap-y-8
                                sm:grid-cols-3 sm:gap-x-6
                                lg:grid-cols-4
                                xl:gap-x-8
                                mt-4
                            "
                        >
                            <p
                                class="
                                    px-6
                                    py-4
                                    whitespace-nowrap
                                    col-span-4
                                    text-base
                                    font-medium
                                    bg-gray-200
                                    text-center text-gray-800
                                "
                                v-if="sharedContent.length === 0"
                            >
                                Nothing has been shared with you yet!
                            </p>
                            <li v-for="item in sharedContent" :key="item.name" class="relative">
                                <div
                                    class="
                                        group
                                        w-full
                                        aspect-w-10 aspect-h-7
                                        rounded-lg
                                        bg-gray-200
                                        hover:bg-gray-300
                                        transition
                                        duration:200
                                        focus-within:ring-2
                                        focus-within:ring-offset-2
                                        focus-within:ring-offset-gray-100
                                        focus-within:ring-indigo-500
                                        overflow-hidden
                                        flex
                                        justify-center
                                        items-center
                                    "
                                    @click="goTo(item)"
                                >
                                    <div class="flex justify-center items-center cursor-pointer">
                                        <i
                                            :key="item.name"
                                            class="fa-2x"
                                            :class="
                                                getIconDirty(item.isFolder, getFileType(getExtension(item.name))) +
                                                ' ' +
                                                getIconColorDirty(item.isFolder, getFileType(getExtension(item.name)))
                                            "
                                        ></i>
                                        <button type="button" class="absolute inset-0 focus:outline-none">
                                            <span class="sr-only">View details for {{ item.name }}</span>
                                        </button>
                                    </div>
                                </div>
                                <p class="mt-2 block text-sm font-medium text-gray-900 truncate pointer-events-none">
                                    {{ item.name }}
                                </p>
                                <p class="block text-sm font-medium text-gray-500 pointer-events-none">
                                    From: {{ item.owner.id }}
                                    <br />
                                    {{ formatBytes(item.size, 2) }}
                                </p>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { ViewGridIcon, ViewListIcon } from '@heroicons/vue/solid';
    import ViewSelect from '@/components/fileBrowser/ViewSelect.vue';
    import {
        FileType,
        formatBytes,
        getExtension,
        getFileType,
        getIcon,
        getIconColor,
        getFileSize,
        getIconColorDirty,
        getIconDirty,
        getSharedContent,
        getSharedFolderContent,
        goIntoSharedFolder,
        parseJwt,
        PathInfoModel,
        selectedPaths,
        sharedContent,
        goTo,
        sharedBreadcrumbs,
        clickBreadcrumb,
        sharedFolderIsloading,
        fileBrowserTypeView,
        View,
    } from '@/store/fileBrowserStore';
    import { SharedFileInterface } from '@/types';
    import { defineComponent } from '@vue/runtime-core';
    import { onBeforeMount, watch, computed } from 'vue';
    import { useRouter } from 'vue-router';
    import Spinner from '@/components/Spinner.vue';
    import SomethingWentWrongModal from '@/components/fileBrowser/SomethingWentWrongModal.vue';

    onBeforeMount(async () => {
        sharedBreadcrumbs.value = [];
    });

    watch(sharedFolderIsloading, () => {});

    const router = useRouter();

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
