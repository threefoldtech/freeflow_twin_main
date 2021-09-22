<template>
    <nav>
        <div class="flex flex-col h-full items-center mx-2">
            <div class="mb-4 grid text-center text-white cursor-pointer">
                <div
                    class="h-20 w-20 rounded-full grid place-items-center mb-1"
                    style="position: relative"
                    @click="changePage('chat')"
                >
                    <img alt="Threefold logo" src="../../public/uhuru.svg" width="65" />
                </div>
            </div>
            <br />
            <div
                v-for="app in apps"
                :key="app.name"
                :class="{
                    'cursor-pointer': app.enabled,
                    'bg-primarylight rounded-xl': app?.enabled && router.currentRoute?.value.meta.app === app.name,
                    'text-gray-500': !app?.enabled,
                }"
                class="mb-4 grid"
            >
                <div
                    class="h-20 w-20 rounded-full grid place-items-center mb-1"
                    style="position: relative"
                    @click="changePageAndExecuteAction(app)"
                >
                    <img alt="icon of navigation item" :src="app.icon" width="66" />
                </div>
            </div>
            <div class="flex-grow"></div>
            <div
                class="w-20 h-20 grid cursor-pointer items-center justify-center justify-items-center"
                @click="toggleShowUserConfigDialog"
            >
                <AvatarImg :id="user.id" />
                <!--<h3 class="truncate w-full text-sm">{{ user.id }}</h3>-->
            </div>
        </div>
    </nav>
</template>

<script lang="ts">
    import { defineComponent, computed } from 'vue';
    import { useRouter } from 'vue-router';
    import AvatarImg from '@/components/AvatarImg.vue';
    import { useAuthState } from '@/store/authStore';
    import { showUserConfigDialog } from '@/services/dialogService';
    import { AppType } from '@/types/apps';
    import { useBrowserActions, useBrowserState, test } from '@/store/browserStore';
    import { AppItemType } from '@/types/apps';

    export default defineComponent({
        name: 'Sidebar',
        components: { AvatarImg },
        setup() {
            const { setHasBrowserBeenStartedOnce } = useBrowserActions();
            const { hasBrowserBeenStartedOnce } = useBrowserState();

            const apps: Array<AppItemType> = [
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
                    action: () => {
                        console.log('executed');
                        test.value = true;
                    },
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

            const currentRoute = computed(() => router.currentRoute.value);

            const changePageAndExecuteAction = (page: AppItemType) => {
                console.log('BEFORE CLICK : ' + test.value);

                if (page.action) {
                    page.action();
                }
                console.log('AFTER CLICK : ' + test.value);

                router.push({ name: page.name });
            };

            const { user } = useAuthState();

            const toggleShowUserConfigDialog = () => {
                console.log('Showing user config dialog: ', showUserConfigDialog.value);
                showUserConfigDialog.value = !showUserConfigDialog.value;

                console.log('Showing user config dialog: ', showUserConfigDialog.value);
            };

            return {
                currentRoute,
                apps,
                changePageAndExecuteAction,
                user,
                showUserConfigDialog,
                router,
                toggleShowUserConfigDialog,
            };
        },
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
