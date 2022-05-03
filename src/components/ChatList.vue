<template>
    <section
        :class="{
            'collapsed-bar': collapsed,
            'md:w-16': collapsed,
            'md:w-[400px]': !collapsed,
        }"
        class="bg-white w-full flex flex-col overflow-hidden"
    >
        <div class="relative h-full w-full pt-4 flex-grow-0 flex flex-col">
            <div
                class="flex items-center collapsed-bar:flex-col-reverse justify-center collapsed-bar:mb-0 mb-2 flex-grow-0"
            >
                <div class="flex-1 collapsed-bar:mb-2 flex flex-row items-center">
                    <button
                        class="bg-primary hover:bg-accent-800 transition duration:300 rounded-full text-white w-8 h-8 mx-2 collapsed-bar:w-10 collapsed-bar:h-10"
                        @click="showAddUserDialog = true"
                    >
                        <i class="fas fa-plus"></i>
                    </button>
                    <h1 class="collapsed-bar:hidden pt-1 text-lg">Messages</h1>
                </div>
                <div class="ml-auto collapsed-bar:m-0 collapsed-bar:mb-2 hidden md:block relative">
                    <button
                        :class="{
                            'mr-2': !collapsed,
                        }"
                        class="rounded-full w-8 h-8 collapsed-bar:w-10 collapsed-bar:h-10 bg-gray-100 flex justify-center"
                        @click="
                            collapsed = !collapsed;
                            searchValue = '';
                        "
                    >
                        <div v-if="collapsed" class="h-full flex items-center justify-center">
                            <i class="fas fa-chevron-right"></i>
                        </div>
                        <div v-else class="h-full flex items-center justify-center">
                            <i class="fas fa-chevron-left"></i>
                        </div>
                    </button>
                    <div
                        v-if="filteredChatRequests.length > 0"
                        class="hidden collapsed-bar:block absolute -top-1 right-1 bg-accent-300 h-4 w-4 rounded-full text-xs z-10 align-middle text-center text-white"
                    >
                        {{ filteredChatRequests.length }}
                    </div>
                </div>
            </div>
            <div v-if="!collapsed" class="mt-1 mx-2 relative rounded-md shadow-sm">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <SearchIcon aria-hidden="true" class="h-5 w-5 text-gray-400" />
                </div>
                <input
                    v-model="searchValue"
                    class="focus:ring-primary focus:border-primary block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                    placeholder="Search"
                    type="text"
                />
                <div
                    v-if="!!searchValue"
                    @click="searchValue = ''"
                    class="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                >
                    <i class="fa fa-window-close h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
            </div>
            <div v-if="filteredChatRequests.length > 0" class="collapsed-bar:hidden px-2 mt-4">
                <h2 style="font-size: 1.5em">
                    You have
                    <span style="">
                        {{ filteredChatRequests.length }}
                    </span>
                    new connection request<span v-if="filteredChatRequests.length > 1">s</span>
                </h2>
                <ChatRequestList :chat-requests="filteredChatRequests" />
            </div>
            <div class="flex-grow overflow-auto">
                <div
                    v-if="filteredChatRequests.length === 0 && filteredChats.length == 0"
                    class="text-center collapsed-bar:hidden mt-4"
                >
                    <div class="text-center">
                        <ChatIcon class="mx-auto h-12 w-12 text-gray-400" aria-hidden="true" />
                        <h3 class="mt-2 text-sm font-medium text-gray-900">No messages yet</h3>
                        <p class="mt-1 text-sm text-gray-500">Start chatting by adding a contact</p>
                        <div class="mt-6">
                            <button
                                type="button"
                                class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
                                @click="sendUpdate(true)"
                            >
                                <PlusIcon class="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                                Add a contact
                            </button>
                        </div>
                    </div>
                </div>
                <div
                    v-if="filteredChats && filteredChats.length"
                    class="flex flex-col justify-center items-center pt-2 collapsed-bar:px-0"
                >
                    <v-contextmenu ref="contextmenu-chat-card">
                        <v-contextmenu-item
                            @click="
                                () => {
                                    triggerWatchOnRightClickItem = !triggerWatchOnRightClickItem;
                                    rightClickItemAction = RIGHT_CLICK_ACTIONS_CHAT_CARD.OPEN_CHAT;
                                }
                            "
                            >Open chat
                        </v-contextmenu-item>
                        <v-contextmenu-item
                            v-if="!currentRightClickedItem?.data?.isGroup"
                            @click="
                                () => {
                                    triggerWatchOnRightClickItem = !triggerWatchOnRightClickItem;
                                    rightClickItemAction = RIGHT_CLICK_ACTIONS_CHAT_CARD.BLOCK;
                                }
                            "
                        >
                            {{ isBlocked(currentRightClickedItem?.data?.chatId) ? 'Unblock' : 'Block' }} User
                        </v-contextmenu-item>
                        <v-contextmenu-item
                            @click="
                                () => {
                                    triggerWatchOnRightClickItem = !triggerWatchOnRightClickItem;
                                    rightClickItemAction = RIGHT_CLICK_ACTIONS_CHAT_CARD.DELETE;
                                }
                            "
                            >{{ currentRightClickedItem?.data?.isGroup ? 'Leave group' : 'Delete user' }}
                        </v-contextmenu-item>
                    </v-contextmenu>
                    <ul role="list" class="divide-y divide-gray-200 border-t border-gray-200 w-full">
                        <ChatCard
                            v-for="chat in filteredChats"
                            :key="`${chat.chatId}-${chat.messages.length}-${chat.read[user.id]}`"
                            :chat="chat"
                            :collapsed="collapsed"
                            @selectChat="setSelected(chat.chatId)"
                            @mousedown.right="setCurrentRightClickedItem(chat, RIGHT_CLICK_TYPE.CHAT_CARD)"
                            v-contextmenu:contextmenu-chat-card
                        />
                    </ul>
                </div>
            </div>
        </div>

        <Dialog
            :modelValue="showAddUserDialog"
            :noActions="true"
            @closeDialog="sendUpdate(false)"
            @update-model-value="sendUpdate"
        >
            <template v-slot:title>
                <h1>Invite someone to chat</h1>
            </template>
            <template v-slot:default>
                <AddContact @closeDialog="sendUpdate(false)"></AddContact>
            </template>
        </Dialog>
    </section>
