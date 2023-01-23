<template>
    <div ref="messageBoxLocal" class="overflow-y-auto" @scroll="handleScroll">
        <Dialog :modelValue="showShareDialog" @update-model-value="showShareDialog = false" :noActions="true">
            <template v-slot:title>
                <h1 class="font-medium">
                    Edit permissions for <span>{{ selectedEditFile.body.isFolder ? 'folder: ' : 'file: ' }}</span>
                    <span class="font-semibold">{{ selectedEditFile.body.name }}</span>
                </h1>
            </template>
            <div class="flex items-center rounded-xl bg-gray-100 mb-2 mt-4 mx-4" :key="selectedTab">
                <div class="flex-grow" v-for="(tab, index) in tabs" :key="`${tab}-${index}`">
                    <button
                        @click="selectedTab = index"
                        class="w-full p-2 rounded-xl"
                        :class="{ 'bg-primary text-white': index === selectedTab }"
                    >
                        {{ tab }}
                    </button>
                </div>
            </div>
            <ShareChatTable
                v-if="selectedEditFile && selectedTab === 0"
                :selectedFile="selectedEditFile.body"
                :data="chats"
            ></ShareChatTable>
            <EditShare v-if="selectedEditFile && selectedTab === 1" :selectedFile="selectedEditFile.body" />
        </Dialog>
        <v-contextmenu v-if="rightClickedItem?.data?.type !== 'DELETE'" ref="contextmenu-message">
            <v-contextmenu-item
                v-if="rightClickedItem?.data?.from === user.id && rightClickedItem.data.type === 'STRING'"
                @click="setAction(RIGHT_CLICK_ACTIONS_MESSAGE.EDIT)"
                >Edit message
            </v-contextmenu-item>
            <v-contextmenu-item
                v-if="rightClickedItem?.data?.from === user.id"
                @click="setAction(RIGHT_CLICK_ACTIONS_MESSAGE.DELETE)"
                >Delete
            </v-contextmenu-item>
            <v-contextmenu-item @click="setAction(RIGHT_CLICK_ACTIONS_MESSAGE.REPLY)">Reply</v-contextmenu-item>
        </v-contextmenu>
        <div class="relative w-full mt-8 px-4">
            <div v-if="chatInfo?.isLoading" class="flex flex-col justify-center items-center w-full">
                <Spinner />
            </div>
            <div v-for="(message, i) in chat.messages">
                <div v-if="showDivider(chat, i)" class="grey--text text-xs text-center p-4">
                    {{ moment(message.timeStamp).calendar() }}
                </div>

                <MessageCard
                    :key="`${message.id}-${i <= lastRead}`"
                    :chatId="chat.chatId"
                    :isFirstMessage="isFirstMessage(chat, i)"
                    :isGroup="chat.isGroup"
                    :isLastMessage="isLastMessage(chat, i)"
                    :isMine="message.from === user.id"
                    :isRead="i <= lastRead"
                    :isReadByMe="i <= lastReadByMe"
                    :message="message"
                    @copy="copyMessage($event, message)"
                    @openEditShare="editFileSharePermission"
                    @mousedown.right="setCurrentRightClickedItem(message, RIGHT_CLICK_TYPE.MESSAGE)"
                    @clickedProfile="
                        (id: string) =>
                            $emit(
                                'clickedProfile',
                                chat.contacts.find(c => c.id === id)
                            )
                    "
                    v-contextmenu:contextmenu-message
                />
            </div>
            <slot name="viewAnchor" />
        </div>
        <div
            v-if="imageUploadQueue.length >= 1"
            class="flex flex-row overflow-x-auto relative w-full h-64 whitespace-no-wrap"
        >
            <div class="flex flex-row absolute left-4 top-0 h-full">
                <div
                    v-for="(image, idx) in imageUploadQueue"
                    :key="idx"
                    class="hover:shadow-lg transition duration-300 bg-gray-200 rounded w-40 h-50 relative flex justify-center items-center mr-2 mb-2 mt-4 group"
                >
                    <XCircleIcon
                        class="invisible w-8 h-8 absolute -right-4 -top-4 text-gray-600 group-hover:visible cursor-pointer hover:text-accent-800 z-50 drop-shadow-md"
                        @click="cancelUpload(image)"
                    />
                    <div class="z-40 absolute flex flex-col items-center justify-center" :title="image.title">
                        <svg
                            v-if="!image.error"
                            class="spinnerAnimation mb-4"
                            width="65px"
                            height="65px"
                            viewBox="0 0 66 66"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <circle
                                class="path"
                                fill="none"
                                stroke-width="6"
                                stroke-linecap="round"
                                cx="33"
                                cy="33"
                                r="30"
                            ></circle>
                        </svg>
                        <ExclamationIcon v-if="image.error" class="w-8 h-8 text-white drop-shadow-md" />
                        <p
                            v-if="image.retry"
                            @click="retry(image)"
                            class="text-white font-semibold cursor-pointer mt-4 drop-shadow-md"
                        >
                            Try again
                        </p>
                        <p v-if="!image.error" class="text-white font-medium loading mt-4 drop-shadow-md">Uploading</p>
                        <p
                            v-if="image.error"
                            class="font-medium mt-4 text-center"
                            :class="{
                                'text-white': image.isImage,
                                'text-white font-semibold drop-shadow-md': !image.isImage,
                            }"
                        >
                            {{ image.error_message }}
                        </p>
                        <p v-if="!image.error" class="font-semibold text-lg text-white text-center drop-shadow-md">
                            {{ getPercent(image) }}%
                        </p>
                    </div>
                    <img
                        v-if="image.isImage"
                        class="opacity-75 z-2 w-40 h-60 object-cover rounded"
                        :alt="image.title"
                        :src="image.data"
                    />
                </div>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
    import MessageCard from '@/components/MessageCard.vue';
    import { useAuthState } from '@/store/authStore';
    import moment from 'moment';
    import { computed, nextTick, onMounted, ref, watch } from 'vue';
    import { findLastIndex } from 'lodash';
    import { isFirstMessage, isLastMessage, messageBox, showDivider } from '@/services/messageHelperService';
    import { imageUploadQueue, retrySendFile, usechatsActions, useChatsState } from '@/store/chatStore';
    import { ExclamationIcon, XCircleIcon } from '@heroicons/vue/solid';
    import Spinner from '@/components/Spinner.vue';
    import { Chat, Message, MessageBodyType, MessageTypes, QuoteBodyType, SharedFileInterface } from '@/types';
    import Dialog from '@/components/Dialog.vue';
    import EditShare from '@/components/fileBrowser/EditShare.vue';
    import ShareChatTable from '@/components/fileBrowser/ShareChatTable.vue';
    import {
        currentRightClickedItem,
        RIGHT_CLICK_ACTIONS_MESSAGE,
        RIGHT_CLICK_TYPE,
        rightClickItemAction,
        setCurrentRightClickedItem,
        triggerWatchOnRightClickItem,
        ICurrentRightClickItem,
    } from '@/store/contextmenuStore';

    interface IProps {
        chat: Chat;
    }

    const { chats } = useChatsState();
    const { user } = useAuthState();
    const { getChatInfo, getNewMessages } = usechatsActions();

    const emit = defineEmits(['clickedProfile']);
    const props = defineProps<IProps>();
    const tabs = ['Create shares', 'Edit permissions'];
    const selectedTab = ref(1);

    onMounted(() => nextTick(() => scrollToBottom()));

    const rightClickedItem = computed(() => {
        return currentRightClickedItem.value as ICurrentRightClickItem<Message<any>>;
    });

    const setAction = (action: RIGHT_CLICK_ACTIONS_MESSAGE) => {
        triggerWatchOnRightClickItem.value = !triggerWatchOnRightClickItem.value;
        rightClickItemAction.value = action;
    };

    const messageBoxLocal = ref<HTMLDivElement>(null);

    const scrollToBottom = () => {
        if (!messageBoxLocal.value) return;
        messageBoxLocal.value.scrollTop = messageBoxLocal.value.scrollHeight;
    };

    const showShareDialog = ref(false);
    const selectedEditFile = ref<Message<SharedFileInterface>>(null);

    const editFileSharePermission = file => {
        selectedEditFile.value = file;
        showShareDialog.value = true;
    };

    const retry = file => {
        file.cancelToken.cancel('Operation canceled by the user.');
        retrySendFile(file);
    };

    const cancelUpload = image => {
        image.cancelToken.cancel('Operation canceled by the user.');
        imageUploadQueue.value = imageUploadQueue.value.filter(el => el.id !== image.id);
        window.URL.revokeObjectURL(image.data);
    };

    const getPercent = image => {
        const percent = Math.round((image?.loaded / image?.total) * 100);
        if (percent === 100) {
            setTimeout(() => {
                imageUploadQueue.value = imageUploadQueue.value.filter(el => el.id !== image.id);
                scrollToBottom();
                window.URL.revokeObjectURL(image.data);
            }, 200);
        }
        return !isNaN(percent) ? percent : 0;
    };

    const lastRead = computed(() => {
        if (props.chat.read.constructor.name !== 'Array') return;
        const idx = props.chat.read.findIndex(r => r.userId === props.chat.chatId);
        if (idx === -1) return;
        return findLastIndex(props.chat.messages, message => props.chat.read[idx].messageId === message.id);
    });

    const lastReadByMe = computed(() => {
        if (props.chat.read.constructor.name !== 'Array') return;
        const idx = props.chat.read.findIndex(r => r.userId === user.id);
        if (idx === -1) return;
        return findLastIndex(props.chat.messages, message => props.chat.read[idx].messageId === message.id);
    });

    const handleScroll = async e => {
        let element = messageBox.value;

        const oldScrollHeight = element.scrollHeight;
        if (element.scrollTop === 0) {
            const newMessagesLoaded = await getNewMessages(<string>props.chat.chatId);
            if (!newMessagesLoaded) return;

            messageBoxLocal.value.scrollTo({
                top: element.scrollHeight - oldScrollHeight + element.scrollTop,
                behavior: 'auto',
            });
        }
    };

    const copyMessage = (event: ClipboardEvent, message: Message<MessageBodyType>) => {
        let data = '';
        switch (message.type) {
            case MessageTypes.STRING:
            case MessageTypes.GIF:
                data = String(message.body);
                break;

            case MessageTypes.FILE:
                data = message.body.filename;
                break;

            case MessageTypes.FILE_SHARE:
                data = (message.body as SharedFileInterface).name;
                break;

            case MessageTypes.QUOTE:
                data = (message.body as QuoteBodyType).message;
                break;

            default:
                return;
        }
        event.clipboardData.setData('text/plain', data);
        event.preventDefault();
    };

    const chatInfo = computed(() => getChatInfo(<string>props.chat.chatId));

    watch(messageBoxLocal, () => {
        messageBox.value = messageBoxLocal.value;
    });

    watch(
        () => props.chat.messages[props.chat.messages.length - 1],
        () => {
            nextTick(() => {
                const myName = window.location.host.split('.')[0];
                const lastItem = props.chat.messages[props.chat.messages.length - 1].from;

                const scrollBottom = messageBoxLocal.value.scrollTop + messageBoxLocal.value.clientHeight;
                if (myName !== lastItem && messageBoxLocal?.value?.scrollHeight - scrollBottom > 500) return;

                messageBoxLocal?.value?.scrollTo(0, messageBoxLocal.value.scrollHeight);
            });
        }
    );
