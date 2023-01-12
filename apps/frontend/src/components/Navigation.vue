<template>
    <div class="h-full flex">
        <!-- Narrow sidebar -->
        <div class="hidden w-[5.5rem] bg-accent-700 overflow-y-auto lg:block">
            <div class="w-full h-full py-6 flex flex-col items-center">
                <div class="flex-shrink-0 flex items-center cursor-pointer" @click="changePage('dashboard')">
                    <img src="/freeflow_icon_192x192.png" class="w-12" />
                </div>
                <div class="flex-1 mt-6 w-full px-2 space-y-3">
                    <div
                        v-for="app in apps"
                        :key="app.name"
                        :class="{
                            'cursor-pointer transition duration-300 text-accent-100 hover:bg-accent-800 hover:text-white rounded-md':
                                app.enabled,
                            'bg-accent-800 text-white rounded-md':
                                app?.enabled && router.currentRoute?.value.meta.app === app.name,
                            'text-gray-500': !app?.enabled,
                        }"
                        class="grid"
                    >
                        <div
                            class="group p-1.5 flex flex-col items-center text-xs font-medium"
                            style="position: relative"
                            @click="changePage(app.name)"
                        >
                            <img alt="icon of navigation item" :src="app.icon" class="w-8 first:h-8" />
                            <span class="mt-2 capitalize">{{ app.name }}</span>
                            <p
                                v-if="app.name === AppType.Whisper && totalUnreadChats > 0"
                                class="absolute text-xs right-0 top-0 inline-block bg-gradient text-white rounded-full text-center w-7 h-7 pt-2"
                            >
                                {{ totalUnreadChats }}
                            </p>
                        </div>
                    </div>
                </div>
                <div class="w-20 h-20 grid cursor-pointer items-center justify-items-center">
                    <AvatarImg small @click="toggleShowUserConfigDialog" class="cursor-pointer" :id="user.id" />
                    <button
                        class="mt-2 py-2 px-4 text-white rounded-md max-w-max hover:bg-primarylight"
                        @click="showLogoutDialog = true"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </div>

        <!-- Mobile menu -->
        <TransitionRoot as="template" :show="mobileMenuOpen">
            <Dialog as="div" class="relative z-50 lg:hidden" @close="mobileMenuOpen = false">
                <TransitionChild
                    as="template"
                    enter="transition-opacity ease-linear duration-300"
                    enter-from="opacity-0"
                    enter-to="opacity-100"
                    leave="transition-opacity ease-linear duration-300"
                    leave-from="opacity-100"
                    leave-to="opacity-0"
                >
                    <div class="fixed inset-0 bg-gray-600 bg-opacity-75" />
                </TransitionChild>

                <div class="fixed inset-0 z-40 flex">
                    <TransitionChild
                        as="template"
                        enter="transition ease-in-out duration-300 transform"
                        enter-from="-translate-x-full"
                        enter-to="translate-x-0"
                        leave="transition ease-in-out duration-300 transform"
                        leave-from="translate-x-0"
                        leave-to="-translate-x-full"
                    >
                        <DialogPanel class="relative max-w-xs w-full bg-accent-700 pt-5 pb-4 flex-1 flex flex-col">
                            <TransitionChild
                                as="template"
                                enter="ease-in-out duration-300"
                                enter-from="opacity-0"
                                enter-to="opacity-100"
                                leave="ease-in-out duration-300"
                                leave-from="opacity-100"
                                leave-to="opacity-0"
                            >
                                <div class="absolute top-1 right-0 -mr-14 p-1">
                                    <button
                                        type="button"
                                        class="h-12 w-12 rounded-full flex items-center justify-center focus:outline-none"
                                        @click="mobileMenuOpen = false"
                                    >
                                        <XIcon class="h-6 w-6 text-white" aria-hidden="true" />
                                        <span class="sr-only">Close sidebar</span>
                                    </button>
                                </div>
                            </TransitionChild>
                            <div class="flex-shrink-0 px-4 mb-4 flex items-center">
                                <img class="h-10 w-auto" src="/freeflow_white.svg" alt="Workflow" />
                            </div>
                            <div class="mt-5 flex-1 h-0 px-2 overflow-y-auto">
                                <nav class="h-full flex flex-col">
                                    <div class="space-y-4">
                                        <div
                                            v-for="app in apps"
                                            :key="app.name"
                                            :class="{
                                                'cursor-pointer transition duration-300 text-accent-100 hover:bg-accent-800 hover:text-white rounded-md':
                                                    app.enabled,
                                                'bg-accent-800 text-white rounded-md':
                                                    app?.enabled && router.currentRoute?.value.meta.app === app.name,
                                                'text-gray-500': !app?.enabled,
                                                'hidden md:block':
                                                    app.name === AppType.Glass || app.name === AppType.Kutana,
                                            }"
                                        >
                                            <div
                                                class="group py-2 px-3 rounded-md flex items-center text-sm font-medium"
                                                style="position: relative"
                                                @click="changePage(app.name)"
                                            >
                                                <img
                                                    alt="icon of navigation item"
                                                    :src="app.icon"
                                                    class="w-8 first:h-8 mr-3"
                                                />
                                                <span class="capitalize">{{ app.name }}</span>
                                                <span
                                                    v-if="app.name === AppType.Whisper && totalUnreadChats > 0"
                                                    :class="[
                                                        router.currentRoute?.value.meta.app === app.name
                                                            ? 'bg-accent-600'
                                                            : 'bg-accent-800',
                                                        'ml-auto py-0.5 px-3 text-xs font-medium rounded-full',
                                                    ]"
                                                >
                                                    {{ totalUnreadChats }}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </nav>
                            </div>
                            <div class="flex-shrink-0 flex border-t border-accent-800 p-4">
                                <div class="flex items-center">
                                    <div>
                                        <AvatarImg
                                            @click="toggleShowUserConfigDialog"
                                            class="cursor-pointer"
                                            :id="user.id"
                                        />
                                    </div>
                                    <div class="ml-3">
                                        <p class="text-base font-medium text-white">{{ user.id }}</p>
                                        <p
                                            class="text-sm font-medium text-accent-200 group-hover:text-white cursor-pointer"
                                            @click="showLogoutDialog = true"
                                        >
                                            Logout
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </DialogPanel>
                    </TransitionChild>
                    <div class="flex-shrink-0 w-14" aria-hidden="true">
                        <!-- Dummy element to force sidebar to shrink to fit close icon -->
                    </div>
                </div>
            </Dialog>
        </TransitionRoot>
        <header class="w-full lg:hidden">
            <div class="z-10 h-16 bg-white border-b border-gray-200 flex justify-between">
                <button
                    type="button"
                    class="px-4 text-gray-500 focus:outline-none lg:hidden"
                    @click="mobileMenuOpen = true"
                >
                    <span class="sr-only">Open sidebar</span>
                    <MenuIcon class="h-8 text-primary" aria-hidden="true" />
                </button>
                <img alt="logo FreeFlow" src="/freeflow_purple.svg" class="h-10 mt-3" />
                <div class="w-16 h-10"></div>
            </div>
            <slot name="content" />
        </header>
        <Alert v-if="showLogoutDialog" :showAlert="showLogoutDialog" @close="showLogoutDialog = false">
            <template #title> Logout</template>
            <template #content> Do you really want to logout?</template>
            <template #actions>
                <button
                    class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                    @click="logout"
                >
                    Logout
                </button>
                <button
                    class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:w-auto sm:text-sm"
                    @click="showLogoutDialog = false"
                >
                    Cancel
                </button>
            </template>
        </Alert>
    </div>
