<template>
    <app-layout>
        <iframe id="forum-iframe" :src="forumUrl" class="relative h-full w-full" title="forum" />
    </app-layout>
</template>

<script setup lang="ts">
    import AppLayout from '../../layout/AppLayout.vue';

    const forumUrl = 'https://browser.jimber.org/?browsercontrols=false#https://forum.threefold.io/';
</script>

<style scoped type="text/css"></style>
