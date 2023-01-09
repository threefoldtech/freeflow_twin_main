<template>
    <div class="items-center bg-white flex justify-between h-16 border-b border-gray-200">
        <div class="flex">
            <div class="ml-5 mr-3 items-center">
                <button
                    class="lg:hidden mr-2"
                    @click="backOrMenu"
                    :class="{ 'lg:hidden': !(route.meta && route.meta.back) }"
                >
                    <ChevronLeftIcon class="h-8 w-8 text-primary" aria-hidden="true" />
                </button>
            </div>

            <div class="h-8 flex items-center col-span-3 lg:col-span-1 lg:hidden">
                <slot name="user" />
            </div>
        </div>

        <div class="pr-4 text-right text-gray-500 flex items-center justify-begin">
            <slot name="actions" />
        </div>
    </div>
</template>

<script setup lang="ts">
    import { ref } from 'vue';
    import { useAuthState } from '@/store/authStore';
    import { useRoute, useRouter } from 'vue-router';
    import { useLocalStorage } from '@vueuse/core';
    import { ChevronLeftIcon } from '@heroicons/vue/outline';

    const { user } = useAuthState();

    const emit = defineEmits(['addUser', 'clicked']);
    const file = ref();
    const router = useRouter();
    const route = useRoute();
    const lastOpenedChatId = useLocalStorage('lastOpenedChat', '');

    const backOrMenu = () => {
        if (route?.name === 'single') {
            lastOpenedChatId.value = '';
            router.push({ name: 'whisper' });
            return;
        }
        emit('clicked');
    };

    const addUser = () => {
        emit('addUser');
    };
</script>

<style scoped></style>
