<template>
    <div ref="messageBoxLocal" class="overflow-y-auto" @scroll="handleScroll">
        <div class="relative w-full mt-8 px-4">
            <div v-if="chatInfo.isLoading" class="flex flex-col justify-center items-center w-full">
                <Spinner />
                <span>Loading more messages</span>
            </div>
            <div  v-for="(message, i) in chat.messages">
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
            <div v-if='imageUploadQueue.length >= 1' class='flex flex-row overflow-x-auto relative w-full overflow-y-hidden h-24 whitespace-no-wrap '>
                <div  class='flex flex-row absolute left-0 top-0'>
                <div  v-for="(image,idx) in imageUploadQueue" :key='idx'  class="bg-black rounded w-40 h-20 relative overflow-hidden flex justify-center items-center pointer-events-none mr-2 mb-2">
                    <div class='z-40 absolute' :title='image.title' >
                        <p class='text-white font-medium loading'>Uploading</p>
                        <p class='font-semibold text-lg text-white text-center'>{{getPercent(image)}}%</p>
                    </div>
                    <img v-if='image.type' class='opacity-75 z-2 w-40 h-20 object-cover' :alt='image.title' :src="image.data" />
                    <div v-else class='w-full h-full bg-gray-200 opacity-75 z-2'></div>
                </div>
                </div>
            </div>
            <slot name="viewAnchor" />
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

    interface IProps {
        chat: Chat;
    }

    const messageBoxLocal = ref(null);

    watch(messageBoxLocal, () => {
        //Refs can't seem to bind to refs in other files in script setup
        messageBox.value = messageBoxLocal.value;
    });

    const props = defineProps<IProps>();

    const getPercent = ((image) => {
        const percent = Math.round((image?.loaded / image?.total) * 100)
        if (percent === 100){
            setTimeout(() => {
                imageUploadQueue.value = imageUploadQueue.value.filter(el => el.id !== image.id)
                //messageBoxLocal.value.scrollTop = messageBoxLocal.value.scrollHeight
                window.URL.revokeObjectURL(image.data)
            },200)
        }
        return !isNaN(percent) ? percent : 0
    })




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
            messageBoxLocal.value.scrollTop = messageBoxLocal.value.scrollHeight
        }, 500)
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
        0%, 20% {
            color: rgba(0,0,0,0);
            text-shadow:
                .25em 0 0 rgba(0,0,0,0),
                .5em 0 0 rgba(0,0,0,0);}
        40% {
            color: white;
            text-shadow:
                .25em 0 0 rgba(0,0,0,0),
                .5em 0 0 rgba(0,0,0,0);}
        60% {
            text-shadow:
                .25em 0 0 white,
                .5em 0 0 rgba(0,0,0,0);}
        80%, 100% {
            text-shadow:
                .25em 0 0 white,
                .5em 0 0 white;}}
</style>
