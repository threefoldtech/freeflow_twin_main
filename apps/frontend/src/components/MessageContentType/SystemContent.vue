<template>
    <div
        v-if="message.body.type === SystemMessageTypes.JOINED_VIDEO_ROOM"
        class="cursor-pointer flex justify-center items-center mb-4"
        @click="joinVideo"
    >
        <div>
            <i class="fas fa-video mr-3"></i>

            <i class="underline">{{ message.body.message }}</i>
        </div>
        <button
            class="text-xs text bg-accent-800 focus:outline-none focus:ring-2 ring-accent-800 ring-offset-2 ring-offset-2 text-white px-4 py-2 m-0 rounded-full ml-6"
        >
            <i class="fas fa-video mr-3"></i>
            JOIN
        </button>
    </div>
    <div v-else class="text-xs justify-around flex self-center mb-4">
        <u
            ><i>{{ message.body.message }}</i></u
        >
    </div>
</template>

<script lang="ts" setup>
    import { popupCenter } from '@/services/popupService';
    import { usechatsActions, useChatsState } from '@/store/chatStore';
    import { useRoute } from 'vue-router';
    import { computed, ref } from 'vue';
    import { useAuthState } from '@/store/authStore';
    import { Message, MessageTypes, SystemBody, SystemMessageTypes } from '@/types';
    import * as crypto from 'crypto-js';
    import { isMobile } from '@/store/fileBrowserStore';
    import { createNotification } from '@/store/notificiationStore';

    interface IProp {
        message: Message<SystemBody>;
    }

    const { chats } = useChatsState();
    const { sendMessage } = usechatsActions();
    const { user } = useAuthState();

    const props = defineProps<IProp>();
    const route = useRoute();
    const selectedId = ref(<string>route.params.id);

    const chat = computed(() => {
        return chats.value.find(c => c.chatId == selectedId.value);
    });

    const joinVideo = () => {
        if (isMobile()) {
            createNotification('Not supported', 'Video chat is not supported on mobile devices');
            return;
        }

        const id = getVideoRoomId();
        const msg = {
            type: SystemMessageTypes.JOINED_VIDEO_ROOM,
            message: `${user.id} joined the video chat`,
            id,
        };

        sendMessage(chat.value.chatId, msg, MessageTypes.SYSTEM);
        popupCenter(`/videoRoom/${id}`, 'video room', 800, 550);
    };

    const getVideoRoomId = () => {
        if (props.message.body.id) return props.message.body.id;
        return crypto
            .SHA1(
                chat.value.isGroup
                    ? chat.value.chatId
                    : chat.value.contacts
                          .map(c => c.id)
                          .sort()
                          .join('-')
            )
            .toString();
    };
</script>
