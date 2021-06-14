<template>
    <div
        class="items-center bg-gradient flex justify-between md:topgrid relative h-full px-4 md:px-0"
    >
        <div class="flex">
            <div class="h-5 ml-4 items-center">
                <button
                    class="text-lg text-white md:hidden w-12"
                    @click="backOrMenu"
                    :class="{ 'md:hidden': !(route.meta && route.meta.back) }"
                >
                    <i
                        :class="
                            `fas ${
                                route.meta && route.meta.back
                                    ? 'fa-chevron-left'
                                    : 'fa-bars'
                            }`
                        "
                    ></i>
                </button>
                <img
                    src="/TFN.svg"
                    alt="TF-Logo"
                    class="md:ml-4 h-full hidden md:flex"
                />
            </div>

            <div
                class="h-5 flex items-center col-span-3 md:col-span-1 md:hidden"
            >
                <slot>
                    <img
                        src="/digitaltwin.svg"
                        alt="TF-Logo"
                        class="md:hidden md:ml-4 h-full"
                    />
                </slot>
            </div>
        </div>

        <div
            class="pr-4 text-right text-gray-500 flex items-center justify-begin"
        >
            <div
                class="h-5 md:flex text-black items-center col-span-3 md:col-span-1 hidden"
            >
                <slot>
                    <img
                        src="/TFN.svg"
                        alt="TF-Logo"
                        class="md:hidden md:ml-4 h-full"
                    />
                </slot>
            </div>

            <slot name="actions"></slot>
        </div>
    </div>
</template>

<script lang="ts">
    import { defineComponent, onBeforeMount, ref } from 'vue';
    import { useAuthState } from '../store/authStore';
    import { useSocketActions } from '../store/socketStore';
    import Dialog from './Dialog.vue';
    import AvatarImg from '@/components/AvatarImg.vue';
    import {
        deleteBlockedEntry,
        initBlocklist,
    } from '@/store/blockStore';
    import { setNewAvatar } from '@/store/userStore';
    import { fetchStatus } from '@/store/statusStore';
    import { useRoute, useRouter } from 'vue-router';
    import { showUserConfigDialog } from '@/services/dialogService';

    export default defineComponent({
        name: 'Topbar',
        components: { AvatarImg, jdialog: Dialog },
        emits: ['addUser'],
        setup({}, ctx) {
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

            onBeforeMount(() => {
                initBlocklist();
            });

            const unblockUser = async user => {
                await deleteBlockedEntry(user);
                showUserConfigDialog.value = false;
            };

            const addUser = () => {
                ctx.emit('addUser');
            };

            return {
                addUser,
                backOrMenu,
                user,
                showEditPic,
                showEdit,
                fileinput,
                file,
                selectFile,
                changeFile,
                removeFile,
                sendNewAvatar,
                sendNewStatus,
                userStatus,
                setEditStatus,
                isEditingStatus,
                unblockUser,
                route,
            };
        },
    });
</script>

<style scoped>
    @tailwind base;
    @tailwind components;
    @tailwind utilities;

    @layer utilities {
        @variants responsive {
            .topgrid {
                display: grid !important;
                grid-template-columns: 500px 2fr 1fr !important;
            }
        }
    }
</style>
