<template>
    <div class='grid place-items-center h-screen'
         style='background: url(https://www.toptal.com/designers/subtlepatterns/patterns/geometric-leaves.png);'>
        <h1>
            Welcome <b>{{ name }}</b
        >, to your digitalTwin.
        </h1>
        <p>Automaticly redirecting you in 3 seconds ...</p>
        <button class='bg-gray-800 hover:bg-gray-600 text-white rounded cursor-pointer py-4 px-4' @click='loginAndPush'>
            Verify my identity
        </button>
    </div>
</template>

<script lang='ts'>
    import { defineComponent } from 'vue';
    import { login } from '@/services/authService';

    const loginAndPush = async () => {
        console.log('Attempting to login ...');
        await login();
    };

    export default defineComponent({
        name: 'Home',
        mounted() {
            setTimeout(() => {
                loginAndPush();
            }, 3200);
        },
        setup() {
            return {
                name: window.location.host.split('.')[0],
                loginAndPush,
            };
        },
    });
</script>

<style scoped type='text/css'>
</style>
