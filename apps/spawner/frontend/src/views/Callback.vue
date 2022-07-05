<template>
    <div>
        <h2>callback</h2>
    </div>
</template>

<script lang="ts">
    import { defineComponent } from 'vue';
    import { useRouter } from 'vue-router';

    export default defineComponent({
        name: 'Home',
        setup() {
            const router = useRouter();

            console.log('router.currentRoute.value: ', router.currentRoute.value);
            // window.opener.postMessage({
            //   message: "LoginRedirectSuccess"
            // });
        },
    });
</script>
