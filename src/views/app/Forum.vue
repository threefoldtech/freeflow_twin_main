<template>
    <app-layout>
        <iframe id="forum-iframe" :src="forumUrl" class="relative h-full w-full" title="forum" />
    </app-layout>
</template>

<script lang="ts">
    import appLayout from '../../layout/AppLayout.vue';
    import { defineComponent } from 'vue';

    export default defineComponent({
        name: 'Apps',
        components: {
            appLayout,
        },
        setup({}, ctx) {
            let forumUrl = 'https://browser.jimber.org/?browsercontrols=false#https://forum.threefold.io/';
            return {
                forumUrl,
            };
        },
    });
</script>

<style scoped type="text/css"></style>
