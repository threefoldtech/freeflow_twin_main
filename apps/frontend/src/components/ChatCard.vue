<template>
    <li
        class="py-4 px-2 max-w-full grid grid-cols-10 cursor-pointer items-center"
        :class="{
            'hover:bg-gray-100': !router.currentRoute?.value.path.includes(chat.chatId),
            'bg-gray-200 hover:bg-gray-200': router.currentRoute?.value.path.includes(chat.chatId),
        }"
        @click="$emit('selectChat')"
        @keyup.enter="$emit('selectChat')"
    >
        <AvatarImg :id="chat.chatId" :showOnlineStatus="!chat.isGroup" class="col-span-2 sm:col-span-1 lg:col-span-2" />
        <div v-if="!collapsed" class="relative col-span-8 sm:col-span-9 lg:col-span-8">
            <p class="flex items-center">
                <span class="text-sm text-gray-900 font-bold break-normal overflow-ellipsis overflow-hidden name">
                    {{ chat.name }}
                </span>
                <span v-if="blocked" class="ml-2 text-red-500"> BLOCKED</span>
                <span
                    v-if="lastMessage"
                    class="ml-auto self-end text-sm"
                    :class="unreadMessages > 0 ? 'font-bold text-gray-600' : 'text-gray-400'"
                >
                    {{ timeAgo(lastMessage.timeStamp) }}
                </span>
            </p>
            <p
                class="text-sm max-h-6 max-w-[70vw] lg:max-w-[20vw] truncate"
                :class="unreadMessages > 0 ? 'font-bold' : 'text-gray-500'"
            >
                {{ lastMessageBody }}
            </p>
            <p v-if="unreadMessages > 0" class="absolute right-0 -bottom-2 bg-accent-300 h-4 w-4 rounded-full"></p>
        </div>
    </li>
</template>

<script lang="ts" setup>
    import { computed } from 'vue';
    import { useAuthState } from '@/store/authStore';
    import { Chat, FileShareMessageType, FileTypes, MessageTypes, QuoteBodyType, SystemBody } from '@/types';
    import moment from 'moment';
    import { statusList } from '@/store/statusStore';
    import AvatarImg from '@/components/AvatarImg.vue';
    import { useRouter } from 'vue-router';
    import { userIsBlocked } from '@/store/blockStore';
    import { usechatsActions } from '@/store/chatStore';

    const { newUnreadChats, removeUnreadChats } = usechatsActions();
    const { user } = useAuthState();

    interface IProps {
        chat: Chat;
        collapsed: Boolean;
    }
    const props = defineProps<IProps>();
    const emit = defineEmits(['selectChat']);

    const lastMessage = computed(() => {
        const lastIndex = props.chat?.messages?.length - 1;
        if (!lastIndex) return;
        return props.chat.messages[lastIndex];
    });

    const timeAgo = time => {
        return moment(time).fromNow();
    };

    const status = computed(() => {
        return statusList[props.chat.chatId];
    });

    const router = useRouter();

    const lastMessageBody = computed(() => {
        const msg = lastMessage.value;
        if (!msg) return;
        switch (msg.type) {
            case 'GIF':
                return 'Gif was sent';
            case 'QUOTE':
                return (msg.body as QuoteBodyType).message;
            case MessageTypes.SYSTEM:
                return (msg.body as unknown as SystemBody).message;
            case 'FILE': {
                if (msg.body.type === FileTypes.RECORDING) return 'Voice recording was sent';
                return 'File has been uploaded';
            }
            case 'FILE_SHARE': {
                if ((msg?.body as FileShareMessageType)?.isFolder) {
                    return 'Folder has been shared';
                }
                return 'File has been shared';
            }
            case MessageTypes.POST_SHARE: {
                return 'A post has been shared';
            }
            case 'DELETE':
            default:
                return msg.body;
        }
    });

    const unreadMessages = computed(() => {
        if (!props.chat || !user) return 0;

        if (props.chat.read.constructor.name !== 'Array') return;

        const lastReadMessageId = props.chat.read.find(u => u.userId === user.id)?.messageId;
        const index = props.chat.messages?.findIndex(m => m.id === lastReadMessageId);

        //more than 50 unread messages in chat
        if (lastReadMessageId && index === -1) {
            newUnreadChats(props.chat.chatId);
            return 50;
        }

        const missedMessages = props.chat.messages.length - (index + 1);
        const chatId = props.chat.chatId;
        missedMessages === 0 ? removeUnreadChats(chatId) : newUnreadChats(chatId);
        return missedMessages;
    });

    const blocked = computed(() => {
        if (!props.chat || props.chat.isGroup) return false;
        return userIsBlocked(props.chat.chatId);
    });
</script>

<style scoped>
    .name {
        max-width: calc(100% - 150px);
        box-sizing: border-box;
    }
</style>
