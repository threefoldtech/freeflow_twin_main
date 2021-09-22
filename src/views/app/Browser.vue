<template>
    <app-layout>
        <pre>{{ hasBrowserBeenStartedOnce }}</pre>
        <iframe
            v-if="test"
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
    import { useBrowserState, useBrowserActions, test } from '@/store/browserStore';
    import { useRouter } from 'vue-router';

    export default defineComponent({
        name: 'Apps',
        components: {
            appLayout,
        },

        setup({}, ctx) {
            const router = useRouter();
            const { setHasBrowserBeenStartedOnce } = useBrowserActions();
            const { hasBrowserBeenStartedOnce } = useBrowserState();

            const iframeUrl = ref('');

            console.log('Inside browser: ' + hasBrowserBeenStartedOnce);

            onMounted(() => {
                test.value = true;
                console.log('onMounted: ' + hasBrowserBeenStartedOnce);

                browse();
            });

            function browse() {
                iframeUrl.value = `https://browser.jimber.org/?browsercontrols=true#https://duckduckgo.com/`;
            }

            return {
                iframeUrl,
                hasBrowserBeenStartedOnce,
                test,
            };
        },
    });
</script>

<style scoped type="text/css"></style>
