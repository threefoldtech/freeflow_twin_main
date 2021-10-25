<template>
    <div class="h-full overflow-y-auto px-3">
        <h1 class="p-2">
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
                                    v-for="item in chatFiles"
                                    class="hover:bg-gray-200 cursor-pointer h-10 border-b border-t border-gray-300"
                                    :class="{
                                        'bg-gray-100': isSelected(item),
                                    }"
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
                                                            getFileType(getExtension(item.body.filename))
                                                        ) +
                                                        ' ' +
                                                        getIconColorDirty(
                                                            item.isFolder,
                                                            getFileType(getExtension(item.body.filename))
                                                        )
                                                    "
                                                ></i>
                                            </div>
                                            <a
                                                :href="calcExternalResourceLink(item.body.url)"
                                                class="block outline-none border-none"
                                            >
                                                <div class="flex flex-col items-start py-1">
                                                    <span class="text-md hover:underline cursor-pointer">
                                                        {{ truncate(item.body.filename) }}
                                                    </span>
                                                </div>
                                            </a>
                                        </div>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <div class="flex flex-row items-center text-md">
                                            <!-- {{ formatBytes(item.body.size, 2) }}                                             -->
                                        </div>
                                    </td>
                                </tr>
                                <!-- //chatFilesReceived(item, true) -->
                                <tr
                                    v-for="item in chatsWithFiles"
                                    class="hover:bg-gray-200 cursor-pointer h-10 border-b border-t border-gray-300"
                                    :class="{
                                        'bg-gray-100': isSelected(item),
                                    }"
                                    @click="goToFilesInChat((received = route.params.received === 'true'), item)"
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
                                                    {{ item.chatId }}
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <div class="flex flex-row items-center text-md">
                                            {{ chatFilesReceived(item, true).length }} files
                                        </div>
                                    </td>
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
                        <!-- GRID -->

                        <!-- SHARED -->
                        <ul
                            role="list"
                            v-else
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
                            <p
                                class="
                                    px-6
                                    py-4
                                    whitespace-nowrap
                                    col-span-12
                                    text-base
                                    font-medium
                                    text-center text-gray-800
                                "
                                v-if="sharedContent.length === 0"
                            >
                                Nothing has been shared with you yet!
                            </p>

                            <li v-for="item in chatFiles" :key="item.name" :title="item.name" class="relative">
                                <div
                                    class="
                                        group
                                        w-full
                                        aspect-w-12 aspect-h-4
                                        bg-white
                                        border-2
                                        rounded-md
                                        hover:bg-gray-200
                                        transition
                                        duration:200
                                        focus-within:ring-2
                                        focus-within:ring-offset-2
                                        focus-within:ring-offset-gray-100
                                        focus-within:ring-indigo-500
                                        overflow-hidden
                                        flex
                                        justify-start
                                        items-center
                                    "
                                >
                                    <div class="flex justify-start items-center cursor-pointer px-4">
                                        <i
                                            :key="item.name"
                                            class="fa-lg"
                                            :class="
                                                getIconDirty(
                                                    item.isFolder,
                                                    getFileType(getExtension(item.body.filename))
                                                ) +
                                                ' ' +
                                                getIconColorDirty(
                                                    item.isFolder,
                                                    getFileType(getExtension(item.body.filename))
                                                )
                                            "
                                        ></i>
                                        <p class="block ml-4 text-sm font-medium text-gray-900 truncate">
                                            <!-- {{ item.body.filename }} -->
                                            <a
                                                :href="calcExternalResourceLink(item.body.url)"
                                                class="block outline-none border-none"
                                            >
                                                <div class="flex flex-col items-start py-1">
                                                    <span class="text-md hover:underline cursor-pointer">
                                                        {{ item.body.filename }}
                                                    </span>
                                                </div>
                                            </a>
                                        </p>
                                    </div>
                                </div>
                                <p class="hidden block text-sm font-medium text-gray-500 pointer-events-none">
                                    From: {{ item.chatId }}
                                    <br />
                                    {{ formatBytes(item.size, 2) }}
                                </p>
                            </li>

                            <li v-for="item in chatsWithFiles" :key="item.name" :title="item.name" class="relative">
                                <div
                                    class="
                                        group
                                        w-full
                                        aspect-w-12 aspect-h-4
                                        bg-white
                                        border-2
                                        rounded-md
                                        hover:bg-gray-200
                                        transition
                                        duration:200
                                        focus-within:ring-2
                                        focus-within:ring-offset-2
                                        focus-within:ring-offset-gray-100
                                        focus-within:ring-indigo-500
                                        overflow-hidden
                                        flex
                                        justify-start
                                        items-center
                                    "
                                    @click="goToFilesInChat((received = route.params.received === 'true'), item)"
                                >
                                    <div class="flex justify-start items-center cursor-pointer px-4">
                                        <i
                                            :key="item.name"
                                            class="fa-lg"
                                            :class="
                                                getIconDirty(item.isFolder, getFileType(getExtension(item.name))) +
                                                ' ' +
                                                getIconColorDirty(item.isFolder, getFileType(getExtension(item.name)))
                                            "
                                        ></i>
                                        <p
                                            class="
                                                block
                                                ml-4
                                                text-sm
                                                font-medium
                                                text-gray-900
                                                truncate
                                                pointer-events-none
                                            "
                                        >
                                            {{ item.name }}
                                        </p>
                                    </div>
                                </div>
                                <p class="hidden block text-sm font-medium text-gray-500 pointer-events-none">
                                    From: {{ item.chatId }}
                                    <br />
                                    {{ formatBytes(item.size, 2) }}
                                </p>
                            </li>

                            <li v-for="item in sharedContent" :key="item.name" :title="item.name" class="relative">
                                <div
                                    class="
                                        group
                                        w-full
                                        aspect-w-12 aspect-h-4
                                        bg-white
                                        border-2
                                        rounded-md
                                        hover:bg-gray-200
                                        transition
                                        duration:200
                                        focus-within:ring-2
                                        focus-within:ring-offset-2
                                        focus-within:ring-offset-gray-100
                                        focus-within:ring-indigo-500
                                        overflow-hidden
                                        flex
                                        justify-start
                                        items-center
                                    "
                                    @click="goTo(item)"
                                >
                                    <div class="flex justify-start items-center cursor-pointer px-4">
                                        <i
                                            :key="item.name"
                                            class="fa-lg"
                                            :class="
                                                getIconDirty(item.isFolder, getFileType(getExtension(item.name))) +
                                                ' ' +
                                                getIconColorDirty(item.isFolder, getFileType(getExtension(item.name)))
                                            "
                                        ></i>
                                        <p
                                            class="
                                                block
                                                ml-4
                                                text-sm
                                                font-medium
                                                text-gray-900
                                                truncate
                                                pointer-events-none
                                            "
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
import { ViewGridIcon, ViewListIcon } from '@heroicons/vue/solid';
import { calcExternalResourceLink } from '@/services/urlService';
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
    allSharedContent,
    loadSharedItems,
    sharedWithMeCurrentFolder,
    chatsWithFiles,
    goToChatFiles,
    chatFilesReceived,
    goToFilesInChat,
    chatFiles,
} from '@/store/fileBrowserStore';
import { SharedFileInterface } from '@/types';
import { cloneVNode, defineComponent } from '@vue/runtime-core';
import { onBeforeMount, watch, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Spinner from '@/components/Spinner.vue';
import SomethingWentWrongModal from '@/components/fileBrowser/SomethingWentWrongModal.vue';

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
