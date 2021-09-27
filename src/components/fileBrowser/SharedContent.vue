<template>
    <div class="h-full overflow-y-auto">
        <h1 class="p-2">Shared with me:</h1>
        <div class="flex flex-col mx-2">
            <div class="overflow-x-auto">
                <div class="py-2 align-middle inline-block min-w-full">
                    <div class="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                        <table class="min-w-full divide-y divide-gray-200" :key="currentDirectory">
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
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
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
} from '@/store/fileBrowserStore';
import { SharedFileInterface } from '@/types';
import { defineComponent } from '@vue/runtime-core';
import { onBeforeMount } from 'vue';
import { useRouter } from 'vue-router';

onBeforeMount(async () => {
    await getSharedContent();
});

const router = useRouter();
const epochToDate = epoch => {
    let d = new Date(epoch).toLocaleDateString();

    return d === '1/20/1980' ? 'Never' : d;
};
const goTo = async (item: SharedFileInterface) => {
    if (item.isFolder) {
        goIntoSharedFolder(item);
        return;
    }
    const url = router.resolve({
        name: 'editfile',
        params: {
            path: btoa(item.path),
            shareId: item.id,
        },
    });
    window.open(url.href, '_blank');
};

const isSelected = (item: PathInfoModel) => selectedPaths.value.includes(item);
</script>

<style scoped></style>
