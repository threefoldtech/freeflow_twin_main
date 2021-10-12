<template>
    <a
        class="px-4 my-2 my-message:bg-accent-200 cursor-pointer text-xs"
        @click="visitFileInMessage(message)"
        v-if="message.body"
    >
        <p class="my-message:text-icon text-center text-xs">
            <span v-if="message.body.isFolder">Folder</span>
            <span v-else>File</span>
            shared
        </p>
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
                    flex-shrink-0
                "
            >
                <i class="fas fa-share-alt"></i>
            </div>
            <div class="py-1 flex flex-col">
                <div class="my-message:text-icon text-">{{ message.body.name }}</div>
                <span class="my-message:text-icon opacity-70"> {{ formatBytes(message.body.size, 2) }}</span>
            </div>
        </div>
    </a>
</template>

<script setup lang="ts">
    import { loginName } from '@/store/authStore';
    import {
        formatBytes,
        sharedDir,
        goToShared,
        goTo,
        currentDirectory,
        goIntoSharedFolder,
        sharedItem,
        sharedFolderIsloading,
    } from '@/store/fileBrowserStore';
    import { FileShareMessageType, Message, MessageBodyType, SharedFileInterface } from '@/types';
    import { AppType } from '@/types/apps';

    import { useRouter } from 'vue-router';

    const props = defineProps({
        message: {
            type: Object,
            required: true,
        },
    });

    const router = useRouter();
    const visitFileInMessage = (message: Message<FileShareMessageType>) => {
        sharedItem.value = message.body;

        /* if (message.from === loginName) {
            router.push({
                name: AppType.Quantum,
                params: {
                    path: btoa(message.body.path),
                    editFileShare: 'true',
                },
            });
            return;
        } */

        if (message.from === loginName) {
            router.push({
                name: 'quantumFolder',
                params: {
                    folder: btoa(message.body.path),
                    editFileShare: 'true',
                },
            });
            return;
        }
        currentDirectory.value = '';
        console.log(message);

        // router.push({
        //     name: 'sharedWithMeItem',
        //     params: {
        //         sharedWithMe: 'true',
        //         sharedId: message.body.id,
        //     },
        // });

        goTo(message.body);
        sharedDir.value = true;
    };
</script>
<style></style>
