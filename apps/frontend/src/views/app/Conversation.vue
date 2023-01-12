<template>
    <p class="hidden">{{ JSON.stringify(openBlockDialogFromOtherFile) }}</p>
    <div :key="conversationComponentRerender" class="h-full w-full">
        <appLayout>
            <template #topbar>
                <Topbar>
                    <template #user>
                        <div
                            v-if="chat"
                            :class="{ 'group-chat': chat?.isGroup }"
                            class="w-full flex lg:px-4 text-black"
                        >
                            <div class="place-items-center grid mr-4">
                                <AvatarImg :id="chat.chatId" :showOnlineStatus="false"></AvatarImg>
                            </div>
                            <div class="py-4 pl-2">
                                <p class="font-bold font overflow-hidden overflow-ellipsis">
                                    {{ chat.name }}
                                </p>
                                <p v-if="!blocked" class="font-light group-chat:hidden">
                                    {{ status?.isOnline ? 'Is online' : 'Is offline' }}
                                </p>
                                <p v-if="blocked" class="group-chat:hidden text-red-500">BLOCKED</p>
                                <p class="font-thin hidden group-chat:span">Group chat</p>
                            </div>
                        </div>
                        <div v-else>Loading</div>
                    </template>
                    <template #actions>
                        <div class="flex" :class="{ 'group-chat': chat?.isGroup }">
                            <button
                                v-if="!showSideBar"
                                class="flex"
                                @click="
                                    toggleSideBar();
                                    showMenu = false;
                                "
                            >
                                <InformationCircleIcon class="w-6 text-gray-500" />
                            </button>
                            <button v-if="showSideBar" class="flex" @click="disableSidebar">
                                <XIcon class="w-6 text-gray-500" />
                            </button>
                        </div>
                    </template>
                </Topbar>
            </template>
            <template v-slot:default>
                <div :class="{ 'group-chat': chat?.isGroup }" class="flex flex-row relative h-full w-full">
                    <ChatList :class="{ 'hidden lg:inline-block': chat }" />
                    <div
                        v-if="chat"
                        :key="chat.id + selectedId"
                        :class="{ flex: !showSideBar, hidden: showSideBar }"
                        class="relative h-full xl:flex flex-col flex-1"
                    >
                        <FileDropArea class="h-full flex flex-col" @send-file="files => doSendFiles(files)">
                            <div
                                class="topbar h-14 bg-white flex-row border border-t-0 border-b-0 border-r-0 border-gray-100 hidden lg:flex"
                            >
                                <div class="py-2 pl-4 flex-1">
                                    <p class="font-bold font overflow-hidden overflow-ellipsis w-80">
                                        {{ chat.name }}
                                        <span v-if="!online" class="font-normal text-xs text-red-600">
                                            You appear to be offline
                                        </span>
                                    </p>
                                    <p v-if="!blocked" class="font-thin">
                                        {{ getChatStatus.message.trim()
                                        }}<span v-if="getChatStatus?.lastSeen" class="group-chat:hidden"
                                            >, active <TimeContent :time="getChatStatus.lastSeen.toDate()"
                                        /></span>
                                    </p>
                                    <p v-if="blocked" class="text-red-500">BLOCKED</p>
                                </div>
                                <div class="h-full flex items-center self-end px-8 space-x-4">
                                    <button
                                        v-if="!mobile"
                                        class="focus:outline-none hover:text-accent-300 text-gray-500"
                                        @click="popupMeeting"
                                    >
                                        <i class="fas fa-video fa-w-12"> </i>
                                    </button>

                                    <button
                                        :class="{ 'text-accent-300': showSideBar, 'text-gray-500': !showSideBar }"
                                        class="focus:outline-none hover:text-accent-300"
                                        @click="toggleSideBar"
                                    >
                                        <div class="hidden xl:inline">
                                            <i
                                                class="far fa-window-maximize transform fa-w-12"
                                                style="--tw-rotate: 90deg"
                                            >
                                            </i>
                                        </div>
                                        <div class="inline xl:hidden">
                                            <i class="fa fa-info-circle fa-w-12"> </i>
                                        </div>
                                    </button>
                                </div>
                            </div>
                            <MessageBox @clickedProfile="popupProfile" ref="messageBox" :chat="chat" style="flex: 2">
                                <div></div>
                                <template v-slot:viewAnchor>
                                    <div
                                        id="viewAnchor"
                                        :ref="viewAnchor"
                                        style="
                                            height: 40vh;
                                            position: absolute;
                                            bottom: 0;
                                            width: 50%;
                                            pointer-events: none;
                                        "
                                    ></div>
                                </template>
                            </MessageBox>
                            <ChatInput v-if="!blocked" :chat="chat" @messageSend="scrollToBottom(true)" />
                        </FileDropArea>
                    </div>
                    <div v-else class="grid h-full w-full place-items-center">
                        <h2 v-if="isLoading">Loading</h2>
                        <div v-else class="h-full flex flex-col items-center justify-center">
                            <div>
                                <img
                                    alt=""
                                    class="h-48 self-center block rounded-md"
                                    src="https://media0.giphy.com/media/14uQ3cOFteDaU/giphy.gif?cid=9dc0c3c4ejjgph9t6jer28bvuz97isp7r48wivzx2n7m0vj0&amp;rid=giphy.gif&amp;ct=g"
                                />
                            </div>
                            <h1 class="mt-4 text-3xl">404</h1>
                            <h2 class="mt-4">Chat '{{ selectedId }}' does not exist</h2>
                        </div>
                    </div>
                    <aside
                        v-if="chat"
                        :key="'aside' + chat.chatId + selectedId"
                        :class="{ 'flex ': showSideBar, hidden: !showSideBar }"
                        class="min-h-full flex-1 xl:flex-initial flex-col overflow-y-hidden lg:w-[340px] lg:border-l"
                    >
                        <div class="max-w-full w-full bg-gray-100 xl:bg-white flex flex-col flex-grow">
                            <div class="bg-white p-4 w-full mb-4 lg:flex min-h-64 justify-between items-center hidden">
                                <div class="flex items-center">
                                    <AvatarImg :id="chat.chatId" :showOnlineStatus="!chat.isGroup" />
                                    <div class="ml-6">
                                        <h2
                                            class="break-all w-full overflow-y-auto max-h-28 text-lg text-white font-semibold text-gray-800"
                                        >
                                            {{ chat.name }}
                                        </h2>
                                        <p v-if="chat.isGroup" class="text-gray-500">
                                            {{ chat.contacts.length }} members
                                        </p>
                                        <p
                                            v-if="!chat.isGroup"
                                            class="break-all w-full overflow-y-auto font-medium text-center text-gray-400 text-sm"
                                        >
                                            {{ status?.status || 'No status found' }}
                                        </p>
                                    </div>
                                </div>
                                <XIcon
                                    class="w-6 h-6 text-gray-500 cursor-pointer hover:text-gray-700 transition duration-100 hidden lg:inline justify-self-end"
                                    @click="disableSidebar"
                                />
                            </div>
                            <groupManagement
                                :chat="chat"
                                @app-call="popupMeeting"
                                @app-block="blockChat"
                                @app-unblock="unBlockChat"
                                @app-leave="leaveChat"
                                @app-delete="deleteChat"
                                @app-delete-user="deleteUser"
                                @clickedProfile="popupProfile"
                            >
                            </groupManagement>
                        </div>
                    </aside>
                </div>
            </template>
        </appLayout>
        <Alert v-if="showDialog" :showAlert="showDialog" @close="showDialog = false">
            <template #title> Blocking</template>
            <template #content>
                Do you really want to block
                <b> {{ chat.name }} </b>?
            </template>
            <template #actions>
                <button
                    class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                    @click="doBlockChat"
                >
                    Block
                </button>
                <button
                    class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:w-auto sm:text-sm"
                    @click="showDialog = false"
                >
                    Cancel
                </button>
            </template>
        </Alert>
        <Alert v-if="showLeaveDialog" :showAlert="showLeaveDialog" @close="showLeaveDialog = false">
            <template #title>
                {{ chat.isGroup ? 'Leaving group' : 'Deleting chat' }}
            </template>
            <template #content>
                <div v-if="chat?.isGroup && chat?.adminId === user?.id">
                    <p v-if="chat?.contacts.length > 1" class="mb-5">
                        Please select the next admin before leaving the group <b>{{ chat?.name }}</b>
                    </p>
                    <div class="w-full max-h-[40vw] overflow-y-auto">
                        <div
                            v-for="(contact, i) in chat?.contacts.filter(c => c.id !== user.id)"
                            :key="i"
                            @click="setNextAdmin"
                            class="grid grid-cols-12 py-4 mb-4 w-full hover:bg-gray-200 cursor-pointer"
                            :class="contact.id === nextAdmin ? 'bg-gray-300 hover:bg-gray-300' : 'bg-gray-100'"
                        >
                            <div class="col-span-2 place-items-center grid rounded-full flex-shrink-0">
                                <AvatarImg :id="contact.id" small />
                            </div>
                            <p
                                class="col-span-8 pl-4 flex-col flex justify-center overflow-hidden overflow-ellipsis w-full font-semibold"
                            >
                                {{ contact.id }}
                            </p>
                        </div>
                    </div>
                </div>
                <div v-else>Do you really want to delete all chat history?</div>
            </template>
            <template #actions>
                <button
                    class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                    @click="doLeaveChat"
                >
                    {{ chat?.isGroup ? 'Leave' : 'Delete' }}
                </button>
                <button
                    class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:w-auto sm:text-sm"
                    @click="showLeaveDialog = false"
                >
                    Cancel
                </button>
            </template>
        </Alert>

        <Alert v-if="showDeleteUserDialog" :showAlert="showDeleteUserDialog" @close="showDeleteUserDialog = false">
            <template #title> Deleting user</template>
            <template #content> Do you really want to delete this user from your connections?</template>
            <template #actions>
                <button
                    class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                    @click="doDeleteUser"
                >
                    Delete
                </button>
                <button
                    class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:w-auto sm:text-sm"
                    @click="showDeleteUserDialog = false"
                >
                    Cancel
                </button>
            </template>
        </Alert>

        <Alert v-if="showDeleteDialog" :showAlert="showDeleteDialog" @close="showDeleteDialog = false">
            <template #title>Deleting group</template>
            <template #content>
                Do you really want to delete this group
                <b>{{ chat?.name }}</b
                >?
            </template>
            <template #actions>
                <button
                    class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                    @click="doDeleteChat"
                >
                    Delete
                </button>
                <button
                    class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:w-auto sm:text-sm"
                    @click="showDeleteDialog = false"
                >
                    Cancel
                </button>
            </template>
        </Alert>

        <Dialog v-model="showError" class="max-w-10" :noActions="true" @update-model-value="showError = false">
            <template v-slot:title class="center">
                <h1 class="text-center">Failed to send file</h1>
            </template>
            <div>{{ errorMessage }}</div>
        </Dialog>

        <Dialog v-model="showProfileDialog" @updateModelValue="showProfileDialog = false">
            <template v-slot:title>
                <h1 class="mb-5">User info</h1>
            </template>

            <div class="py-2">
                <div class="flex space-x-5 mb-5 px-4">
                    <AvatarImg :id="selectedUser?.id" large />
                    <h2 class="mt-3 text-xl">{{ selectedUser?.id }}</h2>
                </div>

                <div class="flex space-x-3 px-4" v-if="isPersonFriend !== null">
                    <div class="w-auto">
                        <a
                            class="text-xs text-accent-600 hover:bg-opacity-60 font-semibold flex items-center justify-center px-3 py-2 bg-accent-300 bg-opacity-50 rounded-lg"
                            href="#"
                            @click="goToChat"
                        >
                            <div class="mr-1 h-6 flex items-center flex-shrink-0">
                                <img src="/whisperbold.svg" alt="whisper" />
                            </div>
                            Send private message
                        </a>
                    </div>

                    <div class="w-auto">
                        <a
                            class="text-xs text-gray-800 hover:bg-gray-300 font-semibold flex items-center justify-center px-3 py-2 bg-gray-200 rounded-lg"
                            href="#"
                            @click="goToKutana"
                        >
                            <div class="mr-1 h-6 flex items-center flex-shrink-0">
                                <img src="/kutanabold.svg" alt="kutana" />
                            </div>
                            Go to video room
                        </a>
                    </div>
                </div>
            </div>
        </Dialog>
    </div>
