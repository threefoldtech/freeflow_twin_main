<template>
    <div class="h-full overflow-y-auto">
        <h1 class="p-2">Files shared with me:</h1>
        <div class="flex flex-row" v-if="sharedContent.length === 0">
            <h2 class="align-middle ml-2">No files shared with you yet</h2>
        </div>
        <table class="w-full box-border" v-if="sharedContent.length > 0">
            <thead>
                <tr>
                    <th class="text-left select-none pl-4">Name</th>
                    <th class="text-left select-none">Size</th>
                </tr>
            </thead>
            <tbody>
                <tr
                    v-for="item in sharedContent"
                    class="hover:bg-gray-200 h-10 border-b border-t border-gray-300 cursor-pointer"
                    @click="goTo(item)"
                    :key="item.name"
                >
                    <td>
                        <div class="flex flex-row items-center pl-4 py-1">
                            <div class="mr-3 w-7">
                                <i
                                    :key="item.name"
                                    class="fa-2x"
                                    :class="
                                        getIconDirty(getFileType(getExtension(item.name))) +
                                        ' ' +
                                        getIconColorDirty(getFileType(getExtension(item.name)))
                                    "
                                ></i>
                            </div>
                            <div class="flex flex-col items-start py-1">
                                <span class="text-md">
                                    {{ item.name }}
                                </span>
                                <span class="text-xs opacity-50"> From: {{ item.owner.id }} </span>
                            </div>
                        </div>
                    </td>
                    <td>{{ formatBytes(item.size) }}</td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script lang="ts">
    import {
        FileType,
        formatBytes,
        getExtension,
        getFileType,
        getIcon,
        getIconColor,
        getIconColorDirty,
        getIconDirty,
        getSharedContent,
        getSharedFolderContent,
        goIntoSharedFolder,
        parseJwt,
        sharedContent,
    } from '@/store/fileBrowserStore';
    import { SharedFileInterface } from '@/types';
    import { defineComponent } from '@vue/runtime-core';
    import { onBeforeMount } from 'vue';
    import { useRouter } from 'vue-router';

    export default defineComponent({
        name: 'SharedContent',
        components: {},
        setup() {
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
                return router.push({
                    name: 'editfile',
                    params: {
                        path: btoa(item.path),
                        shareId: item.id,
                    },
                });
            };

            return {
                getIconColorDirty,
                sharedContent,
                epochToDate,
                parseJwt,
                getFileType,
                getIconDirty,
                router,
                goTo,
                getExtension,
                formatBytes,
            };
        },
    });
</script>

<style scoped></style>
