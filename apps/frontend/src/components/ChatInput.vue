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
            <input class="hidden" type="file" id="fileInput" ref="fileInput" @change="changeFile" />
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

            <div
                v-if="showTagPerson"
                class="absolute bottom-16 left-2 right-2 bg-white p-3 rounded-md shadow-md divide-y"
            >
                <h4 class="mb-1">Members</h4>
                <ul>
                    <li
                        v-for="(contact, idx) in contacts"
                        :key="idx"
                        class="py-3 px-2 flex items-center justify-self-start cursor-pointer hover:bg-gray-100"
                        @click="tagPerson(contact)"
                        :class="{ 'bg-gray-200': activeTag === idx }"
                    >
                        <AvatarImg :id="contact.id" small />
                        <div class="ml-3">
                            <p class="text-sm font-medium text-gray-900">
                                {{ contact.id }}
                                <span class="text-gray-400 font-normal text-xs ml-1">{{ contact.location }}</span>
                            </p>
                        </div>
                    </li>
                </ul>
            </div>

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
                    <form class="w-full" @submit.prevent="chatSend" @keydown.enter.exact.prevent="chatSend">
                        <div class="mt-1 border-b border-gray-300 focus-within:border-primary">
                            <textarea
                                v-model="messageInput"
                                class="block w-full pl-1 min-h-[24px] max-h-[150px] sm:h-9 h-10 resize-none overflow-y-auto whitespace-pre-wrap border-0 border-transparent focus:border-primary focus:ring-0 sm:text-sm"
                                :autofocus="!isMobile()"
                                maxlength="2000"
                                @input="resizeTextarea()"
                                @click="resizeTextarea()"
                                ref="message"
                                placeholder="Write a message ..."
                                @keyup.arrow-up="activeTag > 0 ? activeTag-- : (activeTag = contacts.length - 1)"
                                @keyup.arrow-down="activeTag < contacts.length - 1 ? activeTag++ : (activeTag = 0)"
                                @keydown.tab.prevent="
                                    e => {
                                        e.preventDefault();
                                        if (contacts.length === 1) {
                                            tagPerson(contacts[0]);
                                        }
                                        activeTag > 0 ? activeTag-- : (activeTag = contacts.length - 1);
                                        message.focus();
                                    }
                                "
                                @keyup.esc="
                                    () => {
                                        showTagPerson = false;
                                        message.focus();
                                    }
                                "
                            />
                        </div>
                    </form>

                    <button class="hover:text-icon mx-2 my-0 p-0 self-center" @click="chatSend">
                        <i class="fas fa-paper-plane sm:text-[18px] text-[25px]"></i>
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
    import { isMobile } from '@/store/fileBrowserStore';

    import {
        clearMessageAction,
        draftMessage,
        editMessage,
        MessageAction,
        MessageActionBody,
        messageState,
        replyMessage,
        usechatsActions,
    } from '@/store/chatStore';
    import GifSelector from '@/components/GifSelector.vue';
    import { useAuthState } from '@/store/authStore';
    import {
        Chat,
        Contact,
        FileTypes,
        GroupContact,
        Message,
        MessageBodyType,
        MessageTypes,
        QuoteBodyType,
    } from '@/types';
    import { uuidv4 } from '@/common';
    import { useScrollActions } from '@/store/scrollStore';
    import { EmojiPickerElement } from 'unicode-emoji-picker';
    import AvatarImg from '@/components/AvatarImg.vue';

    import AudioRecorder from 'audio-recorder-polyfill';

    window.MediaRecorder = AudioRecorder;

    const { sendMessage, sendFile } = usechatsActions();
    const { addScrollEvent } = useScrollActions();

    interface IProps {
        chat: Chat;
    }

    const props = defineProps<IProps>();
    new EmojiPickerElement();

    const emit = defineEmits(['messageSend', 'failed']);
    const contactsRef = ref([...props.chat.contacts]);
    const collapsed = ref(true);

    const contacts = computed<(GroupContact | Contact)[]>({
        get() {
            return contactsRef.value.sort((a, b) => a.id.localeCompare(b.id));
        },
        set(newVal) {
            contactsRef.value = newVal;
        },
    });

    const message = ref(null);

    const resizeTextarea = () => {
        let area = message.value;
        area.style.height = '36px';
        area.style.height = area.scrollHeight + 'px';
    };

    const getMessageInput = () => {
        const draft = props.chat?.draft;
        if (!draft?.action) return String(draft?.body ?? '');

        if (draft?.action === 'EDIT') {
            editMessage(draft.to, draft.body, draft.id);
            return String(draft.body);
        }

        const draftBody = draft.body as QuoteBodyType;
        replyMessage(draft.to, draftBody.quotedMessage);
        return String(draftBody.message);
    };

    const messageInput = ref(getMessageInput());
    const selectedId = props.chat.chatId;

    const clearAction = () => {
        messageInput.value = '';
        clearMessageAction(selectedId);
    };

    const createEditBody = (action: MessageActionBody) => {
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

    const action = computed(() => {
        if (!selectedId) return;
        return messageState?.actions[selectedId];
    });

    const createMessage = () => {
        const { user } = useAuthState();
        const chatId = props.chat.chatId;

        switch (action?.value?.type) {
            case MessageAction.REPLY: {
                return {
                    id: uuidv4(),
                    chatId,
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
                return {
                    id: <string>action.value.message.id,
                    chatId,
                    from: user.id,
                    to: <string>selectedId,
                    body: newBody,
                    timeStamp: action.value.message.timeStamp,
                    type: MessageTypes.EDIT,
                    replies: action.value.message.replies,
                    subject: null,
                    action: MessageAction.EDIT,
                };
            }

            default: {
                return {
                    id: uuidv4(),
                    chatId,
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

    const tagPerson = contact => {
        const atIdx = messageInput.value.lastIndexOf('@');
        messageInput.value = messageInput.value.substring(0, atIdx + 1);
        messageInput.value += `${contact.id} `;
        showTagPerson.value = false;
        contacts.value = [...props.chat.contacts];
        message.value.focus();
        return;
    };

    const attachment = ref();
    const showEmoji = ref(false);
    const activeTag = ref(0);

    const chatSend = async () => {
        const atIdx = messageInput.value.lastIndexOf('@');
        if (showTagPerson.value && atIdx > -1) {
            const contact = contacts.value[activeTag.value];
            return tagPerson(contact);
        }

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

    const fileInput = ref();

    const selectFile = () => {
        fileInput.value.click();
    };

    const changeFile = () => {
        attachment.value = fileInput.value?.files[0];
        message.value.focus();
    };

    const removeFile = () => {
        attachment.value = null;
    };

    const stopRecording = ref(null);

    const startRecording = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
        });

        const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/wav' });

        const audioChunks = [];

        mediaRecorder.addEventListener('dataavailable', event => {
            audioChunks.push(event.data);
        });

        mediaRecorder.start();

        stopRecording.value = () => {
            mediaRecorder.addEventListener('stop', async () => {
                const audioBlob = new Blob(audioChunks);
                await sendFile(selectedId, audioBlob, true, true);
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
        isMobile() ? message.value.blur() : message.value.focus();
        const emojiPicker = document.querySelector('unicode-emoji-picker');
        emojiPicker.addEventListener('emoji-pick', event => {
            message.value.value = `${message.value.value}${event.detail.emoji}`;
            const emoji = `${event.detail.emoji}`;
            messageInput.value = messageInput.value + emoji;
            message.value.focus();
        });
    });

    const onPaste = (e: ClipboardEvent) => {
        if (!e.clipboardData) return;

        let items = e.clipboardData.items;

        if (!items) return;

        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') == -1) continue;

            const pastedImage: File = items[i].getAsFile();
            const uniqueName = `${pastedImage.name.split('.')[0]}-${uuidv4()}.${pastedImage.name.split('.').pop()}`;
            const copyOfFile = new File([pastedImage], uniqueName, { type: pastedImage.type });
            attachment.value = copyOfFile;
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
            case MessageTypes.EDIT:
                const body = message.body as string | QuoteBodyType;
                if (typeof body !== 'string') return body.message;
                return body;
            default:
                return message.type;
        }
    });

    const showTagPerson = ref(false);

    watch(messageInput, () => {
        showTagPerson.value = false;
        const messageInputs = messageInput.value?.split(' ');
        const latestMessage = messageInputs ? messageInputs[messageInputs.length - 1] : '';
        if (props.chat.isGroup && latestMessage.startsWith('@')) {
            showTagPerson.value = true;
            contacts.value = [...props.chat.contacts].filter(c =>
                c.id.toLowerCase().includes(latestMessage.toLowerCase().substring(1))
            );
        }

        draftMessage(selectedId, createMessage());
    });

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
</script>

<style scoped></style>
