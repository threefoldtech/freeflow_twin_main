<template>
    <app-layout>
        <iframe class="relative h-full w-full" title="forum" id="forum-iframe" :src="iframeUrl"
                allow="geolocation; microphone; camera; encrypted-media; clipboard-read; clipboard-write;" />
    </app-layout>
</template>

<script lang="ts">
    import appLayout from '../../layout/AppLayout.vue';
    import { defineComponent, ref } from 'vue';
    import { onMounted, onBeforeMount } from 'vue'

    export default defineComponent({
        name: 'Apps',
        components: {
            appLayout,
        },

        setup({}, ctx) {
            let iframeUrl = ref('');

            onMounted(() => {
                browse();
            })

            function browse() {
                iframeUrl.value = `https://browser.staging.jimber.io/?browsercontrols=true#https://duckduckgo.com/`;
                console.log(iframeUrl.value);
            }

            return {
                iframeUrl
            };
        },
    });
</script>

<style scoped type="text/css">


</style>
