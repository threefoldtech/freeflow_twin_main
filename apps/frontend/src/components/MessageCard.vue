<template>
    <div
        class="group flex flex-row"
        :class="{
            'mb-2': isLastMessage,
            'my-message flex-row-reverse lg:flex-row-reverse xl:flex-row ': isMine,
        }"
        v-if="message.type !== MessageTypes.SYSTEM"
        @click="selectedMessageId = message.id"
    >
        <AvatarImg
            @click="$emit('clickedProfile', message.from)"
            small
            class="mx-2 cursor-pointer"
            :class="{
                'opacity-0': !isLastMessage,
            }"
            :id="message.from"
            :showOnlineStatus="false"
        />
        <div class="flex-1">
            <div
                class="flex flex-row flex-wrap my-message:flex-row-reverse md:my-message:flex-row lg:my-message:flex-row-reverse xl:my-message:flex-row"
            >
                <div
                    tabindex="0"
                    class="flex flex-col rounded-lg mb-1 bg-white relative overflow-hidden my-message:bg-accent-200 focus:outline-none focus:ring-4 ring-accent-500 ring-offset-2"
                    :class="{
                        'rounded-tl-none': !isMine && isLastMessage,
                        'rounded-tr': isMine && !isLastMessage,
                        'rounded-tl': !isMine && !isLastMessage,
                        'rounded-tr-none xl:rounded-tr-lg xl:rounded-tl-none': isMine && isLastMessage,
                    }"
                >
                    <header class="p-4 pt-2 pb-0 font-semibold text-sm capitalize" v-if="isFirstMessage && isGroup">
                        {{ message.from }}
                    </header>
                    <main class="max-w-[500px] break-all flex justify-between min-h-[36px]">
                        <MessageContent
                            :message="message"
                            :key="message.id + message.body"
                            :isDownloadingAttachment="isDownloadingAttachment"
                        ></MessageContent>
                    </main>
                    <div class="h-9 items-center absolute right-1.5 -bottom-3 hidden my-message:block">
                        <i class="fas fa-check-double text-accent-300" v-if="isRead"></i>
                        <i class="fas fa-check text-gray-400" v-else></i>
                    </div>
                </div>
                <div
                    class="group-hover:flex pb-4 pl-4 md:hidden mt-auto xl:sticky xl:bottom-0"
                    :class="{ flex: selectedMessageId === message.id, hidden: selectedMessageId !== message.id }"
                >
                    <span
                        class="reply text-xs sm:pr-4 pr-2 cursor-pointer hover:underline hidden my-message:inline"
                        @click="editMessage(props.chatId, message)"
                        v-if="message.type === MessageTypes.STRING || message.type === MessageTypes.QUOTE"
                    >
                        <i class="fa fa-pen"></i>
                        <span class="text-gray-600 sm:pl-2 pl-1">Edit</span>
                    </span>

                    <span
                        class="reply text-xs sm:pr-4 pr-2 cursor-pointer hover:underline"
                        v-if="message.type !== 'DELETE'"
                        @click="replyMessage(props.chatId, message)"
                    >
                        <i class="fa fa-reply"></i>
                        <span class="text-gray-600 sm:pl-2 pl-1">Reply</span>
                    </span>
                    <span
                        class="delete text-xs sm:pr-4 pr-2 cursor-pointer hover:underline hidden my-message:inline"
                        @click="deleteMessage(message)"
                        v-if="message.type !== 'DELETE'"
                    >
                        <i class="fa fa-trash"></i>
                        <span class="text-gray-600 sm:pl-2 pl-1">Delete</span>
                    </span>
                    <span
                        class="reply text-xs sm:pr-4 pr-2 cursor-pointer hover:underline hidden my-message:inline"
                        @click="$emit('openEditShare', props.message)"
                        v-if="message.type === MessageTypes.FILE_SHARE"
                    >
                        <i class="fa fa-pen"></i>
                        <span class="text-gray-600 sm:pl-2 pl-1">Edit permissions</span>
                    </span>
                    <span
                        v-if="message.type === MessageTypes.FILE"
                        class="reply text-xs sm:pr-4 pr-2 cursor-pointer hover:underline"
                        @click="downloadAttachmentToQuantum(message)"
                    >
                        <i class="fa fa-download"></i>
                        <span class="text-gray-600 sm:pl-2 pl-1">Download</span>
                    </span>
                    <div class="sm:pr-4 pr-2 text-gray-600 date inline-block text-xs">
                        <Time :time="new Date(message.timeStamp)" />
                    </div>
                </div>
            </div>
            <div class="flex flex-col mb-4 ml-4 border-l-2 pl-2" v-if="message.replies?.length > 0">
                <div class="text-gray-400 self-start">Replies:</div>
                <div v-for="reply in message.replies" :key="reply.id" class="card flex mb-1">
                    <AvatarImg class="mr-2" small :id="reply.from" :showOnlineStatus="false" />
                    <div
                        class="flex rounded-xl overflow-hidden"
                        :class="{
                            'bg-white': reply.from !== user.id,
                            'bg-accent-300': reply.from === user.id,
                        }"
                    >
                        <main class="max-w-[750px] break-all flex justify-between">
                            <MessageContent
                                :message="reply"
                                :isDownloadingAttachment="isDownloadingAttachment"
                            ></MessageContent>
                        </main>
                    </div>

                    <div style="margin-top: auto" class="actions pb-4 pl-4 flex">
                        <span
                            class="reply text-xs pr-4 cursor-pointer hover:underline"
                            @click="deleteReply(message, reply)"
                            v-if="reply.from === user?.id && reply.body !== 'Message has been deleted'"
                        >
                            <i class="fa fa-trash"></i>
                            <span class="text-gray-600 pl-2">Delete</span>
                        </span>
                        <div class="pr-4 text-gray-600 date inline-block text-xs">
                            <Time :time="new Date(message.timeStamp)" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div v-else>
        <MessageContent :message="message" :isDownloadingAttachment="isDownloadingAttachment"></MessageContent>
    </div>
