<template>
    <div ref='messageBox' class='overflow-y-auto' @scroll='handleScroll'>
        <div class='relative w-full mt-8 px-4'>
            <div v-if='chatInfo.isLoading' class='flex flex-col justify-center items-center w-full'>
                <Spinner />
                <span>Loading more messages</span>
            </div>
            <div v-for='(message, i) in chat.messages'>
                <div v-if='showDivider(chat, i)' class='grey--text text-sm text-center p-4'>
                    {{ moment(message.timeStamp).calendar() }}
                </div>

                <MessageCard
                    :key='`${message.id}-${i <= lastRead}`'
                    :chatId='chat.chatId'
                    :isFirstMessage='isFirstMessage(chat, i)'
                    :isGroup='chat.isGroup'
                    :isLastMessage='isLastMessage(chat, i)'
                    :isMine='message.from === user.id'
                    :isread='i <= lastRead'
                    :isreadbyme='i <= lastReadByMe'
                    :message='message'
                    @copy='copyMessage($event, message)'
                />
            </div>

            <slot name='viewAnchor' />
        </div>
    </div>
</template>
<script lang='ts'>
    import MessageCard from '@/components/MessageCard.vue';
    import { useAuthState } from '@/store/authStore';
    import moment from 'moment';
    import { computed, onMounted, onUnmounted, ref } from 'vue';
    import { findLastIndex } from 'lodash';
    import { isFirstMessage, isLastMessage, messageBox, showDivider } from '@/services/messageHelperService';
    import { usechatsActions } from '@/store/chatStore';
    import { useScrollActions } from '@/store/scrollStore';
    import Spinner from '@/components/Spinner.vue';
    import { Chat, Message, MessageBodyType, MessageTypes } from '@/types';

    export default {
        name: 'MessageBox',
        components: { MessageCard, Spinner },
        props: {
            chat: {},
        },
        setup(props: { chat: Chat }) {
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
                addScrollEvent(true);
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
            return {
                isLastMessage,
                isFirstMessage,
                user,
                moment,
                lastRead,
                lastReadByMe,
                showDivider,
                messageBox,
                handleScroll,
                chatInfo: computed(() => getChatInfo(<string>props.chat.chatId)),
                copyMessage,
            };
        },
    };
</script>
<style scoped type='text/css'></style>
