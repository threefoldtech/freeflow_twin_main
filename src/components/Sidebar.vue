<template>
    <nav>
        <div class="flex flex-col h-screen overflow-y-auto items-center">
            <div class="md:mb-4 mb-2 grid text-center text-white cursor-pointer">
                <div
                    class="rounded-full grid place-items-center"
                    style="position: relative"
                    @click="changePage('dashboard')"
                >
                    <svg class="sm:w-10 w-8 mt-5" fill="none" viewBox="0 0 39 48" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <linearGradient
                                id="mainGradientLogo"
                                x1=".38135"
                                x2="38.593"
                                y1="47.929"
                                y2="48.013"
                                gradientUnits="userSpaceOnUse"
                            >
                                <stop stop-color="#1F0F5B" offset="0" />
                                <stop stop-color="#75ECD4" offset="1e-4" />
                                <stop stop-color="#C1E257" offset="1" />
                            </linearGradient>
                        </defs>
                        <path
                            d="m25.941 14.741c-1.6552 0-2.9985 1.3434-2.9985 2.9985v16.648c0 1.3433-0.2879 2.6027-0.8036 3.7541-0.3359 0.7317-0.012 1.6192 0.7436 1.9071 0.6717 0.2638 1.4033 0.4078 2.1709 0.4078h0.072c0.5637-0.012 1.0554-0.3598 1.2713-0.8876 0.6597-1.5952 1.0315-3.3583 1.0315-5.1934l0.024-1.1274v-13.205c0-0.7197 0.5877-1.3074 1.3074-1.3074h4.0539c0.7197 0 1.3074 0.5877 1.3074 1.3074v13.205l0.012 1.1274c0 1.1874-0.2399 2.3269-0.6477 3.3703-1.3313 3.3584-4.5817 5.7452-8.3838 5.7452-0.3718 0-0.7436-0.036-1.1035-0.072 0.012-0.012 0.012-0.024 0.024-0.024-1.6911-0.1919-3.2384-0.8636-4.5097-1.8711-0.012-0.012-0.024-0.0239-0.036-0.0359-2.039-1.6552-3.3703-4.174-3.3943-7.0045v-16.732c0-1.6551-1.3433-2.9985-2.9985-2.9985h-9.6912c-1.6552 0-2.9985 1.3434-2.9985 2.9985v16.312c0 0.1079-0.011994 0.2159-0.011994 0.3358s0 0.2279 0.011994 0.3358c0.023988 1.0435 0.16792 2.063 0.4078 3.0345 1.4993 5.8531 6.8006 10.207 13.097 10.207h0.1079c0.5278 0 0.7437-0.6597 0.3479-1.0075-1.2834-1.0914-2.3988-2.3868-3.2864-3.8141-0.06-0.1079-0.1559-0.1799-0.2759-0.2159-2.3988-0.8995-4.3178-2.7826-5.2653-5.1694-0.41979-1.0435-0.62368-2.1829-0.62368-3.3703v-14.333c0-0.7197 0.5877-1.3074 1.3073-1.3074h4.054c0.7196 0 1.3074 0.5877 1.3074 1.3074v13.205 1.0914c0 3.4903 1.2833 6.6687 3.4302 9.0795 1.2354 1.3793 2.7467 2.5067 4.4498 3.2983l0.048 0.036c1.7031 0.7796 3.5982 1.2234 5.6012 1.2234 6.2968 0 11.598-4.3538 13.097-10.219 0.2759-1.0794 0.4198-2.2069 0.4198-3.3703v0.0959-16.732c0-1.6552-1.3433-2.9985-2.9985-2.9985h-9.6791v-0.036z"
                            fill="url(#mainGradientLogo)"
                        />
                        <path
                            d="m7.6617 10.099c2.7888 0 5.0495-2.2607 5.0495-5.0494 0-2.7887-2.2607-5.0495-5.0495-5.0495-2.7887 0-5.0495 2.2607-5.0495 5.0495 0 2.7888 2.2607 5.0494 5.0495 5.0494z"
                            fill="url(#mainGradientLogo)"
                        />
                        <path
                            d="m29.971 10.099c2.7887 0 5.0494-2.2607 5.0494-5.0494 0-2.7887-2.2607-5.0495-5.0494-5.0495-2.7888 0-5.0495 2.2607-5.0495 5.0495 0 2.7888 2.2607 5.0494 5.0495 5.0494z"
                            fill="url(#mainGradientLogo)"
                        />
                    </svg>
                </div>
            </div>
            <br />
            <div
                v-for="app in apps"
                :key="app.name"
                :class="{
                    'cursor-pointer transition duration-300 hover:bg-primarylight rounded-xl': app.enabled,
                    'bg-primarylight rounded-xl': app?.enabled && router.currentRoute?.value.meta.app === app.name,
                    'text-gray-500': !app?.enabled,
                }"
                class="mb-4 grid"
            >
                <div
                    class="sm:h-20 h-16 sm:w-20 w-16 rounded-full grid place-items-center"
                    :class="app.name === AppType.Whisper ? 'mb-3 pt-6' : 'mb-1'"
                    style="position: relative"
                    @click="changePage(app.name)"
                >
                    <p
                        v-if="app.name === AppType.Whisper && totalUnreadChats > 0"
                        class="absolute text-xs right-0 top-0 inline-block bg-gradient text-white rounded-full text-center w-7 h-7 pt-2"
                    >
                        {{ totalUnreadChats }}
                    </p>
                    <img alt="icon of navigation item" :src="app.icon" width="66" />
                </div>
            </div>
            <div class="md:flex-grow flex-grow-0"></div>
            <div
                class="w-20 h-20 mb-5 grid cursor-pointer content-end items-center justify-center justify-items-center"
            >
                <AvatarImg @click="toggleShowUserConfigDialog" :id="String(user.id)" />
                <button
                    class="mt-2 py-2 px-4 text-white rounded-md max-w-max hover:bg-primarylight"
                    @click="showLogoutDialog = true"
                >
                    Logout
                </button>
            </div>
        </div>

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
    </nav>
