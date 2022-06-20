<template>
    <suspense>
        <UserConfigDialog></UserConfigDialog>
    </suspense>
    <div class="bg-gray-100 h-full relative text-sm">
        <NotificationSection />
        <div class="pl-0 relative h-full w-full maingrid md:bigmaingrid">
            <div class="top h-20 md:hidden">
                <Topbar @clicked="showNav = !showNav">
                    <template v-slot:default>
                        <slot name="top"></slot>
                    </template>
                    <template v-slot:actions>
                        <slot name="actions"></slot>
                    </template>
                </Topbar>
            </div>
            <slot name="side">
                <Sidebar
                    :unreadChats="totalUnreadChats"
                    @clicked="showNav = false"
                    class="bg-accent-800 md:block"
                    :class="[showNav ? '' : 'hidden', smallScreen ? 'top' : 'side']"
                ></Sidebar>
            </slot>
            <div class="content w-full h-full overflow-y-auto relative flex flex-col">
                <div class="relative w-full h-full overflow-y-auto">
                    <div class="absolute w-full h-full">
                        <ImagePreview />
                        <slot></slot>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { ref, watch } from 'vue';
    import Sidebar from '@/components/Sidebar.vue';
    import UserConfigDialog from '@/components/UserConfigDialog.vue';
    import Topbar from '@/components/Topbar.vue';
    import { useSocketState } from '../store/socketStore';
    import ImagePreview from '@/components/ImagePreview.vue';
    import NotificationSection from '@/components/notifications/NotificationSection.vue';
    import { usechatsActions } from '@/store/chatStore';

    const totalUnreadChats = ref<string[]>([]);

    const init = async () => {
        const { getUnreadChats } = usechatsActions();
        totalUnreadChats.value = await getUnreadChats();
    }
    init();

    const { notification } = useSocketState();
    const showNav = ref(false);
    const smallScreen = ref(window.innerWidth < 768);

    let audio = null;

    window.onresize = () => {
        smallScreen.value = window.innerWidth < 768;
        if (window.innerWidth > 768) showNav.value = false;
    };

    watch(notification, (newNot: any, oldNot: any) => {
        const focused = document.hasFocus();

        if (focused) {
            return;
        }

        if (audio === null) {
            audio = new Audio(`/${newNot.sound}`);
        }

        audio.play();
    });
</script>

<style scoped>
    .top {
        grid-area: top;
    }

    .side {
        grid-area: side;
    }

    .content {
        grid-area: content;
    }
</style>
