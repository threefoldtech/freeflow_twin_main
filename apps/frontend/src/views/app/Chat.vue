<template>
    <app-layout>
        <div class="relative h-full w-full grid md:customgrid">
            <ChatList v-model="showAddUserDialog" />
            <div class="hidden w-full h-full md:grid place-items-center">
                <div class="text-center">
                    <ChatAlt2Icon class="mx-auto h-12 w-12 text-gray-400" aria-hidden="true" />
                    <h3 class="mt-2 text-sm font-medium text-gray-900">No chat selected</h3>
                    <p class="mt-1 text-sm text-gray-500">Start chatting by clicking on a chat</p>
                    <div class="mt-6">
                        <button
                            type="button"
                            class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
                            @click="showAddUserDialog = true"
                        >
                            <PlusIcon class="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                            Or start a new chat
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </app-layout>
</template>

<script setup lang="ts">
    import AppLayout from '../../layout/AppLayout.vue';
    import { defineComponent, watch } from 'vue';
    import ChatList from '@/components/ChatList.vue';
    import { showAddUserDialog } from '@/services/dialogService';
    import { useLocalStorage } from '@vueuse/core';
    import { useRouter } from 'vue-router';
    import { PlusIcon } from '@heroicons/vue/solid';
    import { ChatAlt2Icon } from '@heroicons/vue/outline';

    const lastOpenedChatId = useLocalStorage('lastOpenedChat', '');
    const router = useRouter();

    if (lastOpenedChatId.value !== '') {
        router.push({ name: 'single', params: { id: lastOpenedChatId.value } });
    }
</script>

<style scoped type="text/css"></style>