</script>
<style scoped type="text/css">
    .loading:after {
        content: ' .';
        animation: dots 1s steps(5, end) infinite;
    }

    @keyframes dots {
        0%,
        20% {
            color: rgba(0, 0, 0, 0);
            text-shadow: 0.25em 0 0 rgba(0, 0, 0, 0), 0.5em 0 0 rgba(0, 0, 0, 0);
        }
        40% {
            color: white;
            text-shadow: 0.25em 0 0 rgba(0, 0, 0, 0), 0.5em 0 0 rgba(0, 0, 0, 0);
        }
        60% {
            text-shadow: 0.25em 0 0 white, 0.5em 0 0 rgba(0, 0, 0, 0);
        }
        80%,
        100% {
            text-shadow: 0.25em 0 0 white, 0.5em 0 0 white;
        }
    }

    .spinnerAnimation {
        animation: rotator 1.4s linear infinite;
    }

    @keyframes rotator {
        0% {
            transform: rotate(0deg);
        }
        100% {
            transform: rotate(270deg);
        }
    }

    .path {
        stroke-dasharray: 187;
        stroke-dashoffset: 0;
        transform-origin: center;
        animation: dash 1.4s ease-in-out infinite, colors 5.6s ease-in-out infinite;
    }

    @keyframes colors {
        0% {
            stroke: white;
        }
        25% {
            stroke: #e3e3e3;
        }
        50% {
            stroke: white;
        }
        75% {
            stroke: #e3e3e3;
        }
        100% {
            stroke: white;
        }
    }

    @keyframes dash {
        0% {
            stroke-dashoffset: 187;
        }
        50% {
            stroke-dashoffset: 46.75;
            transform: rotate(135deg);
        }
        100% {
            stroke-dashoffset: 187;
            transform: rotate(450deg);
        }
    }
</style>
