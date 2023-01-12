<template>
    <app-layout>
        <div class="h-full">
            <iframe
                class="relative h-full w-full"
                title="kutana"
                id="kutana-iframe"
                :src="iframeUrl"
                allow="geolocation; microphone; camera; encrypted-media; clipboard-read; clipboard-write;"
            />
        </div>
    </app-layout>
</template>

<script setup lang="ts">
    import AppLayout from '../../layout/AppLayout.vue';
    import { ref } from 'vue';
    import { onMounted } from 'vue';
    import { useAuthState } from '@/store/authStore';

    const iframeUrl = ref('');
    const { user } = useAuthState();

    onMounted(() => browse());

    const browse = () => (iframeUrl.value = `https://kutana.uhuru.me/?username=${user.id}`);
</script>

<style scoped type="text/css"></style>
