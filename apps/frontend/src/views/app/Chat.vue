<template>
    <app-layout>
        <div
            class="relative h-full w-full lg:customgrid"
            :class="chats.length === 0 && chatRequests.length === 0 ? '' : 'grid'"
        >
            <ChatList v-model="showAddUserDialog" />
            <div
                class="w-full h-full place-items-center"
                :class="{
                    'hidden lg:grid': chats.length !== 0 || chatRequests.length !== 0,
                    grid: chats.length === 0 && chatRequests.length === 0,
                }"
            >
                <div class="text-center">
                    <ChatAlt2Icon class="mx-auto h-16 w-16 text-gray-400" aria-hidden="true" />
                    <h3 class="mt-2 text-base font-medium text-gray-900">
                        {{ chats.length === 0 ? "You don't have any contacts" : 'No chat selected' }}
                    </h3>
                    <p v-if="chats.length > 0" class="mt-1 text-sm text-gray-500">
                        Start chatting by clicking on a chat
                    </p>
                    <div class="mt-6">
                        <button
                            type="button"
                            class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
                            @click="showAddUserDialog = true"
                        >
                            <PlusIcon class="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                            {{ chats.length > 0 ? 'Or start' : 'Start' }}
                            a new chat
                        </button>
                    </div>
                </div>
            </div>
            <Dialog
                v-if="chats.length === 0 && chatRequests.length === 0"
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
        </div>
    </app-layout>
</template>

<script setup lang="ts">
    import AppLayout from '../../layout/AppLayout.vue';
    import ChatList from '@/components/ChatList.vue';
    import { showAddUserDialog } from '@/services/dialogService';
    import { useLocalStorage } from '@vueuse/core';
    import { useRouter } from 'vue-router';
    import { PlusIcon } from '@heroicons/vue/solid';
    import { ChatAlt2Icon } from '@heroicons/vue/outline';
    import { useChatsState } from '@/store/chatStore';
    import { useContactsActions } from '@/store/contactStore';
    import { onBeforeMount } from 'vue';
    import AddContact from '@/components/ContactAdd.vue';
    import Dialog from '@/components/Dialog.vue';
    import { isMobile } from '@/store/fileBrowserStore';

    const { retrieveDTContacts, retrieveContacts } = useContactsActions();

    const { chats, chatRequests } = useChatsState();

    onBeforeMount(async () => {
        await retrieveDTContacts();
        await retrieveContacts();
    });

    const lastOpenedChatId = useLocalStorage('lastOpenedChat', '');
    const router = useRouter();

    if (lastOpenedChatId.value !== '' && !isMobile()) {
        router.push({ name: 'single', params: { id: lastOpenedChatId.value } });
    }

    const sendUpdate = newVal => {
        showAddUserDialog.value = newVal;
    };
</script>

<style scoped type="text/css"></style>
