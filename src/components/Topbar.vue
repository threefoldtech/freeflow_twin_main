<template>
    <div class="items-center bg-accent-800 flex justify-between md:topgrid relative h-full px-4 md:px-0">
        <div class="flex">
            <div class="h-5 ml-4 items-center">
                <button
                    class="text-lg text-white md:hidden w-12"
                    @click="backOrMenu"
                    :class="{ 'md:hidden': !(route.meta && route.meta.back) }"
                >
                    <i :class="`fas ${route.meta && route.meta.back ? 'fa-chevron-left' : 'fa-bars'}`"></i>
                </button>
                <img src="/TFN.svg" alt="TF-Logo" class="md:ml-4 h-full hidden md:flex" />
            </div>

            <div class="h-6 flex items-center col-span-3 md:col-span-1 md:hidden">
                <slot>
                    <!--                    <img src="/digitaltwin.svg" alt="TF-Logo" class="md:hidden md:ml-4 h-full" />-->
                    <svg
                        class="md:hidden md:ml-4 h-full"
                        fill="none"
                        viewBox="0 0 180 47"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="m42.14 43.673v-27.214c0-1.6494 0.8959-2.5427 2.5498-2.5427h4.8239c1.6539 0 2.5497 0.8933 2.5497 2.5427v9.6211h10.75v-9.6211c0-1.6494 0.8959-2.5427 2.5498-2.5427h4.8239c1.6884 0 2.5842 0.8933 2.5842 2.5427v27.214c0 1.6493-0.8958 2.5427-2.5842 2.5427h-4.8239c-1.6539 0-2.5498-0.8934-2.5498-2.5427v-9.5524h-10.75v9.5524c0 1.6493-0.8958 2.5427-2.5497 2.5427h-4.8239c-1.6539 0-2.5498-0.8934-2.5498-2.5427zm36.489-12.714v-14.5c0-1.6494 0.8959-2.5427 2.5498-2.5427h4.8239c1.6539 0 2.5497 0.8933 2.5497 2.5427v15.153c0 3.8141 2.3775 6.3568 5.8921 6.3568 3.549 0 5.8921-2.5427 5.8921-6.3568v-15.153c0-1.6494 0.896-2.5427 2.55-2.5427h4.686c1.688 0 2.584 0.8933 2.584 2.5427v14.5c0 9.5524-6.271 15.84-15.678 15.84-9.5444 0.0343-15.85-6.2881-15.85-15.84zm63.159 15.256h-5.927c-1.688 0-2.136-0.859-3.101-2.5427l-4.789-8.7277h-2.205v8.7277c0 1.6493-0.896 2.5427-2.55 2.5427h-4.824c-1.654 0-2.55-0.8934-2.55-2.5427v-27.214c0-1.6494 0.896-2.5427 2.55-2.5427h12.335c8.58 0 13.163 4.1577 13.163 10.789 0 4.2264-2.378 7.2158-5.961 8.8308l5.616 10.136c0.93 1.718-0.069 2.5427-1.757 2.5427zm-15.988-17.765h4.548c1.792 0 3.377-1.0308 3.377-3.1268 0-2.1992-1.585-3.3674-3.377-3.3674h-4.548v6.4942zm22.672 2.5084v-14.5c0-1.6494 0.896-2.5427 2.55-2.5427h4.824c1.654 0 2.55 0.8933 2.55 2.5427v15.153c0 3.8141 2.377 6.3568 5.892 6.3568 3.549 0 5.892-2.5427 5.892-6.3568v-15.153c0-1.6494 0.896-2.5427 2.55-2.5427h4.686c1.688 0 2.584 0.8933 2.584 2.5427v14.5c0 9.5524-6.271 15.84-15.678 15.84-9.544 0.0343-15.85-6.2881-15.85-15.84zm-123.84-16.803c-1.585 0-2.8943 1.3057-2.8943 2.8863v15.978c0 1.2714-0.2757 2.5084-0.7925 3.608-0.3101 0.7215 0 1.5462 0.7235 1.8211 0.6547 0.2405 1.3438 0.4123 2.1019 0.4123h0.0689c0.5513 0 1.0337-0.3436 1.2404-0.859 0.6202-1.5462 0.9993-3.2299 0.9993-4.9824l0.0344-1.0651v-12.714c0-0.6872 0.5513-1.2713 1.2749-1.2713h3.928c0.6892 0 1.2749 0.5498 1.2749 1.2713v13.744c0 1.1339-0.2412 2.2335-0.6202 3.2299-1.2749 3.23-4.4104 5.5322-8.0972 5.5322-0.3446 0-0.7236-0.0344-1.0682-0.0687 0 0 0-0.0344 0.0345-0.0344-1.6195-0.1718-3.1356-0.8247-4.3415-1.7868l-0.0345-0.0344c-1.964-1.5806-3.2389-4.0202-3.2733-6.7347v-16.047c0-1.5806-1.3094-2.8863-2.8944-2.8863h-9.4066c-1.585 0-2.8943 1.3057-2.8943 2.8863v15.669 0.3092 0.3093c0.034456 0.9965 0.17228 1.9929 0.41348 2.9207 1.4472 5.6352 6.5467 9.8273 12.611 9.8273h0.1034c0.5168 0 0.7236-0.6529 0.3445-0.9621-1.2404-1.0652-2.3085-2.3022-3.17-3.6767-0.0689-0.1031-0.1378-0.1718-0.2756-0.2061-2.3086-0.8591-4.1692-2.6802-5.0651-4.9824-0.41347-0.9965-0.62021-2.096-0.62021-3.23v-13.779c0-0.6872 0.5513-1.2713 1.2749-1.2713h3.8936c0.68915 0 1.2748 0.5498 1.2748 1.2713v12.748 1.0308c0 3.3674 1.2405 6.4256 3.3078 8.7278 1.206 1.3401 2.6532 2.4053 4.3071 3.1612s3.4801 1.1683 5.4096 1.1683c6.0644 0 11.198-4.1921 12.611-9.8273 0.2756-1.0308 0.4134-2.1304 0.4134-3.23v0.1031-16.081c0-1.5806-1.3093-2.8863-2.8943-2.8863h-9.3032zm-17.642-14.157c-2.6876 0-4.8584 2.1648-4.8584 4.8449s2.1708 4.8449 4.8584 4.8449 4.8584-2.1648 4.8584-4.8449-2.1708-4.8449-4.8584-4.8449zm21.501 0c-2.6876 0-4.8583 2.1648-4.8583 4.8449s2.1707 4.8449 4.8583 4.8449 4.8584-2.1648 4.8584-4.8449-2.1708-4.8449-4.8584-4.8449z"
                            fill="url(#a)"
                        />
                        <defs>
                            <linearGradient
                                id="a"
                                x1="9.2647e-8"
                                x2="179.86"
                                y1="46.731"
                                y2="48.632"
                                gradientUnits="userSpaceOnUse"
                            >
                                <stop stop-color="#1F0F5B" offset="0" />
                                <stop stop-color="#75ECD4" offset="1e-4" />
                                <stop stop-color="#C1E257" offset="1" />
                            </linearGradient>
                        </defs>
                    </svg>
                </slot>
            </div>
        </div>

        <div class="pr-4 text-right text-gray-500 flex items-center justify-begin">
            <div class="h-5 md:flex text-black items-center col-span-3 md:col-span-1 hidden">
                <slot>
                    <img src="/TFN.svg" alt="TF-Logo" class="md:hidden md:ml-4 h-full" />
                </slot>
            </div>

            <slot name="actions"></slot>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { defineComponent, onBeforeMount, ref } from 'vue';
    import { useAuthState } from '../store/authStore';
    import { useSocketActions } from '../store/socketStore';
    import Dialog from './Dialog.vue';
    import AvatarImg from '@/components/AvatarImg.vue';
    import {  sendGetBlockList, sendUnblockUser } from '@/store/blockStore';
    import { setNewAvatar } from '@/store/userStore';
    import { fetchStatus } from '@/store/statusStore';
    import { useRoute, useRouter } from 'vue-router';
    import { showUserConfigDialog } from '@/services/dialogService';

    const emit = defineEmits(['addUser']);

    const { user } = useAuthState();
    const showEdit = ref(false);
    const showEditPic = ref(false);
    const fileinput = ref();
    const file = ref();
    const userStatus = ref('');
    const isEditingStatus = ref(false);
    const router = useRouter();
    const route = useRoute();
    const backOrMenu = () => {
        if (route.meta && route.meta.back) {
            router.push({ name: <any>route.meta.back });
            return;
        }

        showUserConfigDialog.value = true;
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

    // @todo: config

    onBeforeMount(async () => {
        sendGetBlockList();
    });

    const unblockUser = async user => {
        sendUnblockUser(user);
        showUserConfigDialog.value = false;
    };

    const addUser = () => {
        emit('addUser');
    };
</script>

<style scoped></style>
