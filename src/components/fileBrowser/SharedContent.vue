<template>
    <div class='h-full overflow-y-auto'>
        <h1 class="p-2">Files shared with me:</h1>
        <div class="flex flex-row" v-if="Object.keys(sharedContent).length === 0">
            <h2
                class="align-middle ml-2"
            >No files shared with you yet</h2>
        </div>
        <table class='w-full box-border' v-if="Object.keys(sharedContent).length > 0">
            <thead>
            <tr v-if="searchResults !== 'None'">
                <th class='text-left select-none pl-4'>
                    Name
                </th>
                <th class='text-left select-none'>
                    Size
                </th>
            </tr>
            </thead>
            <tbody>
            <tr
                v-for='key in Object.keys(sharedContent)'
                class='hover:bg-gray-200 h-10 border-b border-t border-gray-300 cursor-pointer'
                @click='goTo(sharedContent[key], key)'
            >
                <td>
                    <div class='flex flex-row items-center pl-4 py-1'>
                        <div class='mr-3 w-7'>
                            <i class='fa-2x'
                               :class='getIconDirty(getFileType(getExtension(sharedContent[key])))+ " " + getIconColorDirty(getFileType(getExtension(sharedContent[key])))'
                            ></i>
                        </div>
                        <div class='flex flex-col items-start py-1'>
                        <span class="text-md">
                         {{ sharedContent[key].filename }}
                        </span>
                            <span class="text-xs opacity-50"
                            >
                        From: {{ parseJwt(sharedContent[key].shares[0].token).iss }}
                        </span>

                        </div>
                    </div>
                </td>
                <td>{{ formatBytes(sharedContent[key].size, 2) }}</td>

            </tr>
            </tbody>
        </table>
    </div>
</template>

<script>
    import {
        FileType, formatBytes, getFileType,
        getIcon,
        getIconColor, getIconColorDirty, getIconDirty,
        parseJwt, requestSharedFile,
        sharedContent,
    } from '@/store/fileBrowserStore';
    import { defineComponent } from '@vue/runtime-core';
    import { useRouter } from 'vue-router';

    export default defineComponent({
        name: 'SharedContent',
        components: {},
        setup() {
            const router = useRouter();
            const epochToDate = (epoch) => {
                let d = new Date(epoch).toLocaleDateString();

                return d === '1/20/1980' ? 'Never' : d;
            };
            const goTo = (object, key) => {
                requestSharedFile(object, key, getFileType(getExtension(object)), router)
            };
            const getExtension = (file) => {
                return file.filename.substring(file.filename.lastIndexOf('.') + 1);
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

<style scoped>

</style>