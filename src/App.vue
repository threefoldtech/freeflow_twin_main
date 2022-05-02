<template>
    <div
        :class="{
            'debug-screens': isDev,
        }"
        class="h-screen"
    >
        <!-- <template v-if="false"> -->
        <!--     <div -->
        <!--         class="fixed left-0 top-0 bg-red-700 text-white uppercase text-xl z-[9999] px-16 transform -rotate-45 -translate-x-16 translate-y-2 opacity-50 pointer-events-none" -->
        <!--     > -->
        <!--         Beta -->
        <!--     </div> -->
        <!-- </template> -->
        <!-- <router-view /> -->
        <router-view v-show="path !== '/glass'" />

        <app-layout>
            <div v-show="path === '/glass' && hasBrowserBeenStartedOnce" class="h-full w-full relative">
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
            v-if="isDev && myLocation"
            class="fixed text-white bg-black -right-px -bottom-0.5 border border-white px-2 text-xs"
        >
            {{ myLocation }}
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
    import { useSocketActions } from './store/socketStore';

    console.log('Version: ' + version);

    document.querySelector('body').classList.add('overflow-y-hidden');

    const isDev = import.meta.env.DEV;

    const route = useRoute();
    const path = computed(() => route.path);

    const { user, myLocation } = useAuthState();
    onBeforeMount(() => {
        const { initializeSocket } = useSocketActions();
        initializeSocket(String(user.id));
    });
</script>

<style>
    .v-contextmenu-item--hover {
        background-color: #2e266f !important;
    }
</style>
