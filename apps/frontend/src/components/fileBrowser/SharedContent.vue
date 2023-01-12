<template>
    <div class="h-full overflow-y-auto">
        <div v-if="sharedFolderIsloading" class="h-full w-full flex justify-center items-center z-50">
            <Spinner :xlarge="true" />
        </div>
        <div v-else class="flex flex-col mx-2">
            <div class="overflow-x-auto">
                <div class="align-middle inline-block min-w-full">
                    <div class="overflow-hidden sm:rounded-lg">
                        <table v-if="fileBrowserTypeView === 'LIST'" class="min-w-full divide-y divide-gray-200 shadow">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th
                                        scope="col"
                                        class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    >
                                        Name
                                    </th>
                                    <th
                                        scope="col"
                                        class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    >
                                        Size
                                    </th>
                                </tr>
                            </thead>
                            <tbody class="bg-white divide-y divide-gray-200">
                                <tr
                                    v-for="item in sharedContent"
                                    v-if="!isQuantumChatFiles"
                                    class="hover:bg-gray-200 cursor-pointer h-10 border-b border-t border-gray-300"
                                    @click="emit('itemClicked', item)"
                                    :key="item.name"
                                >
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <div class="flex flex-row items-center text-md">
                                            <div class="mr-3 w-7 text-center">
                                                <i
                                                    class="fa-2x"
                                                    :class="
                                                        getIcon(item.isFolder, getFileType(getExtension(item.name))) +
                                                        ' ' +
                                                        getIconColor(
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
                                                    From: {{ item?.owner?.id }}
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
                                <tr v-if="sharedContent?.length === 0">
                                    <td class="px-6 py-4 whitespace-nowrap">Nothing has been shared with you yet!</td>
                                    <td class="px-6 py-4 whitespace-nowrap"></td>
                                </tr>
                            </tbody>
                        </table>
                        <!-- GRID -->
                        <!-- SHARED -->
                        <ul
                            role="list"
                            v-if="fileBrowserTypeView === 'GRID'"
                            class="grid grid-cols-1 gap-x-2 gap-y-4 sm:grid-cols-2 sm:gap-x-4 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-8 xl:gap-x-6 mt-4"
                        >
                            <p
                                class="px-6 py-4 whitespace-nowrap col-span-12 text-base font-medium text-center text-gray-800"
                                v-if="sharedContent?.length === 0"
                            >
                                Nothing has been shared with you yet!
                            </p>

                            <li
                                v-for="item in sharedContent"
                                v-if="!isQuantumChatFiles"
                                :key="item.name"
                                :title="item.name"
                                class="relative"
                            >
                                <div
                                    class="group w-full aspect-w-12 aspect-h-4 bg-white border-2 rounded-md hover:bg-gray-200 transition duration:200 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-gray-100 focus-within:ring-indigo-500 overflow-hidden flex justify-start items-center"
                                    @click="emit('itemClicked', item)"
                                >
                                    <div class="flex justify-start items-center cursor-pointer px-4">
                                        <i
                                            :key="item.name"
                                            class="fa-lg"
                                            :class="
                                                getIcon(item.isFolder, getFileType(getExtension(item.name))) +
                                                ' ' +
                                                getIconColor(item.isFolder, getFileType(getExtension(item.name)))
                                            "
                                        ></i>
                                        <p
                                            class="block ml-4 text-sm font-medium text-gray-900 truncate pointer-events-none"
                                        >
                                            {{ item.name }}
                                        </p>
                                    </div>
                                </div>
                                <p class="hidden block text-sm font-medium text-gray-500 pointer-events-none">
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
    import {
        formatBytes,
        getExtension,
        getFileType,
        getIconColor,
        getIcon,
        sharedContent,
        sharedBreadcrumbs,
        sharedFolderIsloading,
        fileBrowserTypeView,
        isQuantumChatFiles,
    } from '@/store/fileBrowserStore';
    import { watch } from 'vue';
    import { useRoute, useRouter } from 'vue-router';
    import Spinner from '@/components/Spinner.vue';

    sharedBreadcrumbs.value = [];

    watch(sharedFolderIsloading, () => {});

    const router = useRouter();
    const route = useRoute();
    const emit = defineEmits(['itemClicked']);

    const truncate = name => {
        return name.length < 50 ? name : `${name.slice(0, 25)}...${name.slice(-25)}`;
    };
</script>

<style scoped></style>
