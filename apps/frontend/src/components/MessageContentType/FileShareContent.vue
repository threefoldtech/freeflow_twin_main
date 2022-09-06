<template>
    <a class="px-4 my-2 pr-6 my-message:bg-accent-200 cursor-pointer text-xs" @click="visitFileInMessage(message)">
        <p class="my-message:text-icon text-center text-xs mb-1">
            <span v-if="message.body.isFolder">Folder</span>
            <span v-else>File</span>
            shared
        </p>
        <div class="w-auto h-auto flex flex-row">
            <div
                class="icon mr-2 bg-gray-600 rounded-full h-9 w-9 flex justify-center items-center text-white my-message:bg-accent-500 flex-shrink-0"
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
    import { useAuthState } from '@/store/authStore';
    import {
        currentDirectory,
        formatBytes,
        goTo,
        selectedPaths,
        selectedTab,
        sharedDir,
        sharedItem,
    } from '@/store/fileBrowserStore';
    import { FileShareMessageType, Message } from '@/types';
    import { useRouter } from 'vue-router';
    import { showShareDialog } from '@/services/dialogService';

    interface IProp {
        message: Object;
    }

    const props = defineProps<IProp>();
    const { user } = useAuthState();

    const router = useRouter();
    const visitFileInMessage = (message: Message<FileShareMessageType>) => {
        sharedItem.value = message.body;

        if (!sharedItem.value.isFolder && message.from === user.id) {
            //Only office
            const url = router.resolve({
                name: 'editfile',
                params: {
                    path: btoa(sharedItem.value.path),
                    shareId: '',
                    attachments: 'false',
                },
            });
            window.open(url.href, '_blank');
            return;
        }

        if (
            message.body.path.split('/')[0] === '' &&
            message.body.path.split('/').length === 2 &&
            !message.body.isFolder &&
            message.from === user.id
        ) {
            //File is located in root folder
            router.push({ name: 'quantum' });
            selectedTab.value = 1;
            showShareDialog.value = true;
            selectedPaths.value[0] = message;
            return;
        }

        if (message.from === user.id) {
            router.push({
                name: 'quantumFolder',
                params: {
                    folder: message.body.isFolder
                        ? btoa(message.body.path)
                        : //Redirecting to folder of the file
                          btoa(message.body.path.split('/').slice(0, -1).join('/')),
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