</template>

<script setup lang="ts">
    import { useScrollActions, useScrollState } from '@/store/scrollStore';
    import AppLayout from '../../layout/AppLayout.vue';
    import moment from 'moment';
    import { computed, nextTick, onBeforeMount, onMounted, onUpdated, ref, watch } from 'vue';
    import { useContactsActions, useContactsState } from '@/store/contactStore';
    import { statusList } from '@/store/statusStore';
    import { isLoading, usechatsActions, useChatsState } from '@/store/chatStore';
    import { sendRemoveUser } from '@/store/socketStore';
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
    import { AnonymousContact, Contact, JoinedVideoRoomBody, MessageTypes, SystemMessageTypes } from '@/types';
    import MessageBox from '@/components/MessageBox.vue';
    import Button from '@/components/Button.vue';
    import { userIsBlocked } from '@/store/blockStore';
    import FileDropArea from '@/components/FileDropArea.vue';
    import TimeContent from '@/components/TimeContent.vue';
    import { XIcon, InformationCircleIcon } from '@heroicons/vue/outline';
    import { scrollMessageBoxToBottom } from '@/services/messageHelperService';
    import {
        conversationComponentRerender,
        openBlockDialogFromOtherFile,
        openDeleteDialogFromOtherFile,
        openDeleteUserDialogFromOtherFile,
    } from '@/store/contextmenuStore';
    import { useOnline } from '@vueuse/core';
    import { hasSpecialCharacters } from '@/services/fileBrowserService';
    import Alert from '@/components/Alert.vue';
    import Topbar from '@/components/Topbar.vue';
    import { isMobile } from '@/store/fileBrowserStore';

    const { sendFile, sendMessage } = usechatsActions();
    const { addContact, retrieveDTContacts, retrieveContacts } = useContactsActions();
    const { sendRemoveChat, sendBlockChat, sendUnBlockedChat } = useSocketActions();
    const { contacts } = useContactsState();
    const { chats } = useChatsState();
    const { user } = useAuthState();

    const online = useOnline();
    const messageBox = ref<HTMLElement>(null);

    const m = val => moment(val);
    const showMenu = ref(false);
    const router = useRouter();
    const route = useRoute();

    onBeforeMount(async () => {
        await retrieveDTContacts();
        await retrieveContacts();
    });

    const showDialog = ref(false);
    const showLeaveDialog = ref(false);
    const showDeleteUserDialog = ref(false);
    const showDeleteChatDialog = ref(false);

    const mobile = ref<boolean>(isMobile());

    onMounted(() => {
        nextTick(() => scrollToBottom(true));
        if (openBlockDialogFromOtherFile.value) showDialog.value = true;
        if (openDeleteDialogFromOtherFile.value) showLeaveDialog.value = true;
        if (openDeleteUserDialogFromOtherFile.value) showDeleteUserDialog.value = true;
        showDeleteChatDialog.value = false;
        openDeleteDialogFromOtherFile.value = false;
        openBlockDialogFromOtherFile.value = false;
        openDeleteUserDialogFromOtherFile.value = false;
    });

    onUpdated(() => {
        //For when component is already mounted
        if (openBlockDialogFromOtherFile.value) showDialog.value = true;
        if (openDeleteDialogFromOtherFile.value) showLeaveDialog.value = true;
        if (openDeleteUserDialogFromOtherFile.value) showDeleteUserDialog.value = true;
        showDeleteChatDialog.value = false;
        openDeleteDialogFromOtherFile.value = false;
        openBlockDialogFromOtherFile.value = false;
        openDeleteUserDialogFromOtherFile.value = false;
    });

    const showProfileDialog = ref(false);
    const selectedUser = ref<Contact | AnonymousContact>();

    const isPersonFriend = computed(() => {
        if (user.id === selectedUser.value?.id) return null;
        return contacts.some(item => item.id === selectedUser.value.id);
    });

    const goToChat = async e => {
        e.preventDefault();
        if (user.id === selectedUser.value?.id) return;
        if (!('location' in selectedUser.value)) return;

        if (!isPersonFriend.value) {
            addContact(selectedUser.value.id, selectedUser.value.location);
        }
        await nextTick(async () => {
            localStorage.setItem('lastOpenedChat', selectedUser.value.id.toString());
            await router.push({ name: 'whisper' });
        });
    };

    const goToKutana = async e => {
        e.preventDefault;
        await nextTick(async () => {
            await router.push({ name: 'kutana' });
        });
    };

    const popupProfile = async (contact: Contact | AnonymousContact) => {
        if (!contact) return;
        if (!('location' in contact)) return;

        showProfileDialog.value = true;
        selectedUser.value = contact;
    };

    const truncate = (value, limit = 20) => {
        if (value.length > limit) {
            value = value.substring(0, limit - 3) + '...';
        }
        return value;
    };

    const showError = ref(false);
    const errorMessage = ref('');

    const doSendFiles = async (files: File[]) => {
        for (const f of files) {
            if (hasSpecialCharacters(f.name)) {
                showError.value = true;
                errorMessage.value = 'File name cannot have special characters.';
                return;
            }
            const success = await sendFile(chat.value.chatId, f);
            if (!success) {
                showError.value = true;
                errorMessage.value = 'The file was to big, the maximum supported size is 20MB.';
                return;
            }
        }
    };

    const nextAdmin = ref('');
    const setNextAdmin = e => (nextAdmin.value = e.target.innerText);
    const selectedId = ref(<string>route.params.id);

    const chat = computed(() => {
        const currentChat = chats.value.find(c => c.chatId == selectedId.value);
        if (!currentChat && !isLoading.value) {
            localStorage.setItem('lastOpenedChat', '');
            router.push({ name: 'whisper' });
        }
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
        const lastSeen = status?.isOnline ? undefined : status?.lastSeen?.toString();
        return {
            message: status?.isOnline ? 'Online' : 'Offline',
            lastSeen: lastSeen ? moment.unix(lastSeen.slice(0, -3)) : undefined,
        };
    });

    const popupMeeting = () => {
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
                type: SystemMessageTypes.JOINED_VIDEO_ROOM,
                message: `${user.id} joined the video chat`,
                id: id.toString(),
            } as JoinedVideoRoomBody,
            MessageTypes.SYSTEM
        );

        popupCenter(`https://kutana.uhuru.me/?roomName=${id}&username=${user.id}`, 'video room', 800, 550, true);
    };

    const leaveChat = () => (showLeaveDialog.value = true);

    const showDeleteDialog = ref(false);

    const deleteChat = () => (showDeleteDialog.value = true);

    const deleteUser = () => (showDeleteUserDialog.value = true);

    const doLeaveChat = async () => {
        if (chat.value.isGroup && chat.value.contacts.length > 1) {
            const { updateContactsInGroup } = usechatsActions();
            if (!nextAdmin.value && user.id === chat.value.adminId) return;
            const contact = chat.value.contacts.find(c => c.id === user.id);
            if (!('roles' in contact)) return;
            await updateContactsInGroup(
                chat.value.chatId,
                contact,
                SystemMessageTypes.USER_LEFT_GROUP,
                nextAdmin.value
            );
            return;
        }
        await doDeleteChat();
    };

    const doDeleteChat = async () => {
        await sendRemoveChat(chat.value.chatId);
    };

    const doDeleteUser = async () => {
        await sendRemoveUser(chat.value.chatId);
        showDeleteUserDialog.value = false;
    };

    const blockChat = () => (showDialog.value = true);

    const doBlockChat = () => {
        showDialog.value = false;
        sendBlockChat(chat.value.chatId);
        router.push({ name: 'whisper' });
    };

    const unBlockChat = async () => sendUnBlockedChat(chat.value.chatId);

    const viewAnchor = ref(null);

    const { isIntersecting } = useIntersectionObserver(viewAnchor);

    const scrollToBottom = (force = false) => {
        if (!force && !isIntersecting.value) return;
        nextTick(() => scrollMessageBoxToBottom());
    };

    const status = computed(() => {
        return statusList[selectedId.value];
    });

    const { scrollEvents } = useScrollState();
    const { shiftScrollEvent } = useScrollActions();

    const blocked = computed(() => {
        if (!chat.value || chat.value.isGroup) return false;
        return userIsBlocked(<string>chat.value.chatId);
    });

    const showSideBar = getShowSideBar();

    watch(scrollEvents, () => {
        if (!scrollEvents.value || scrollEvents.value.length === 0) return;
        nextTick(() => {
            scrollToBottom(scrollEvents[0]);
            shiftScrollEvent();
        });
    });

    watch(
        () => route.params.id,
        id => {
            selectedId.value = <string>id;
        }
    );
</script>

<style scoped type="text/css">
    a.active {
        background: #e5e7eb;
    }
</style>
