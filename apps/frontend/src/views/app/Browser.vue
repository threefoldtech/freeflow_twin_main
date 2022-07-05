<template>
    <slot></slot>
</template>

<script setup lang="ts">
    import { ref, watch } from 'vue';
    import { useRouter } from 'vue-router';

    const appName = ref('glass');

    watch(useRouter().currentRoute, currentRoute => {
        const routerApp = currentRoute.meta?.app;
        if (typeof routerApp === 'string') appName.value = routerApp;
    });
</script>

<style scoped type="text/css"></style>