</template>

<script setup lang="ts">
    import { useRouter } from 'vue-router';
    import AvatarImg from '@/components/AvatarImg.vue';
    import { useAuthState } from '@/store/authStore';
    import { showUserConfigDialog } from '@/services/dialogService';
    import { AppItemType, AppType } from '@/types/apps';
    import Button from '@/components/Button.vue';
    import Alert from '@/components/Alert.vue';
    import { ref } from 'vue';
    import { doLogout } from '@/services/authService';
    import { computed } from 'vue';

    interface IProps {
        unreadChats?: string[];
    }

    const props = defineProps<IProps>();

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
        // {
        //     name: AppType.Forum,
        //     icon: 'fas fa-stream',
        //     enabled: true,
        // },
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
        // {
        //     name: AppType.Meetings,
        //     icon: 'fas fa-video',
        // },
    ];
    const router = useRouter();

    const emit = defineEmits(['clicked']);

    const showLogoutDialog = ref(false);

    const logout = async () => {
        showLogoutDialog.value = false;
        await doLogout();
    };

    const changePage = (name: string) => {
        emit('clicked');
        router.push({ name });
    };

    const { user } = useAuthState();

    const toggleShowUserConfigDialog = () => {
        showUserConfigDialog.value = !showUserConfigDialog.value;
    };

    const totalUnreadChats = computed(() => {
        let total = 0;
        for (const msg of props.unreadChats) {
            total++;
        }
        return total > 99 ? '99+' : total;
    });
</script>

<style scoped>
    .active {
        position: relative;
    }

    .active::after {
        position: absolute;
        content: '';
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background: #e69b5950;
        border-left: 8px solid #e69b59;
    }
</style>
