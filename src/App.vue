<template>
    <div
        :class='{
            "debug-screens": isDev
        }'
        class='h-screen'
    >
        <suspense>
            <router-view />
        </suspense>
        <div v-if='isDev && location' class='fixed text-white bg-black -right-px -bottom-0.5 border border-white px-2 text-xs'>
            {{ location }}
        </div>
    </div>
</template>

<script lang='ts' setup>
    import version from '../public/config/version';
    import { myYggdrasilAddress } from '@/store/authStore';
    import { ref } from 'vue';

    console.log('Version: ' + version);

    const isDev = import.meta.env.DEV;
    const location = ref();
    myYggdrasilAddress().then(v => location.value = v);
</script>

<style></style>
