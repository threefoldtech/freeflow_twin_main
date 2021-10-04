<template>
    <div
        :class="{
            'bg-gray-50 border border-gray-200': !router.currentRoute?.value.path.includes(chat.chatId),
            'bg-gray-200 border border-gray-50': router.currentRoute?.value.path.includes(chat.chatId),
            'opacity-50': blocked,
        }"
        class="
            chatcard
            relative
            text-sm
            flex flex-row
            focus:outline-none focus:ring-4
            ring-accent-500 ring-offset-2
            hover:bg-gray-200
            transition
            duration-100
        "
        tabindex="0"
        @click="$emit('selectChat')"
        @keyup.enter="$emit('selectChat')"
    >
        <div class="place-items-center relative">
            <AvatarImg
                :id="chat.chatId"
                :showOnlineStatus="!chat.isGroup"
                :unreadMessagesAmount="unreadMessagesAmount"
            />
        </div>
        <div v-if="!collapsed" class="px-2 ml-2 content">
            <p class="flex">
                <span class="font-bold break-normal overflow-ellipsis overflow-hidden name">
                    {{ chat.name }}
                </span>
                <span v-if="chat.isGroup" class="font-thin ml-2"> (group)</span>
                <span v-if="blocked" class="ml-2 text-red-500"> BLOCKED</span>
                <span v-if="lastMessage" class="font-thin ml-auto">
                    {{ timeAgo(lastMessage.timeStamp) }}
                </span>
            </p>
            <div class="flex overflow-hidden">
                <div class="flex-0 col-end-13 col-span-2 font-thin overflow-ellipsis overflow-hidden">
                    {{ lastMessageBody }}
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
    import { computed, defineComponent, ref } from 'vue';
    import { findLastIndex } from 'lodash';
    import { useAuthState } from '@/store/authStore';
    import { FileTypes, Message, MessageBodyType, MessageTypes, SystemBody } from '@/types';
    import moment from 'moment';
    import { statusList } from '@/store/statusStore';
    import AvatarImg from '@/components/AvatarImg.vue';
    import { useRouter } from 'vue-router';
    import { isBlocked } from '@/store/blockStore';

    export default defineComponent({
        name: 'ChatCard',
        components: { AvatarImg },
        props: {
            chat: Object,
            collapsed: Boolean,
        },
        emits: ['selectChat'],
        setup(props) {
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

            return {
                status,
                newMessages,
                lastReadByMe,
                lastMessage,
                lastMessageBody,
                timeAgo,
                router,
                user,
                currentRoute,
                unreadMessagesAmount,
                blocked,
            };
        },
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
