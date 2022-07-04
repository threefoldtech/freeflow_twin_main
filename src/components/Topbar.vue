<template>
    <div class="items-center bg-white flex justify-between h-16 border-b border-gray-200">
        <div class="flex">
            <div class="ml-5 mr-3 items-center">
                <button
                    class="lg:hidden mr-2"
                    @click="backOrMenu"
                    :class="{ 'lg:hidden': !(route.meta && route.meta.back) }"
                >
                    <!--                    <i class='fas fa-bars'></i>-->
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
    import { useAuthState } from '../store/authStore';
    import { useSocketActions } from '../store/socketStore';
    import { setNewAvatar } from '@/store/userStore';
    import { fetchStatus } from '@/store/statusStore';
    import { useRoute, useRouter } from 'vue-router';
    import { showUserConfigDialog } from '@/services/dialogService';
    import { useLocalStorage } from '@vueuse/core';
    import { ChevronLeftIcon } from '@heroicons/vue/outline';

    const emit = defineEmits(['addUser', 'clicked']);

    const { user } = useAuthState();
    const showEditPic = ref(false);
    const fileinput = ref();
    const file = ref();
    const userStatus = ref('');
    const isEditingStatus = ref(false);
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

    const selectFile = () => {
        fileinput.value.click();
    };
    const changeFile = () => {
        file.value = fileinput.value?.files[0];
        sendNewAvatar();
    };
    const removeFile = () => {
        file.value = null;
    };

    const sendNewAvatar = async () => {
        const newUrl = await setNewAvatar(file.value);
        await fetchStatus(user.id);
        showUserConfigDialog.value = false;
    };

    const setEditStatus = (edit: boolean) => {
        isEditingStatus.value = edit;
        userStatus.value = user.status;
    };
    const sendNewStatus = async () => {
        const { sendSocketUserStatus } = useSocketActions();
        sendSocketUserStatus(userStatus.value);
        user.status = userStatus.value;
        isEditingStatus.value = false;
    };

    const unblockUser = async user => {
        const { sendUnBlockedChat } = useSocketActions();
        sendUnBlockedChat(user);
        showUserConfigDialog.value = false;
    };

    const addUser = () => {
        emit('addUser');
    };
</script>

<style scoped></style>