</template>

<script setup lang="ts">
    import { onMounted, ref, watch } from 'vue';
    import AvatarImg from '@/components/AvatarImg.vue';
    import MessageContent from '@/components/MessageContent.vue';
    import { Message, MessageBodyType, StringMessageType, MessageTypes } from '@/types';
    import { useAuthState } from '@/store/authStore';
    import {
        sendMessageObject,
        usechatsActions,
        selectedMessageId,
        editMessage,
        replyMessage,
    } from '@/store/chatStore';
    import { useScrollActions } from '@/store/scrollStore';
    import Time from '@/components/Time.vue';
    import axios from 'axios';

    import {
        currentRightClickedItem,
        RIGHT_CLICK_ACTIONS_MESSAGE,
        rightClickedItemIsMessage,
        rightClickItemAction,
        triggerWatchOnRightClickItem,
    } from '@/store/contextmenuStore';
    import { calcExternalResourceLink } from '@/services/urlService';

    const { user } = useAuthState();
    const { addScrollEvent } = useScrollActions();

    interface IProps {
        message: Message<any>;
        chatId: string;
        isMine: boolean;
        isGroup: boolean;
        isReadByMe: boolean;
        isRead: boolean;
        isFirstMessage: boolean;
        isLastMessage: boolean;
    }

    const isDownloadingAttachment = ref<boolean>(false);

    const props = defineProps<IProps>();
    const emit = defineEmits(['openEditShare', 'clickedProfile']);

    onMounted(() => {
        addScrollEvent();
        if (!props.isReadByMe) read();
    });

    const read = () => {
        const { readMessage } = usechatsActions();
        readMessage(props.chatId, props.message.id.toString());
    };

    const deleteMessage = (message: Message<MessageBodyType>) => {
        const updatedMessage: Message<StringMessageType> = {
            chatId: props.chatId,
            id: message.id,
            from: message.from,
            to: message.to,
            body: 'Message has been deleted',
            timeStamp: message.timeStamp,
            type: MessageTypes.DELETE,
            replies: [],
            subject: null,
        };
        sendMessageObject(props.chatId, updatedMessage);
    };

    const deleteReply = (message: Message<StringMessageType>, reply) => {
        const updatedMessage: Message<StringMessageType> = {
            chatId: props.chatId,
            id: reply.id,
            from: reply.from,
            to: reply.to,
            body: 'Message has been deleted',
            timeStamp: message.timeStamp,
            type: MessageTypes.DELETE,
            replies: [],
            subject: message.id,
        };
        sendMessageObject(props.chatId, updatedMessage);
    };

    const downloadAttachmentToQuantum = async (message: Message<MessageBodyType>) => {
        const url = calcExternalResourceLink((message.body as { url: string }).url);
        const res = await axios.get(url, { responseType: 'blob' });
        const blob = new Blob([res.data], { type: res.headers['content-type'] });
        const filename = res.headers['content-disposition'].split('filename=')[1].split('.')[0];
        const extension = res.headers['content-disposition'].split('.')[1].split(';')[0];

        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = `${filename}.${extension}`;
        link.click();
    };

    watch(
        triggerWatchOnRightClickItem,
        async () => {
            if (!rightClickedItemIsMessage(currentRightClickedItem.value)) return;
            if (currentRightClickedItem.value.data.id !== props.message.id) return;

            switch (rightClickItemAction.value) {
                case RIGHT_CLICK_ACTIONS_MESSAGE.REPLY:
                    replyMessage(props.chatId, props.message);
                    break;

                case RIGHT_CLICK_ACTIONS_MESSAGE.EDIT:
                    editMessage(props.chatId, props.message);
                    break;

                case RIGHT_CLICK_ACTIONS_MESSAGE.DELETE:
                    deleteMessage(props.message);
                    break;

                default:
                    break;
            }
            rightClickItemAction.value = null;
        },
        { deep: true }
    );
</script>
<style lang="css" scoped></style>
