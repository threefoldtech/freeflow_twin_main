<template>
    <app-layout>
        <iframe class="relative h-full w-full" title="forum" id="forum-iframe" :src="forumUrl" />
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
            let forumUrl = 'https://browser.staging.jimber.io/?browsercontrols=false#https://forum.threefold.io/';
            return {
                forumUrl,
            };
        },
    });
</script>

<style scoped type="text/css">

</style>
