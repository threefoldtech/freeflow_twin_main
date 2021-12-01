<template>
    <div ref="messageBoxLocal" class="overflow-y-auto" @scroll="handleScroll">
        <Dialog :modelValue="showShareDialog" @update-model-value="showShareDialog = false" :noActions="true">
            <template v-slot:title>
                <h1 class="text-center">
                    Edit permissions for <span>{{ selectedEditFile.body.isFolder ? 'folder ' : 'file ' }}</span>
                    <span class="text-accent-800 font-semibold">{{ selectedEditFile.body.name }}</span>
                </h1>
            </template>
            <div class="flex w-full items-center rounded-xl bg-gray-100 mb-2 mt-4" :key="selectedTab">
                <div class="flex-grow" v-for="(tab, index) in tabs" :key="`${tab}-${index}`">
                    <button
                        @click="selectedTab = index"
                        class="w-full p-2 rounded-xl"
                        :class="{ 'bg-primary text-white': index == selectedTab }"
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
        <div class="relative w-full px-4" :class="{'mt-8':chatInfo.isLoading}">
            <div  v-if='chatInfo.isLoading'  class="flex flex-col justify-center items-center w-full ">
                <Spinner class='mb-6' />
                <span class='text-gray-600 text-xs'>Loading more messages</span>
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
                    @openEditShare="editFileSharePermission"

                />
            </div>

            <slot name="viewAnchor" />
        </div>
    </div>
</template>
<script setup lang="ts">
    import MessageCard from '@/components/MessageCard.vue';
    import { useAuthState } from '@/store/authStore';
    import moment from 'moment';
    import { computed, onMounted, onUnmounted, onUpdated, ref, watch, nextTick } from 'vue';
    import { findLastIndex } from 'lodash';
    import { isFirstMessage, isLastMessage, showDivider, messageBox } from '@/services/messageHelperService';
    import { usechatsActions, usechatsState } from '@/store/chatStore';
    import { useScrollActions } from '@/store/scrollStore';
    import Spinner from '@/components/Spinner.vue';
    import { Chat, Message, MessageBodyType, MessageTypes } from '@/types';
    import SelectedOptions from '@/components/fileBrowser/OptionsSelectedItems.vue';
    import Dialog from '@/components/Dialog.vue';
    import EditShare from '@/components/fileBrowser/OptionsSelectedItem/EditShare.vue';
    import ShareChatTable from '@/components/fileBrowser/OptionsSelectedItem/ShareChatTable.vue';

    interface IProps {
        chat: Chat;
    }

    const { chats } = usechatsState();
    const tabs = ['Create shares', 'Edit permissions'];
    const messageBoxLocal = ref(null);
    const selectedTab = ref<number>(1);
    const props = defineProps<IProps>();
    const showShareDialog = ref<boolean>(false);
    const selectedEditFile = ref<any>(null);

    const editFileSharePermission = file => {
        selectedEditFile.value = file;
        showShareDialog.value = true;
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
        let element = messageBoxLocal.value;
        const oldScrollHeight = element?.scrollHeight;
             if (element.scrollTop < 20) {
            getNewMessages(<string>props.chat.chatId).then(newMessagesLoaded => {
                if (!newMessagesLoaded) return;
                messageBoxLocal.value.scrollTo({
                    top: element.scrollHeight - oldScrollHeight + element.scrollTop,
                    behavior: 'auto',
                });
            });
        }
    };

    onMounted(() => {
        messageBoxLocal?.value?.scrollTo(0, messageBoxLocal.value.scrollHeight);
        localStorage.setItem('lastOpenedChat', props.chat.chatId.toString())
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
        //console.log(`COPY: ${data}`);
        event.clipboardData.setData('text/plain', data);
        event.preventDefault();
    };

    const { user } = useAuthState();
    const chatInfo = computed(() => getChatInfo(<string>props.chat.chatId));
</script>
<style scoped type="text/css"></style>
