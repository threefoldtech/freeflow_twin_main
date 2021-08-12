<template>
    <a class="px-4 my-2 my-message:bg-my cursor-pointer" @click="goToShared()">
        <h3 class="my-message:text-icon text-center">File shared</h3>
        <div class="w-auto h-auto flex flex-row">
            <div
                class="icon mr-2 bg-gray-600 rounded-full h-12 w-12 flex justify-center items-center text-white my-message:bg-icon"
            >
                <i class="fas fa-share-alt"></i>
            </div>
            <div class="py-1 flex flex-col">
                <div class="my-message:text-icon">
                    {{ message.body.fileName }}
                </div>
                <span class="my-message:text-icon opacity-70">  {{ formatBytes(message.body.size, 2) }}</span>
            </div>
        </div>
    </a>
</template>

<script lang="ts">
    import { defineComponent } from 'vue';
    import { calcExternalResourceLink } from '@/services/urlService';
    import {getSharedContent, parseJwt, sharedDir} from '@/store/fileBrowserStore';
    import { getFileType } from '@/store/fileBrowserStore';
    import { useRouter } from 'vue-router';

    declare const Buffer;
    export default defineComponent({
        name: 'FileShareContent',
        props: {
            message: { type: Object, required: true },
        },
        setup(props) {
            const router = useRouter();
            const formatBytes = function(bytes, decimals) {
                if (bytes == 0) return '0 Bytes';
                let k = 1024,
                    dm = decimals || 2,
                    sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
                    i = Math.floor(Math.log(bytes) / Math.log(k));
                return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
            };
            const goToShared = async function() {
                await getSharedContent();
                await router.push({name: 'filebrowser'});
                sharedDir.value = true;

            };


            return {
                formatBytes,
                calcExternalResourceLink,
                goToShared
            };
        },
    });
</script>
<style>

</style>