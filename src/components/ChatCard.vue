<template>
    <li
        class="py-4 px-2 flex cursor-pointer"
        :class="{
            'hover:bg-gray-100': !router.currentRoute?.value.path.includes(chat.chatId),
            'bg-gray-200 hover:bg-gray-200': router.currentRoute?.value.path.includes(chat.chatId),
        }"
        @click="$emit('selectChat')"
        @keyup.enter="$emit('selectChat')"
    >
        <AvatarImg :id="chat.chatId" :showOnlineStatus="!chat.isGroup" :unreadMessagesAmount="unreadMessagesAmount" />
         <div v-if="!collapsed" class="ml-3 w-full">
            <p class="flex items-center">
                <span class="text-sm text-gray-900 font-bold break-normal overflow-ellipsis overflow-hidden name">
                    {{ chat.name }}
                </span>
                <span v-if="chat.isGroup" class="ml-2 text-sm"> (group)</span>
                <span v-if="blocked" class="ml-2 text-red-500"> BLOCKED</span>
                <span v-if="lastMessage" class="text-gray-400 ml-auto self-end text-sm">
                    {{ timeAgo(lastMessage.timeStamp) }}
                </span>
            </p>
            <p class="text-sm text-gray-500 max-h-6 max-w-[60vw] md:max-w-xs truncate">{{ lastMessageBody }}</p>
        </div>
    </li>
</template>

<script lang="ts" setup>
    import { computed } from 'vue';
    import { findLastIndex } from 'lodash';
    import { useAuthState } from '@/store/authStore';
    import { Chat, FileTypes, Message, MessageBodyType, MessageTypes, SystemBody } from '@/types';
    import moment from 'moment';
    import { statusList } from '@/store/statusStore';
    import AvatarImg from '@/components/AvatarImg.vue';
    import { useRouter } from 'vue-router';
    import { isBlocked } from '@/store/blockStore';

    interface IProps {
        chat: Chat;
        collapsed: Boolean;
    }

    const props = defineProps<IProps>();
    defineEmits(['selectChat']);
    const { user } = useAuthState();

    const lastReadByMe = computed(() => {
        let lastReadMessage = props.chat.read[<string>user.id];
        return findLastIndex(
            props.chat.messages,
            (message: Message<MessageBodyType>) => lastReadMessage === message.id
        );
    });
    const lastMessage = computed(() => {
        return props.chat && props.chat.messages && props.chat.messages.length
            ? props.chat.messages[props.chat.messages.length - 1]
            : 'No messages yet';
    });
    const newMessages = computed(() => {
        return props.chat.messages.length - lastReadByMe.value - 1;
    });
    const timeAgo = time => {
        return moment(time).fromNow();
    };

    const status = computed(() => {
        return statusList[props.chat.chatId];
    });

    const router = useRouter();
    const currentRoute = computed(() => router.currentRoute.value);

    const lastMessageBody = computed(() => {
        const lstmsg = lastMessage.value;
        switch (lstmsg.type) {
            case 'GIF':
                return 'Gif was sent';
            case 'QUOTE':
                return lstmsg.body.message;
            case MessageTypes.SYSTEM:
                return (lstmsg.body as SystemBody).message;
            case 'FILE': {
                if (lstmsg.body.type === FileTypes.RECORDING) return 'Voice recording was sent';
                return 'File has been uploaded';
            }
            case 'FILE_SHARE': {
                if (lstmsg?.body?.isFolder) {
                    return 'Folder has been shared';
                }
                return 'File has been shared';
            }
            case MessageTypes.POST_SHARE: {
                return 'A post has been shared';
            }
            case 'DELETE':
            default:
                return lstmsg.body;
        }
    });

    const unreadMessagesAmount = computed(() => {
        if (!props.chat || !user) {
            return 0;
        }

        const lastReadMessageId = props.chat.read[<string>user.id];
        const index = props.chat.messages?.findIndex(m => m.id === lastReadMessageId);
        if (!index || index < 1) {
            return 0;
        }

        return props.chat.messages.length - (index + 1);
    });

    const blocked = computed(() => {
        if (!props.chat || props.chat.isGroup) return false;
        return isBlocked(props.chat.chatId);
    });
</script>

<style scoped>
    .content {
        width: calc(100% - 4rem);
    }

    .name {
        max-width: calc(100% - 150px);
        box-sizing: border-box;
    }

    .chatcard {
        box-sizing: border-box;
        width: 100%;
    }

    .chatcard:hover {
        background-color: lightgray;
    }
</style>
