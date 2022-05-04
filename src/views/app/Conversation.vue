<template>
    <p class='hidden'>{{ JSON.stringify(openBlockDialogFromOtherFile) }}</p>
    <div :key='conversationComponentRerender' class='h-full w-full'>
        <appLayout>
            <template v-slot:top>
                <div v-if='chat' :class="{ 'group-chat': chat?.isGroup }" class='w-full flex md:px-4 text-white'>
                    <div class='place-items-center grid mr-4'>
                        <AvatarImg :id='chat.chatId' :showOnlineStatus='false'></AvatarImg>
                    </div>
                    <div class='py-4 pl-2'>
                        <p class='font-bold font overflow-hidden overflow-ellipsis'>
                            {{ chat.name }}
                        </p>
                        <p v-if='!blocked' class='font-light group-chat:hidden'>
                            {{ status?.isOnline ? 'Is online' : 'Is offline' }}
                        </p>
                        <p v-if='blocked' class='group-chat:hidden text-red-500'>BLOCKED</p>
                        <p class='font-thin hidden group-chat:span'>Group chat</p>
                    </div>
                </div>
                <div v-else>Loading</div>
            </template>
            <template v-slot:actions>
                <div :class="{ 'group-chat': chat?.isGroup }">
                    <div class='relative'>
                        <button class='text-lg text-white md:hidden' @click='showMenu = true'>
                            <i class='fas fa-ellipsis-v'></i>
                        </button>
                        <div v-if='showMenu' class='backdrop' @click='showMenu = false'></div>
                        <div
                            v-if='showMenu'
                            class='right-2 z-20 -top-2 flex flex-col bg-white shadow-sm w-40 rounded absolute py-2 pl-2'
                        >
                            <button
                                class='flex align-center'
                                @click='
                                    popupMeeting();
                                    showMenu = false;
                                '
                            >
                                <div class='w-8 justify-center align-center'>
                                    <i class='fas fa-video'></i>
                                </div>
                                <span class='ml-1 text-left'>Call</span>
                            </button>

                            <button
                                class='flex'
                                @click='
                                    toggleSideBar();
                                    showMenu = false;
                                '
                            >
                                <div class='w-8'>
                                    <i class='fas fa-info-circle'></i>
                                </div>
                                <span class='ml-1 text-left'>Info</span>
                            </button>

                            <button
                                class='flex'
                                @click='
                                    blockChat();
                                    showMenu = false;
                                '
                            >
                                <div class='w-8'>
                                    <i class='fas fa-minus-circle'></i>
                                </div>
                                <span class='ml-1 text-left'>Block chat</span>
                            </button>
                            <button
                                class='flex'
                                @click='
                                    leaveChat();
                                    showMenu = false;
                                '
                            >
                                <div class='w-8'>
                                    <i class='fas fa-trash'></i>
                                </div>
                                <span class='ml-1 text-left'>Delete chat</span>
                            </button>
                        </div>
                    </div>
                </div>
            </template>
            <template v-slot:default>
                <div :class="{ 'group-chat': chat?.isGroup }" class='flex flex-row relative h-full w-full'>
                    <ChatList class='hidden md:inline-block' />
                    <div
                        v-if='chat'
                        :key='chat.id + selectedId'
                        :class='{ flex: !showSideBar, hidden: showSideBar }'
                        class='relative h-full xl:flex flex-col flex-1'
                    >
                        <FileDropArea
                            class='h-full flex flex-col'
                            @send-file='files => files.forEach(f => sendFile(chat.chatId, f))'
                        >
                            <div
                                class='topbar h-14 bg-white flex-row border border-t-0 border-b-0 border-r-0 border-gray-100 hidden md:flex'
                            >
                                <div class='py-2 pl-4 flex-1'>
                                    <p class='font-bold font overflow-hidden overflow-ellipsis w-80'>
                                        {{ chat.name }}
                                        <span v-if='!online' class='font-normal text-xs text-red-600'>
                                            You appear to be offline
                                        </span>
                                    </p>
                                    <p v-if='!blocked' class='font-thin'>
                                        {{ getChatStatus.message }}
                                        <span v-if='getChatStatus?.lastSeen' class='group-chat:hidden'
                                        >, active <TimeContent :time='getChatStatus.lastSeen.toDate()'
                                        /></span>
                                    </p>
                                    <p v-if='blocked' class='text-red-500'>BLOCKED</p>
                                </div>
                                <div class='h-full flex items-center self-end px-8 space-x-4'>
                                    <button
                                        class='focus:outline-none hover:text-accent-300 text-gray-500'
                                        @click='popupMeeting'
                                    >
                                        <i class='fas fa-video fa-w-12'> </i>
                                    </button>

                                    <button
                                        :class="{ 'text-accent-300': showSideBar, 'text-gray-500': !showSideBar }"
                                        class='focus:outline-none hover:text-accent-300'
                                        @click='toggleSideBar'
                                    >
                                        <div class='hidden xl:inline'>
                                            <i
                                                class='far fa-window-maximize transform fa-w-12'
                                                style='--tw-rotate: 90deg'
                                            >
                                            </i>
                                        </div>
                                        <div class='inline xl:hidden'>
                                            <i class='fa fa-info-circle fa-w-12'> </i>
                                        </div>
                                    </button>
                                </div>
                            </div>
                            <MessageBox ref='messageBox' :chat='chat' style='flex: 2'>
                                <div></div>
                                <template v-slot:viewAnchor>
                                    <div
                                        id='viewAnchor'
                                        :ref='viewAnchor'
                                        style='
                                            height: 40vh;
                                            position: absolute;
                                            bottom: 0;
                                            width: 50%;
                                            pointer-events: none;
                                        '
                                    ></div>
                                </template>
                            </MessageBox>
                            <ChatInput v-if='!blocked' :chat='chat' @messageSend='scrollToBottom(true)' />
                        </FileDropArea>
                    </div>
                    <div v-else class='grid h-full w-full place-items-center'>
                        <h2 v-if='isLoading'>Loading</h2>
                        <div v-else class='h-full flex flex-col items-center justify-center'>
                            <div>
                                <img
                                    alt=''
                                    class='h-48 self-center block rounded-md'
                                    src='https://media0.giphy.com/media/14uQ3cOFteDaU/giphy.gif?cid=9dc0c3c4ejjgph9t6jer28bvuz97isp7r48wivzx2n7m0vj0&amp;rid=giphy.gif&amp;ct=g'
                                />
                            </div>
                            <h1 class='mt-4 text-3xl'>404</h1>
                            <h2 class='mt-4'>Chat '{{ selectedId }}' does not exist</h2>
                        </div>
                    </div>
                    <aside
                        v-if='chat'
                        :key="'aside' + chat.id + selectedId"
                        :class="{ 'flex ': showSideBar, hidden: !showSideBar }"
                        class='min-h-screen flex-1 xl:flex-initial flex-col overflow-y-hidden md:w-[400px]'
                    >
                        <div class='bg-white h-14 xl:hidden flex justify-end items-center'>
                            <button
                                class='rounded-full w-8 h-8 collapsed-bar:w-10 collapsed-bar:h-10 bg-gray-100 flex justify-center mr-2'
                                @click='disableSidebar'
                            >
                                <div class='h-full flex items-center justify-center'><i class='fa fa-times'></i></div>
                            </button>
                        </div>

                        <div class='max-w-full w-full bg-white border flex flex-col flex-grow'>
                            <div class='bg-white pb-4 w-full mb-4 p-6 flex min-h-64 justify-start relative'>
                                <XIcon
                                    class='w-5 h-5 absolute right-5 top-5 text-gray-500 cursor-pointer hover:text-gray-700 transition duration-100 hidden xl:inline'
                                    @click='disableSidebar'
                                />
                                <AvatarImg :id='chat.chatId' :showOnlineStatus='!chat.isGroup' />
                                <div class='ml-6'>
                                    <h2
                                        class='break-all w-full overflow-y-auto max-h-28 text-lg text-white font-semibold text-gray-800'
                                    >
                                        {{ chat.name }}
                                    </h2>
                                    <p v-if='chat.isGroup' class='text-gray-500'>{{ chat.contacts.length }} members</p>
                                    <p
                                        v-if='!chat.isGroup'
                                        class='break-all w-full overflow-y-auto font-medium text-center text-gray-400 text-sm'
                                    >
                                        {{ status?.status || 'No status found' }}
                                    </p>
                                </div>
                            </div>

                            <div id='spacer' class='bg-gray-100 h-2 w-full'></div>

                            <group-management
                                :chat='chat'
                                @app-call='popupMeeting'
                                @app-block='blockChat'
                                @app-unblock='unBlockChat'
                                @app-leave='leaveChat'
                                @app-delete='deleteChat'
                            >
                            </group-management>
                        </div>
                    </aside>
                </div>
            </template>
        </appLayout>
        <Dialog v-model='showDialog' class='max-w-10' :noActions='true' @update-model-value='showDialog = false'>
            <template v-slot:title class='center'>
                <h1 class='text-center'>Blocking</h1>
            </template>
            <div>
                Do you really want to block
                <b> {{ chat.name }} </b>?
            </div>
            <div class='flex justify-end mt-2'>
                <button
                    class='rounded-md border border-gray-400 px-4 py-2 justify-self-end'
                    @click='showDialog = false'
                >
                    Cancel
                </button>
                <button class='py-2 px-4 ml-2 text-white rounded-md justify-self-end bg-btnred' @click='doBlockChat'>
                    Block
                </button>
            </div>
        </Dialog>
        <Dialog
            v-model='showLeaveDialog'
            class='max-w-10'
            :noActions='true'
            @update-model-value='showLeaveDialog = false'
        >
            <template v-slot:title class='center'>
                <h1 class='text-center'>{{ chat?.isGroup ? 'Leaving group' : 'Deleting User' }}</h1>
            </template>
            <div v-if='chat?.isGroup'>
                <p v-if='chat?.contacts.length > 1'
                   class='mb-5'>
                    Please select the next admin before leaving the group <b>{{ chat?.name }}</b></p>
                <div
                    v-for='(contact, i) in chat?.contacts.filter(c => c.id !== user.id)'
                    :key='i'
                    @click='setNextAdmin'
                    class='grid grid-cols-12 py-4 mb-4 w-full hover:bg-gray-200 cursor-pointer'
                    :class='contact.id === nextAdmin ?  "bg-gray-300" : "bg-gray-100"'
                >
                    <div class='col-span-2 place-items-center grid rounded-full flex-shrink-0'>
                        <AvatarImg :id='contact.id' small />
                    </div>
                    <p
                        class='col-span-8 pl-4 flex-col flex justify-center overflow-hidden overflow-ellipsis w-full font-semibold'
                    >
                        {{ contact.id }}
                    </p>
                </div>
            </div>
            <div v-else>
                Do you really want to delete
                <b> {{ chat?.name }} </b>
                from your connections?
            </div>
            <div class='flex justify-end mt-2'>
                <button
                    class='rounded-md border border-gray-400 px-4 py-2 justify-self-end'
                    @click='showLeaveDialog = false'
                >
                    Cancel
                </button>
                <button class='py-2 px-4 ml-2 text-white rounded-md justify-self-end bg-btnred' @click='doLeaveChat'>
                    {{ chat?.isGroup ? 'Leave' : 'Delete' }}
                </button>
            </div>
        </Dialog>

        <Dialog
            v-model='showDeleteDialog'
            class='max-w-10'
            :noActions='true'
            @update-model-value='showDeleteDialog = false'>
            <template v-slot:title class='center'>
                <h1 class='text-center'>Deleting group</h1>
            </template>
            <div>
                Do you really want to delete this group
                <b>{{ chat?.name }}</b
                >?
            </div>
            <div class='flex justify-end mt-2'>
                <button
                    class='rounded-md border border-gray-400 px-4 py-2 justify-self-end'
                    @click='showDeleteDialog = false'
                >
                    Cancel
                </button>
                <button class='py-2 px-4 ml-2 text-white rounded-md justify-self-end bg-btnred' @click='doDeleteChat'>
                    Delete
                </button>
            </div>
        </Dialog>

        <Dialog v-model='showError' class='max-w-10' :noActions='true' @update-model-value='showError = false'>
            <template v-slot:title class='center'>
                <h1 class='text-center'>Failed to send file</h1>
            </template>
            <div>The file was to big, the maximum supported size is 20MB.</div>
        </Dialog>
    </div>
