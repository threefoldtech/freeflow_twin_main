<template>
    <app-layout>
        <iframe
            class="relative h-full w-full"
            title="kutana"
            id="kutana-iframe"
            :src="iframeUrl"
            allow="geolocation; microphone; camera; encrypted-media; clipboard-read; clipboard-write;"
        />
    </app-layout>
</template>

<script setup lang="ts">
    import AppLayout from '../../layout/AppLayout.vue';
    import { defineComponent, ref } from 'vue';
    import { onMounted, onBeforeMount } from 'vue';

    const iframeUrl = ref('');

    onMounted(() => {
        browse();
    });

    function browse() {
        iframeUrl.value = `https://freeflowconnect.threefold.me/`;
        console.log(iframeUrl.value);
    }
</script>

<style scoped type="text/css"></style>
