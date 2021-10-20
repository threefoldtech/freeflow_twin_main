<template>
    <a class="px-4 my-2 my-message:bg-accent-200 cursor-pointer text-xs" @click="visitFileInMessage(message)">
        <p class="my-message:text-icon text-center text-xs mb-1">
            <span v-if="message.body.isFolder">Folder</span>
            <span v-else>File</span>
            shared
        </p>
        <div class="w-auto h-auto flex flex-row">
            <div
                class="
                    flex-shrink-0
                    icon
                    mr-2
                    bg-gray-600
                    rounded-full
                    h-9
                    w-9
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

<script lang="ts" setup>
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

    interface IProp {
        message: Object;
    }

    const props = defineProps<IProp>();

    const router = useRouter();
    const visitFileInMessage = (message: Message<FileShareMessageType>) => {
        sharedItem.value = message.body;

        console.log(message.body.path);

        if (message.from === loginName) {
            router.push({
                name: 'quantumFolder',
                params: {
                    folder: message.body.isFolder
                        ? btoa(message.body.path)
                        : btoa(message.body.path.split('/').slice(0, -1).join('/')),
                    editFileShare: 'true',
                },
            });
            return;
        }
        currentDirectory.value = '';

        goTo(message.body);
        sharedDir.value = true;
    };
</script>
<style></style>