</template>

<script setup lang="ts">
    import { ref, computed } from 'vue';
    import { useRouter } from 'vue-router';
    import AvatarImg from '@/components/AvatarImg.vue';
    import { showUserConfigDialog } from '@/services/dialogService';
    import { useAuthState } from '@/store/authStore';
    import { AppItemType, AppType } from '@/types/apps';
    import { doLogout } from '@/services/authService';
    import Alert from '@/components/Alert.vue';
    import { Dialog, DialogPanel, TransitionChild, TransitionRoot } from '@headlessui/vue';
    import { MenuIcon, XIcon } from '@heroicons/vue/solid';
    import { getUnreadChats, useChatsState } from '@/store/chatStore';

    const { unreadChats } = useChatsState();
    const { user } = useAuthState();

    const init = async () => {
        await getUnreadChats();
    };
    init();

    const apps: Array<AppItemType> = [
        {
            name: AppType.Dashboard,
            icon: '/flow.svg',
            enabled: true,
        },
        {
            name: AppType.Whisper,
            icon: '/whisper.svg',
            enabled: true,
        },
        {
            name: AppType.Quantum,
            icon: '/quantum.svg',
            enabled: true,
        },
        {
            name: AppType.Glass,
            icon: '/glass.svg',
            enabled: true,
        },
        {
            name: AppType.Kutana,
            icon: '/kutana.svg',
            enabled: true,
        },
    ];
    const router = useRouter();

    const emit = defineEmits(['clicked']);

    const showLogoutDialog = ref(false);

    const logout = async () => {
        showLogoutDialog.value = false;
        await doLogout();
    };

    const changePage = (name: string) => {
        mobileMenuOpen.value = false;
        router.push({ name });
    };

    const toggleShowUserConfigDialog = () => {
        showUserConfigDialog.value = !showUserConfigDialog.value;
    };

    const totalUnreadChats = computed(() => {
        let total = 0;
        if (unreadChats.value?.length > 0) {
            for (const msg of unreadChats.value) {
                total++;
            }
        }
        return total > 99 ? '99+' : total;
    });

    const mobileMenuOpen = ref(false);
</script>
