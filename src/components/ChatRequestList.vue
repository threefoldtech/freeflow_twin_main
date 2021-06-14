<template>
    <div v-for="(chat, i) in chatRequests" :key="i">
        <div class="flex flex-row items-center w-full rounded-lg mb-2 py-2 align-middle">
            <span v-if="chat.isGroup" class="truncate flex-1">
                {{ chat.admin }} invited you to {{ chat.name }}
            </span>
            <span v-else class="truncate flex-1">
                <b>{{ chat.name }}</b> wants to have a chat
            </span>
            <Button class="self-end" @click="acceptChatRequest(chat.chatId)">
               ACCEPT
            </Button>
        </div>
    </div>
</template>
<script lang="ts">
    import { usechatsActions } from '@/store/chatStore';
    import Button from "@/components/Button.vue"

    export default {
        name: 'ChatRequestList',
        components: {
           Button
        },
        props: {
            chatRequests: {},
        },
        setup() {
            const acceptChatRequest = id => {
                const { acceptChat } = usechatsActions();
                acceptChat(id);
            };
            return {
                acceptChatRequest,
            };
        },
    };
</script>
