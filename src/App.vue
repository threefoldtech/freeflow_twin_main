<template>
    <suspense>
        <router-view />
    </suspense>
</template>

<script lang="ts" setup>
    import version from '../public/config/version';
    console.log('Version: ' + version);
</script>

<style></style>
