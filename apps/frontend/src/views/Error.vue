<template>
    <div class="bg-white min-h-screen flex flex-col lg:relative">
        <div class="lg:absolute lg:w-1/2 h-full">
            <div class="w-full px-8 md:px-0 h-screen flex items-center justify-center">
                <div class="bg-white flex flex-col items-center justify-center px-4 md:px-8 lg:px-24 py-8 rounded-lg">
                    <p class="text-6xl md:text-7xl lg:text-9xl font-bold tracking-wider text-gray-300">403</p>
                    <p class="text-2xl md:text-3xl lg:text-5xl font-bold tracking-wider text-gray-500 mt-4">
                        Forbidden
                    </p>
                    <p
                        class="text-sm lg:text-md text-gray-500 mt-8 py-2 border-y-2 text-center"
                        v-if="reason === Reasons.WRONG_USER"
                    >
                        The username you provided does not match the username in your ThreeFold Connect app
                    </p>

                    <div class="mt-6 lg:mt-6 lg:m-auto cursor-pointer">
                        <div class="inline-block p-2 px-8 border-2 bg-indigo-600 text-white font-bold" @click="goBack">
                            Retry
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="hidden lg:block lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
            <img class="absolute inset-0 h-full w-full object-cover" src="/freeflow_home.png" alt="FreeFlow homepage" />
        </div>
    </div>
</template>
<script lang="ts" setup>
    import config from '@/config';
    import { useRoute } from 'vue-router';
    import { computed, ComputedRef } from 'vue';
    import { isMobile } from '@/store/fileBrowserStore';

    enum Reasons {
        WRONG_USER = 'wrongUser',
    }

    const route = useRoute();

    const reason: ComputedRef<string | null> = computed(() => {
        if (!route.query['reason']) return;
        return <string>route.query['reason'];
    });

    const goBack = async () => {
        if (isMobile()) {
            await globalThis.flutter_inappwebview.callHandler('GO_TO_USERNAME_SCREEN');
            return;
        }

        window.location.href = config.spawnerUrl;
    };
</script>
