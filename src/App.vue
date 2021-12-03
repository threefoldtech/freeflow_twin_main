<template>
    <div
        :class="{
            'debug-screens': isDev,
        }"
        class="h-screen"
    >
        <template v-if="false">
            <div
                class="
                    fixed
                    left-0
                    top-0
                    bg-red-700
                    text-white
                    uppercase
                    text-xl
                    z-[9999]
                    px-16
                    transform
                    -rotate-45
                    -translate-x-16
                    translate-y-2
                    opacity-50
                    pointer-events-none
                "
            >
                Beta
            </div>
        </template>
        <suspense> <router-view v-if="$route.path !== '/glass'" /> </suspense>
        <!-- Hot loading the browser, puts this component under the body. Issue needs to be revisited for more effecient way -->
        <Browser v-show="hasBrowserBeenStartedOnce" />

        <div
            v-if="isDev && location"
            class="fixed text-white bg-black -right-px -bottom-0.5 border border-white px-2 text-xs"
        >
            {{ location }}
        </div>
    </div>
</template>

<script lang="ts" setup>
    import version from '../public/config/version';
    import { myYggdrasilAddress, requestMyYggdrasilAddress } from '@/store/authStore';
    import { ref } from 'vue';
    import config from '@/config';
    import { hasBrowserBeenStartedOnce } from '@/store/browserStore'

    //const {hasBrowserBeenStartedOnce} = useBrowserState()

    console.log('Version: ' + version);

    document.querySelector('body').classList.add('overflow-y-hidden');

    //@ts-ignore
    const isDev = import.meta.env.DEV;
    const isBeta = config.beta;
    const location = ref();
    requestMyYggdrasilAddress();
    location.value = myYggdrasilAddress.value;
</script>

<style></style>
