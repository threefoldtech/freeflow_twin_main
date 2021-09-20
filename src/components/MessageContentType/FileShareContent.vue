<template>
    <a class="px-4 my-2 my-message:bg-accent-200 cursor-pointer" @click="goToShared()" v-if="message.body">
        <h3 class="my-message:text-icon text-center">
            <span v-if="message.body.isFolder">Folder</span>
            <span v-else>File</span>
            shared
        </h3>
        <div class="w-auto h-auto flex flex-row">
            <div
                class="
                    icon
                    mr-2
                    bg-gray-600
                    rounded-full
                    h-12
                    w-12
                    flex
                    justify-center
                    items-center
                    text-white
                    my-message:bg-accent-500
                "
            >
                <i class="fas fa-share-alt"></i>
            </div>
            <div class="py-1 flex flex-col">
                <div class="my-message:text-icon">{{ message.body.name }}</div>
                <span class="my-message:text-icon opacity-70"> {{ formatBytes(message.body.size, 2) }}</span>
            </div>
        </div>
    </a>
</template>

<script lang="ts">
import { isUndefined } from 'lodash';
import { defineComponent } from 'vue';
import { useRouter } from 'vue-router';

declare const Buffer;
export default defineComponent({
    name: 'FileShareContent',
    props: {
        message: { type: Object, required: true },
    },
    setup(props) {
        const router = useRouter();
        const formatBytes = function (bytes, decimals) {
            if (bytes == 0) return '0 Bytes';
            let k = 1024,
                dm = decimals || 2,
                sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
                i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
        };
        const goToShared = async function () {
            // await getSharedContent();
            // sharedDir.value = true;
            console.log(props.message.from);
            if (props.message.from === window.location.host.split('.')[0]) {
                // check if you sent it
                const url = router.resolve({
                    name: 'editoptions',
                    params: {
                        path: btoa(props.message.body.path),
                        shareId: props.message.body.id,
                    },
                });
                window.open(url.href, '_blank');
                return;
            } else {
                const url = router.resolve({
                    name: 'editfile',
                    params: {
                        path: btoa(props.message.body.path),
                        shareId: props.message.body.id,
                    },
                });
                window.open(url.href, '_blank');
            }
        };

        return {
            formatBytes,
            // calcExternalResourceLink,
            goToShared,
        };
    },
});
</script>
<style></style>
