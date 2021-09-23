<template>
    <app-layout>
        <iframe
            v-if="hasBrowserBeenStartedOnce"
            class="relative h-full w-full"
            title="forum"
            id="forum-iframe"
            :src="iframeUrl"
            allow="geolocation; microphone; camera; encrypted-media; clipboard-read; clipboard-write;"
        />
    </app-layout>
</template>

<script lang="ts">
    import appLayout from '../../layout/AppLayout.vue';
    import { defineComponent, ref, onMounted } from 'vue';
    import { hasBrowserBeenStartedOnce } from '@/store/browserStore';
    

    export default defineComponent({
        name: 'Apps',
        components: {
            appLayout,
        },

        setup({}, ctx) {
          
            const iframeUrl = ref('');

            onMounted(() => {
                browse();
            });

            function browse() {
                iframeUrl.value = `https://browser.jimber.org/?browsercontrols=true#https://duckduckgo.com/`;
            }

            return {
                iframeUrl,
                hasBrowserBeenStartedOnce,
                //hasBrowserBeenStartedOnce,
              
            };
        },
    });
</script>

<style scoped type="text/css"></style>
