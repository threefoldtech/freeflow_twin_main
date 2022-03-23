<template>
    <app-layout>
        <div class='relative h-full w-full grid md:customgrid'>
            <ChatList v-model='showAddUserDialog' />
            <div class='hidden w-full h-full md:grid place-items-center'>
                <div class='flex flex-col mb-12 text-center'>
                    <p>Select a chat</p>
                    <button @click='showAddUserDialog = true' class='mt-2 border rounded-full py-1 px-3'>
                        Or start a new chat
                    </button>
                </div>
            </div>
        </div>
    </app-layout>
</template>

<script setup lang='ts'>
    import AppLayout from '../../layout/AppLayout.vue';
    import { defineComponent, watch } from 'vue';
    import ChatList from '@/components/ChatList.vue';
    import { showAddUserDialog } from '@/services/dialogService';
    import { useLocalStorage } from '@vueuse/core';
    import { useRouter } from 'vue-router';

    const lastOpenedChatId = useLocalStorage('lastOpenedChat', '');
    const router = useRouter();

    if (lastOpenedChatId.value !== '') {
        router.push({ name: 'single', params: { id: lastOpenedChatId.value } });
    }
</script>

<style scoped type='text/css'></style>
