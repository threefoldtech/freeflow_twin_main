<template>
    <suspense>
        <UserConfigDialog></UserConfigDialog>
    </suspense>
    <div class="bg-gray-100 h-full text-sm">
        <NotificationSection />

        <div class="pl-0 relative h-full w-full maingrid lg:bigmaingrid">
            <Navigation class="top lg:side">
                <template #content>
                    <slot name="topbar" />
                </template>
            </Navigation>
            <div class="content w-full h-full overflow-y-auto relative flex flex-col hide-scrollbar">
                <div class="relative w-full h-full overflow-y-auto hide-scrollbar">
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
    import { watch } from 'vue';
    import UserConfigDialog from '@/components/UserConfigDialog.vue';
    import { useSocketState } from '@/store/socketStore';
    import ImagePreview from '@/components/ImagePreview.vue';
    import NotificationSection from '@/components/notifications/NotificationSection.vue';

    import Navigation from '@/components/Navigation.vue';

    const { notification } = useSocketState();

    let audio = null;

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
    .content {
        grid-area: content;
    }
</style>
