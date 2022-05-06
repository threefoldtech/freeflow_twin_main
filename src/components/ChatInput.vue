<template>
    <GifSelector v-if="showGif" v-on:sendgif="sendGif" style="z-index: 10000" v-on:close="hideGif" />
    <div v-if="action" class="flex justify-between mt-2 p-4 bg-white border-b border-t">
        <div class="flex flex-row">
            <div class="text-accent-300 mr-4 self-center">
                <i class="fa fa-reply fa-2x" v-if="action?.type === MessageAction.REPLY"></i>
                <i class="fa fa-pen fa-2x" v-else-if="action?.type === MessageAction.EDIT"></i>
            </div>
            <div class="w-full break-all overflow-y-auto">
                <b v-if="action?.type === MessageAction.REPLY">{{ action.message.from }}</b>
                <p class="text-ellipsis max-h-12 overflow-y-auto mr-2">{{ getActionMessage }}</p>
            </div>
        </div>
        <button @click="clearAction">
            <i class="fas fa-times"></i>
        </button>
    </div>
    <div class="md:p-2 bg-white flex flex-col min-h-[3em] md:flex-row" @paste="onPaste">
        <div class="md:col-span-4 flex flex-nowrap md:bg-transparent bg-gray-200" :class="{ hidden: !collapsed }">
            <button class="hover:text-icon mx-2 my-0 p-0 self-center flex-1 pt-0.5" @click="toggleGif">
                <h2>GIF</h2>
            </button>
            <button class="hover:text-icon mx-2 my-0 p-0 self-center flex-1" @click.stop="selectFile">
                <i class="fas fa-paperclip transform" style="--tw-rotate: -225deg"></i>
            </button>
            <input class="hidden" type="file" id="fileinput" ref="fileinput" @change="changeFile" />
            <button
                class="hover:text-icon mx-2 my-0 p-0 self-center flex-1"
                @click.stop="startRecording"
                v-if="!stopRecording"
            >
                <i class="fas fa-microphone"></i>
            </button>
            <button class="hover:text-icon mx-2 my-0 p-0 self-center flex-1" @click.stop="stopRecording" v-else>
                <i class="fas fa-circle text-red-600"></i>
            </button>

            <span
                ref="emojipicker"
                :class="{ hidden: !showEmoji }"
                style="position: absolute; bottom: 75px; z-index: 10000"
            >
                <unicode-emoji-picker v-pre></unicode-emoji-picker>
            </span>

            <button
                class="hover:text-icon mx-2 my-0 p-0 self-center flex-1"
                @click.stop="toggleEmoji"
                v-if="!attachment"
            >
                😃
            </button>
        </div>
        <div class="flex flex-row flex-1">
            <button
                class="hover:text-icon mx-2 my-0 p-0 self-center md:hidden"
                @click="collapsed = !collapsed"
                :key="collapsed.toString()"
            >
                <i v-if="collapsed" class="fas fa-chevron-down"></i>
                <i v-else class="fas fa-chevron-up"></i>
            </button>
            <div class="flex flex-col w-full">
                <div
                    class="bg-accent-100 inline-flex text-sm rounded flex-row h-8 pl-3 mt-1 mr-2 w-min"
                    v-if="attachment"
                >
                    <div class="self-center">
                        <i class="fas fa-file"></i>
                    </div>
                    <span class="ml-2 mr-1 leading-relaxed truncate max-w- self-center">
                        {{ attachment.name }}
                    </span>
                    <button class="hover:text-icon p-2 mx-0 self-center" @click.stop="removeFile">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="flex">
                    <form class="w-full" @submit.prevent="chatsend" @keydown.enter.prevent="chatsend">
                        <div class="mt-1 border-b border-gray-300 focus-within:border-primary">
                            <textarea
                                v-model="messageInput"
                                class="block w-full pl-1 min-h-[24px] max-h-[150px] h-9 resize-none overflow-y-auto whitespace-pre-wrap border-0 border-transparent focus:border-primary focus:ring-0 sm:text-sm"
                                autofocus
                                maxlength="2000"
                                @input="resizeTextarea()"
                                ref="message"
                                placeholder="Write a message ..."
                            />
                        </div>
                    </form>

                    <button class="hover:text-icon mx-2 my-0 p-0 self-center" @click="chatsend">
                        <i class="fas fa-paper-plane"></i>
                    </button>
                </div>
            </div>
        </div>
    </div>
    <div
        class="overlay-emoji"
        :class="{ hidden: !showEmoji }"
        @click="hideEmoji"
        style="position: fixed; width: 100vw; height: 100vh; background: transparent; top: 0; left: 0; z-index: 9999"
    ></div>
    <div
        class="overlay-gif"
        :class="{ hidden: !showGif }"
        @click="hideGif"
        style="position: fixed; width: 100vw; height: 100vh; background: transparent; top: 0; left: 0; z-index: 9999"
    ></div>
