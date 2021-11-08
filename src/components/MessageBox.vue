<template>
    <div ref="messageBoxLocal" class="overflow-y-auto overflow-x-hidden" @scroll="handleScroll">
        <div class="relative w-full mt-8 px-4">
            <div v-if="chatInfo.isLoading" class="flex flex-col justify-center items-center w-full">
                <Spinner />
                <span>Loading more messages</span>
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
                    :isread="i <= lastRead"
                    :isreadbyme="i <= lastReadByMe"
                    :message="message"
                    @copy="copyMessage($event, message)"
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
                    class="
                        hover:shadow-lg
                        transition
                        duration-300
                        bg-gray-200
                        rounded
                        w-40
                        h-50
                        relative
                        flex
                        justify-center
                        items-center
                        mr-2
                        mb-2
                        mt-4
                        group

                    "
                >
                    <XCircleIcon
                        class="
                            invisible
                            w-8
                            h-8
                            absolute
                            -right-4
                            -top-4
                            text-gray-600
                            group-hover:visible
                            cursor-pointer
                            hover:text-accent-800
                            z-50
                            drop-shadow-md
                        "
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
                        <ExclamationIcon v-if="image.error" class="w-8 h-8 text-white drop-shadow-md"  />
                        <p
                            v-if="image.retry"
                            @click="retry(image)"
                            class="hidden text-white font-semibold cursor-pointer mt-4 drop-shadow-md"
                        >
                            Try again
                        </p>
                        <p v-if="!image.error" class="text-white font-medium loading mt-4 drop-shadow-md">Uploading</p>
                        <p
                            v-if="image.error"
                            class="font-medium mt-4 text-center"
                            :class="{ 'text-white': image.isImage, 'text-white font-semibold drop-shadow-md': !image.isImage }"
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
    import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
    import { findLastIndex } from 'lodash';
    import { isFirstMessage, isLastMessage, showDivider, messageBox } from '@/services/messageHelperService';
    import { imageUploadQueue, usechatsActions } from '@/store/chatStore';
    import { useScrollActions } from '@/store/scrollStore';
    import Spinner from '@/components/Spinner.vue';
    import { Chat, Message, MessageBodyType, MessageTypes } from '@/types';
    import { XCircleIcon, ExclamationIcon } from '@heroicons/vue/solid';

    interface IProps {
        chat: Chat;
    }

    const messageBoxLocal = ref(null);

    watch(messageBoxLocal, () => {
        //Refs can't seem to bind to refs in other files in script setup
        messageBox.value = messageBoxLocal.value;
    });

    const props = defineProps<IProps>();

    const retry = image => {};

    const cancelUpload = image => {
        image.cancelToken.cancel('Operation canceled by the user.');
        imageUploadQueue.value = imageUploadQueue.value.filter(el => el.id !== image.id);
    };

    const getPercent = image => {
        const percent = Math.round((image?.loaded / image?.total) * 100);
        if (percent === 100) {
            setTimeout(() => {
                imageUploadQueue.value = imageUploadQueue.value.filter(el => el.id !== image.id);
                messageBoxLocal.value.scrollTop = messageBoxLocal.value.scrollHeight;
                window.URL.revokeObjectURL(image.data);
            }, 200);
        }
        return !isNaN(percent) ? percent : 0;
    };

    const { getChatInfo, getNewMessages } = usechatsActions();
    const lastRead = computed(() => {
        let id = <string>user.id;
        //@ts-ignore
        const { [id]: _, ...read } = props.chat.read;

        const reads = Object.values(read);

        return findLastIndex(props.chat.messages, message => reads.includes(<string>message.id));
    });

    const lastReadByMe = computed(() => {
        return findLastIndex(props.chat.messages, message => props.chat.read[<string>user.id] === message.id);
    });
    const handleScroll = async e => {
        let element = messageBox.value;

        const oldScrollHeight = element.scrollHeight;
        if (element.scrollTop < 100) {
            getNewMessages(<string>props.chat.chatId).then(newMessagesLoaded => {
                if (!newMessagesLoaded) return;

                element.scrollTo({
                    top: element.scrollHeight - oldScrollHeight + element.scrollTop,
                    behavior: 'auto',
                });
            });
        }
    };
    const { addScrollEvent } = useScrollActions();
    onMounted(() => {
        //addScrollEvent(true);

        setTimeout(() => {
            messageBoxLocal.value.scrollTop = messageBoxLocal.value.scrollHeight;
        }, 500);
    });

    const copyMessage = (event: ClipboardEvent, message: Message<MessageBodyType>) => {
        let data = '';
        switch (message.type) {
            case MessageTypes.STRING:
            case MessageTypes.GIF:
                data = <string>message.body;
                break;
            case MessageTypes.FILE:
                // @ts-ignore
                data = <string>message.body.filename;
                break;
            case MessageTypes.FILE_SHARE:
                // @ts-ignore
                data = <string>message.body.name;
                break;
            case MessageTypes.QUOTE:
                // @ts-ignore
                data = <string>message.body.message;
                break;
            default:
                return;
        }
        console.log(`COPY: ${data}`);
        event.clipboardData.setData('text/plain', data);
        event.preventDefault();
    };

    const { user } = useAuthState();
    const chatInfo = computed(() => getChatInfo(<string>props.chat.chatId));
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
