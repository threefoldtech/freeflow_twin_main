<template>
    <div v-for="(chat, i) in chatRequests" :key="i">
        <div class="flex flex-row items-center w-full rounded-lg mb-2 py-2 align-middle">
            <span v-if="chat.isGroup" class="truncate flex-1"> {{ chat.admin }} invited you to {{ chat.name }}</span>
            <span v-else class="truncate flex-1">
                <b>{{ chat.name }}</b> wants to have a chat
            </span>
            <button
                class="flex items-center rounded-xl py-1 px-2 m-2 bg-red-500 text-white btn disabled:bg-gray-300"
                @click="denyChatRequest(chat.chatId)"
            >
                DECLINE
            </button>
            <button
                class="flex items-center rounded-xl py-1 px-2 m-2 bg-accent-300 text-white btn disabled:bg-gray-300"
                @click="acceptChatRequest(chat.chatId)"
            >
                ACCEPT
            </button>
        </div>
    </div>
</template>
<script lang="ts" setup>
    import { removeChat, usechatsActions } from '@/store/chatStore';
    import Button from '@/components/Button.vue';
    import { Chat } from '@/types';
    import { sendRemoveChat } from '@/store/socketStore';

    interface Props {
        chatRequests: Chat[];
    }

    const props = defineProps<Props>();

    const acceptChatRequest = id => {
        const { sendAcceptChat } = usechatsActions();
        sendAcceptChat(id);
    };

    const denyChatRequest = id => {
        sendRemoveChat(id);
    };
</script>
