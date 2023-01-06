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
        formatBytes,
        isMobile,
        sharedItem,
        goToOwnOnlyOffice,
        goToExternalOnlyOffice,
    } from '@/store/fileBrowserStore';
    import { FileShareMessageType, Message } from '@/types';

    import { useRouter } from 'vue-router';
    import { isSimpleTextFile } from '@/services/contentService';
    import { getShareWithId } from '@/services/fileBrowserService';
    import { getChat } from '@/store/chatStore';
    import { createNotification } from '@/store/notificiationStore';

    interface IProp {
        message: Message<FileShareMessageType>;
    }

    const { user } = useAuthState();

    const props = defineProps<IProp>();
    const emit = defineEmits(['showFile']);
    const router = useRouter();

    const visitFileInMessage = async (message: Message<FileShareMessageType>) => {
        sharedItem.value = message.body;
        createNotification('Opening file...', 'This may take some time.');

        if (isSimpleTextFile(sharedItem.value.name)) {
            await showTextFile(message.chatId);
            return;
        }

        if (isMobile()) {
            createNotification('Not supported on mobile', 'This type of file is not supported on mobile.');
            return;
        }

        const isOwnFile = !sharedItem.value.isFolder && message.from === user.id;
        if (isOwnFile) {
            goToOwnOnlyOffice();
            return;
        }
        goToExternalOnlyOffice(sharedItem.value);
    };

    const showTextFile = async (chatId: string) => {
        const chat = getChat(chatId);
        const path = sharedItem.value.path.replace('/appdata/storage/', '');
        const owner = sharedItem.value.owner;
        const ownerLocation = owner?.location;
        const src = `http://[${ownerLocation}]/api/v2/files/${btoa(path)}`;

        const shareDetails = await getShareWithId(sharedItem.value.id);
        const permission = shareDetails.permissions.find(p => {
            if (chat?.isGroup) return p.userId === chat.chatId;
            return p.userId === user.id;
        });
        if (!permission && owner.id !== user.id) return;

        emit('showFile', { name: sharedItem.value.name, url: src, permission });
    };
</script>
<style></style>
