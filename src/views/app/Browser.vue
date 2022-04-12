<template>
    <app-layout>
        <iframe
            v-if="appName === AppType.Glass"
            class="relative h-full w-full"
            title="forum"
            id="forum-iframe"
            :src="iframeUrl"
            allow="geolocation; microphone; camera; encrypted-media; clipboard-read; clipboard-write;"
        />
    </app-layout>
</template>

<script setup lang="ts">
    import AppLayout from '../../layout/AppLayout.vue';
    import { ref, onMounted, watch } from 'vue';
    import { useRouter } from 'vue-router';
    import { AppType } from '@/types/apps';

    const iframeUrl = ref('');
    const appName = ref('glass');

    onMounted(() => {
        browse();
    });

    function browse() {
        console.log(`CALLED`);
        iframeUrl.value = `https://browser.jimber.org/?browsercontrols=true#https://duckduckgo.com/`;
    }

    watch(useRouter().currentRoute, currentRoute => {
        const routerApp = currentRoute.meta?.app;
        if (typeof routerApp === 'string') appName.value = routerApp;
    });
</script>

<style scoped type="text/css"></style>