</template>

<script setup lang="ts">
    import moment from 'moment';
    import { useSocketActions } from '@/store/socketStore';
    import { ref, computed, onBeforeMount, watch } from 'vue';

    import { usechatsActions, useChatsState } from '@/store/chatStore';
    import { useAuthState } from '@/store/authStore';
    import AddContact from '@/components/ContactAdd.vue';
    import ChatRequestList from '@/components/ChatRequestList.vue';
    import Dialog from '@/components/Dialog.vue';
    import ChatCard from '@/components/ChatCard.vue';
    import { startFetchStatusLoop } from '@/store/statusStore';
    import { statusList } from '@/store/statusStore';
    import { uniqBy } from 'lodash';
    import { useRouter } from 'vue-router';
    import { showAddUserDialog } from '@/services/dialogService';
    import { SearchIcon, PlusIcon } from '@heroicons/vue/solid';
    import { ChatIcon } from '@heroicons/vue/outline';
    import {
        triggerWatchOnRightClickItem,
        RIGHT_CLICK_ACTIONS_CHAT_CARD,
        rightClickItemAction,
        currentRightClickedItem,
        RIGHT_CLICK_TYPE,
        setCurrentRightClickedItem,
        openBlockDialogFromOtherFile,
        openDeleteDialogFromOtherFile,
        conversationComponentRerender,
    } from '@/store/contextmenuStore';
    import { deleteBlockedEntry, isBlocked } from '@/store/blockStore';

    const props = defineProps<{ modelValue?: boolean }>();
    const emits = defineEmits(['closeDialog']);
    const { chats, chatRequests } = useChatsState();
    const { retrieveChats } = usechatsActions();
    const collapsed = ref(false);
    let selectedId = ref('');

    const status = computed(() => {
        return statusList[selectedId.value];
    });

    const { user } = useAuthState();

    const m = val => moment(val);
    const searchValue = ref('');
    let showContacts = ref(false);

    const router = useRouter();

    watch(
        triggerWatchOnRightClickItem,
        async () => {
            if (currentRightClickedItem.value.type === RIGHT_CLICK_TYPE.CHAT_CARD) {
                const chatId = currentRightClickedItem?.value?.data?.chatId;

                switch (rightClickItemAction.value) {
                    case RIGHT_CLICK_ACTIONS_CHAT_CARD.OPEN_CHAT:
                        localStorage.setItem('lastOpenedChat', chatId);
                        await router.push({ name: 'single', params: { id: chatId } });
                        break;
                    case RIGHT_CLICK_ACTIONS_CHAT_CARD.BLOCK:
                        if (router.currentRoute.value.name === 'single') {
                            conversationComponentRerender.value = conversationComponentRerender.value++;
                        }
                        if (isBlocked(chatId)) {
                            await deleteBlockedEntry(chatId);
                            break;
                        }
                        openBlockDialogFromOtherFile.value = true;
                        await router.push({ name: 'single', params: { id: chatId } });
                        break;
                    case RIGHT_CLICK_ACTIONS_CHAT_CARD.DELETE:
                        openDeleteDialogFromOtherFile.value = true;
                        if (router.currentRoute.value.name === 'single') {
                            conversationComponentRerender.value = conversationComponentRerender.value++;
                        }
                        await router.push({ name: 'single', params: { id: chatId } });
                        break;
                    default:
                        break;
                }
                rightClickItemAction.value = null;
            }
            return;
        },
        { deep: true }
    );

    const setSelected = id => {
        localStorage.setItem('lastOpenedChat', id);
        router.push({ name: 'single', params: { id } });
    };

    const filteredChats = computed(() => {
        if (!searchValue.value) {
            return chats.value;
        }
        return chats.value.filter(c => c.name.toLowerCase().includes(searchValue.value.toLowerCase()));
    });
    onBeforeMount(() => {
        const { initializeSocket } = useSocketActions();
        initializeSocket(user.id.toString());
        retrieveChats();
    });

    const selectedChat = computed(() => chats.value.find(chat => chat.chatId == selectedId.value));

    startFetchStatusLoop(user);

    const filteredChatRequests = computed(() => {
        const filteredChats = chatRequests.value
            .filter(cr => 'isGroup' in cr && !cr.isGroup)
            .filter(cr => !chats.value.find(c => c.chatId === cr.chatId));
        return uniqBy(filteredChats, c => c.chatId);
    });

    const sendUpdate = newVal => {
        showAddUserDialog.value = newVal;
    };
</script>

<style scoped type="text/css"></style>