</template>
<script lang="ts" setup>
    import { computed, nextTick, ref, watch } from 'vue';
    import {
        clearMessageAction,
        draftMessage,
        editMessage,
        MessageAction,
        messageState,
        replyMessage,
        usechatsActions,
    } from '@/store/chatStore';
    import GifSelector from '@/components/GifSelector.vue';
    import { useAuthState } from '@/store/authStore';
    import { Chat, FileTypes, Message, MessageBodyType, MessageTypes, QuoteBodyType } from '@/types';
    import { uuidv4 } from '@/common';
    import { useScrollActions } from '@/store/scrollStore';
    import { EmojiPickerElement } from 'unicode-emoji-picker';

    const emit = defineEmits(['messageSend', 'failed']);

    interface IProps {
        chat: Chat;
    }

    const props = defineProps<IProps>();

    // Not actually a vue component but CustomElement ShadowRoot. I know vue doesnt really like it and gives a warning.
    new EmojiPickerElement();

    const { sendMessage, sendFile } = usechatsActions();

    const message = ref(null);
    const messageInput = ref('');
    const fileinput = ref();
    const attachment = ref();

    const stopRecording = ref(null);
    const showEmoji = ref(false);

    const { addScrollEvent } = useScrollActions();

    const resizeTextarea = () => {
        let area = message.value;
        area.style.height = '36px';
        area.style.height = area.scrollHeight + 'px';
    };

    if (props.chat.draft) {
        if (props.chat.draft?.action === 'EDIT') {
            messageInput.value = String(props.chat.draft.body.body);
            editMessage(props.chat.draft.to, props.chat.draft.body);
        }
        if (props.chat.draft?.action === 'REPLY') {
            messageInput.value = String(props.chat.draft.body.message);
            replyMessage(props.chat.draft.to, props.chat.draft.body.quotedMessage);
        }
        if (!props.chat.draft.action) {
            messageInput.value = String(props.chat.draft.body);
        }
    }
    const selectedId = String(props.chat.chatId);

    const action = computed(() => {
        if (!selectedId) {
            return;
        }
        return messageState?.actions[selectedId];
    });

    const clearAction = () => {
        messageInput.value = '';
        clearMessageAction(selectedId);
    };

    watch(action, () => {
        if (action.value && message.value) {
            message.value.focus();
        }
        if (action?.value?.type === MessageAction.EDIT) {
            if (action.value.message.type === MessageTypes.QUOTE) {
                messageInput.value = action.value.message.body.message;
            } else {
                messageInput.value = action.value.message.body;
            }
        }
        draftMessage(selectedId, createMessage());
        nextTick(() => {
            resizeTextarea();
        });
    });

    watch(messageInput, () => {
        draftMessage(selectedId, createMessage());
    });

    const createEditBody = (action: { message: { body: { message: string }; type: MessageBodyType } }) => {
        let newBody = action.message.body;
        //space for later types
        switch (action.message.type) {
            case MessageTypes.QUOTE:
                newBody.message = message.value.value;
                break;

            default:
                newBody = message.value.value;
                break;
        }
        return newBody;
    };

    const createMessage = () => {
        const { user } = useAuthState();

        switch (action?.value?.type) {
            case MessageAction.REPLY: {
                return {
                    id: uuidv4(),
                    from: user.id,
                    to: <string>selectedId,
                    body: <QuoteBodyType>{
                        message: message.value.value,
                        quotedMessage: action.value.message as Message<MessageBodyType>,
                    },
                    timeStamp: new Date(),
                    type: MessageTypes.QUOTE,
                    replies: [],
                    subject: null,
                    action: MessageAction.REPLY,
                };
            }

            case MessageAction.EDIT: {
                const newBody = createEditBody(action.value);

                const editMessage = {
                    id: <string>action.value.message.id,
                    from: user.id,
                    to: <string>selectedId,
                    body: newBody,
                    timeStamp: action.value.message.timeStamp,
                    type: action.value.message.type,
                    replies: action.value.message.replies,
                    subject: null,
                    updated: new Date(),
                    action: MessageAction.EDIT,
                };
                const editWrapperMessage = {
                    id: uuidv4(),
                    from: user.id,
                    to: <string>selectedId,
                    body: editMessage,
                    timeStamp: new Date(),
                    type: MessageTypes.EDIT,
                    replies: [],
                    subject: null,
                    action: MessageAction.EDIT,
                };

                return editWrapperMessage;
            }

            default: {
                return {
                    id: uuidv4(),
                    from: user.id,
                    to: <string>selectedId,
                    body: message.value.value,
                    timeStamp: new Date(),
                    type: MessageTypes.STRING,
                    replies: [],
                    subject: null,
                    action: null,
                };
            }
        }
    };

    const clearMessage = () => {
        message.value.value = '';
        resizeTextarea();
    };

    const chatsend = async () => {
        messageInput.value = '';
        const { sendMessageObject } = usechatsActions();

        if (action.value) {
            const newMessage = createMessage();
            sendMessageObject(selectedId, newMessage);
            clearAction();
            clearMessage();
            addScrollEvent();
            return;
        }

        if (message.value.value.trim() != '') {
            sendMessage(selectedId, message.value.value);
            clearMessage();
        }

        if (attachment.value) {
            const success = await sendFile(selectedId, attachment.value);
            removeFile();
            if (!success) {
                emit('failed');
                return;
            }
        }
        emit('messageSend');

        showEmoji.value = false;
    };

    const selectFile = () => {
        fileinput.value.click();
    };

    const changeFile = () => {
        attachment.value = fileinput.value?.files[0];
        message.value.focus();
    };

    const removeFile = () => {
        attachment.value = null;
    };

    const startRecording = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
        });

        const mediaRecorder = new MediaRecorder(stream);
        const audioChunks = [];

        mediaRecorder.addEventListener('dataavailable', event => {
            audioChunks.push(event.data);
        });

        mediaRecorder.start();

        stopRecording.value = () => {
            mediaRecorder.addEventListener('stop', async () => {
                const audioBlob = new Blob(audioChunks);
                sendFile(selectedId, audioBlob, true, true);
                stopRecording.value = null;
            });

            mediaRecorder.stop();
            stream.getAudioTracks().forEach(at => at.stop());
        };
    };
    const toggleEmoji = () => {
        showEmoji.value = !showEmoji.value;
    };
    const hideEmoji = () => {
        if (!showEmoji) {
            return;
        }
        showEmoji.value = false;
    };

    const showGif = ref(false);
    const toggleGif = () => {
        showGif.value = !showGif.value;
    };
    const sendGif = async gif => {
        showGif.value = false;
        const { sendMessage } = usechatsActions();
        sendMessage(selectedId, gif, 'GIF');
        emit('messageSend');
        addScrollEvent();
    };
    const hideGif = () => {
        showGif.value = false;
    };

    nextTick(() => {
        message.value.focus();
        const emojiPicker = document.querySelector('unicode-emoji-picker');
        emojiPicker.addEventListener('emoji-pick', event => {
            message.value.value = `${message.value.value}${event.detail.emoji}`;
            const emoji = `${event.detail.emoji}`;
            messageInput.value = messageInput.value + emoji;
            message.value.focus();
        });
    });

    const onPaste = (e: ClipboardEvent) => {
        if (!e.clipboardData) {
            return;
        }

        var items = e.clipboardData.items;

        if (!items) {
            return;
        }

        for (var i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') == -1) {
                continue;
            }

            var pastedImage: File = items[i].getAsFile();
            attachment.value = pastedImage;
            message.value.focus();
        }
    };

    const getActionMessage = computed(() => {
        const message = props.chat?.messages.find(m => m.id === action.value?.message.id);
        if (!message) return 'Message not found';
        switch (action.value.message.type) {
            case MessageTypes.QUOTE:
                return (message.body as QuoteBodyType).message;
            case MessageTypes.STRING:
                return message.body;
            case MessageTypes.FILE:
                if (message.body.type === FileTypes.RECORDING) return 'Voice message';
                return message.type;
            default:
                return message.type;
        }
    });

    const collapsed = ref(true);
</script>

<style scoped></style>