</template>

<script setup lang='ts'>
    import { useScrollActions, useScrollState } from '@/store/scrollStore';
    import AppLayout from '../../layout/AppLayout.vue';
    import moment from 'moment';
    import { computed, nextTick, onBeforeMount, onMounted, onUpdated, ref, watch } from 'vue';
    import { useContactsState } from '@/store/contactStore';
    import { each } from 'lodash';
    import { statusList } from '@/store/statusStore';
    import { isLoading, usechatsActions, useChatsState } from '@/store/chatStore';
    import { useSocketActions } from '@/store/socketStore';
    import { useAuthState } from '@/store/authStore';
    import { popupCenter } from '@/services/popupService';
    import ChatList from '@/components/ChatList.vue';
    import ChatInput from '@/components/ChatInput.vue';
    import AvatarImg from '@/components/AvatarImg.vue';
    import GroupManagement from '@/components/GroupManagement.vue';
    import Dialog from '@/components/Dialog.vue';
    import * as crypto from 'crypto-js';
    import { useIntersectionObserver } from '@/lib/intersectionObserver';
    import { useRoute, useRouter } from 'vue-router';
    import { disableSidebar, getShowSideBar, toggleSideBar } from '@/services/sidebarService';
    import { JoinedVideoRoomBody, MessageTypes, SystemMessageTypes } from '@/types';
    import MessageBox from '@/components/MessageBox.vue';
    import Button from '@/components/Button.vue';
    import { isBlocked } from '@/store/blockStore';
    import FileDropArea from '@/components/FileDropArea.vue';
    import TimeContent from '@/components/TimeContent.vue';
    import { XIcon } from '@heroicons/vue/outline';
    import { scrollMessageBoxToBottom } from '@/services/messageHelperService';
    import {
        conversationComponentRerender,
        openBlockDialogFromOtherFile,
        openDeleteDialogFromOtherFile,
    } from '@/store/contextmenuStore';
    import { useOnline } from '@vueuse/core';

    const online = useOnline();
    const messageBox = ref<HTMLElement>(null);
    const route = useRoute();
    const selectedId = ref(<string>route.params.id);
    const { contacts } = useContactsState();
    const { chats } = useChatsState();
    const { user } = useAuthState();
    const m = val => moment(val);
    const showMenu = ref(false);
    const router = useRouter();
    const showDialog = ref(false);
    const showLeaveDialog = ref(false);
    const showDeleteDialog = ref(false);
    const showRemoveUserDialog = ref(false);
    const { retrieveChats, sendFile, sendMessage } = usechatsActions();
    const { sendRemoveChat, sendBlockChat, sendRemoveBlockedChat } = useSocketActions();

    watch(
        () => route.params.id,
        id => {
            selectedId.value = <string>id;
        },
    );

    onBeforeMount(async () => {
        await retrieveChats();
    });

    const truncate = (value, limit = 20) => {
        if (value.length > limit) {
            value = value.substring(0, limit - 3) + '...';
        }
        return value;
    };

    const doSendFiles = async (files: []) => {
        for (const f of files) {
            const success = await sendFile(chat.value.chatId, f);
            if (!success) {
                showError.value = true;
                return;
            }
        }
    };

    const showError = ref(false);

    const getMessagesSortedByUser = computed(() => {
        let chatBlockIndex = 0;
        return chat.value.messages.reduce((acc: any, message) => {
            if (acc[chatBlockIndex] && acc[chatBlockIndex].user === <string>message.from) {
                acc[chatBlockIndex].messages.push(message);
                return acc;
            } else {
                chatBlockIndex++;
            }
            acc[chatBlockIndex] = {
                user: <string>message.from,
                messages: [],
            };
            acc[chatBlockIndex].messages.push(message);
            return acc;
        }, {});
    });

    const nextAdmin = ref('');
    const setNextAdmin = (e) => nextAdmin.value = e.target.innerText;

    const loadedOnce = ref(false);
    const chat = computed(() => {
        const currentChat = chats.value.find(c => c.chatId == selectedId.value);
        if (!currentChat && loadedOnce.value) {
            localStorage.setItem('lastOpenedChat', '');
            router.push({ name: 'whisper' });
        }
        loadedOnce.value = true;
        return currentChat;
    });

    const getChatStatus = computed(() => {
        if (!chat.value) return;
        if (chat.value.isGroup) {
            let message = `${chat.value.contacts.length} members`;
            const onlineMembers = chat.value.contacts.filter(c => statusList[<string>c.id]?.isOnline).length;

            if (onlineMembers > 0) {
                message += `, ${onlineMembers} online`;
            }

            return {
                message: message,
                lastSeen: undefined,
            };
        }

        const status = statusList[<string>chat.value.chatId];
        let lastSeen: string | undefined = undefined;
        lastSeen = status?.isOnline ? undefined : status?.lastSeen?.toString();
        lastSeen = lastSeen?.slice(0, -3);
        return {
            message: status?.isOnline ? 'Online' : 'Offline',
            lastSeen: lastSeen ? moment.unix(Number(lastSeen)) : undefined,
        };
    });

    const popupMeeting = () => {
        // @ts-ignore
        // const str = chat?.contacts ? chat.id : [user.id, chat.id].sort().join();
        const str: string = chat.value.isGroup
            ? chat.value.chatId
            : chat.value.contacts
                .map(c => c.id)
                .sort()
                .join();

        const id = crypto.SHA1(str);
        sendMessage(
            chat.value.chatId,
            {
                type: SystemMessageTypes.JOINED_VIDEOROOM,
                message: `${user.id} joined the video chat`,
                id: id.toString(),
            } as JoinedVideoRoomBody,
            MessageTypes.SYSTEM,
        );

        popupCenter(`https://kutana.uhuru.me/?roomName=${id}&username=${user.id}`, 'video room', 800, 550, true);
    };

    const leaveChat = () => (showLeaveDialog.value = true);

    const deleteChat = () => (showDeleteDialog.value = true);

    const doLeaveChat = async () => {
        if (chat.value.isGroup && chat.value.contacts.length > 1) {
            const { updateContactsInGroup } = usechatsActions();
            if (!nextAdmin.value) return;
            await updateContactsInGroup(chat.value.chatId, user, SystemMessageTypes.USER_LEFT_GROUP, nextAdmin.value);
            return;
        }
        await doDeleteChat();
    };

    const doDeleteChat = async () => {
        if (!chat.value.isGroup) {
            await sendRemoveChat(chat.value.chatId);
            return;
        }
        let contacts = chat.value.contacts.filter(c => c.id.toString() !== user.id.toString());
        //admin gets removed as last from the group
        contacts.push({ id: user.id, location: user.location });
        for (const contact of contacts) {
            if ('location' in contact) {
                const { updateContactsInGroup } = usechatsActions();
                await updateContactsInGroup(chat.value.chatId, contact, SystemMessageTypes.REMOVE_USER);
            }
        }
    };

    const blockChat = () => (showDialog.value = true);

    const doBlockChat = () => {
        showDialog.value = false;
        sendBlockChat(chat.value.chatId);
        router.push({ name: 'whisper' });
    };

    const unBlockChat = async () => sendRemoveBlockedChat(chat.value.chatId);

    const reads = computed(() => {
        const preReads = {};
        each(chat.value.read, (val: string, key: string) => {
            if (key === user.id) return;
            preReads[val] = preReads[val] ? [key, ...preReads[val]] : [key];
        });
        return preReads;
    });

    const viewAnchor = ref(null);

    const { isIntersecting } = useIntersectionObserver(viewAnchor);

    const scrollToBottom = (force = false) => {
        if (!force && !isIntersecting.value) return;
        nextTick(() => scrollMessageBoxToBottom());
    };

    onMounted(() => {
        nextTick(() => scrollToBottom(true));
        if (openBlockDialogFromOtherFile.value) showDialog.value = true;
        if (openDeleteDialogFromOtherFile.value) showLeaveDialog.value = true;
        openDeleteDialogFromOtherFile.value = false;
        openBlockDialogFromOtherFile.value = false;
    });

    onUpdated(() => {
        //For when component is already mounted
        if (openBlockDialogFromOtherFile.value) showDialog.value = true;
        if (openDeleteDialogFromOtherFile.value) showLeaveDialog.value = true;
        openDeleteDialogFromOtherFile.value = false;
        openBlockDialogFromOtherFile.value = false;
    });

    const status = computed(() => {
        return statusList[selectedId.value];
    });

    const { scrollEvents } = useScrollState();
    const { shiftScrollEvent } = useScrollActions();

    watch(scrollEvents, () => {
        if (!scrollEvents || scrollEvents.length === 0) return;
        nextTick(() => {
            scrollToBottom(scrollEvents[0]);
            shiftScrollEvent();
        });
    });

    const blocked = computed(() => {
        if (!chat.value || chat.value.isGroup) return false;
        return isBlocked(<string>chat.value.chatId);
    });

    let activeItem = ref('edit');
    const isActive = menuItem => {
        return activeItem.value === menuItem;
    };

    const setActive = menuItem => {
        activeItem.value = menuItem;
    };

    const filteredContacts = computed(() => {
        return contacts.filter(
            //@ts-ignore
            c => !chat.value.contacts.map(x => x.id).includes(c.id),
        );
    });

    const showSideBar = getShowSideBar();
</script>

<style scoped type='text/css'>
    a.active {
        background: #e5e7eb;
    }
</style>
