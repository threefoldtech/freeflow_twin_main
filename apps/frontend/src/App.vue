<template>
    <div
        :class="{
            'debug-screens': isDev,
        }"
        class="h-screen"
    >
        <router-view v-show="path !== '/glass'" />

        <app-layout>
            <div v-show="path === '/glass' && hasBrowserBeenStartedOnce" class="h-full">
                <iframe
                    class="relative h-full w-full"
                    title="forum"
                    id="forum-iframe"
                    src="https://browser.jimber.org/?browsercontrols=true#https://duckduckgo.com/"
                    allow="geolocation; microphone; camera; encrypted-media; clipboard-read; clipboard-write;"
                />
            </div>
        </app-layout>
        <div
            v-if="isDev && user.location"
            class="fixed text-white bg-black -right-px -bottom-0.5 border border-white px-2 text-xs"
        >
            {{ user.location }}
        </div>
    </div>
</template>

<script lang="ts" setup>
    import AppLayout from './layout/AppLayout.vue';
    import version from '../public/config/version';
    import { useAuthState } from '@/store/authStore';
    import { computed, onBeforeMount } from 'vue';
    import { useRoute } from 'vue-router';
    import { hasBrowserBeenStartedOnce } from '@/store/browserStore';
    import { useSocketActions } from '@/store/socketStore';
    import { initBlocklist } from '@/store/blockStore';

    const { user } = useAuthState();
    const { initializeSocket } = useSocketActions();

    onBeforeMount(() => {
        if (user) {
            initializeSocket(user.id.toString());
            initBlocklist();
        }
    });

    console.log('Version: ' + version);

    document.querySelector('body').classList.add('overflow-y-hidden');

    const isDev = import.meta.env.DEV || process.env.NODE_ENV === 'staging';

    const route = useRoute();
    const path = computed(() => route.path);
</script>

<style>
    .v-contextmenu-item--hover {
        background-color: #2e266f !important;
    }
</style>
