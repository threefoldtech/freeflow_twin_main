<template>
    <div class="grid place-items-center h-screen">
        <h1>
            Welcome <b>{{ name }}</b
            >, to your digitalTwin.
        </h1>
        <p>Automaticly redirecting you in 3 seconds ...</p>
        <button class="fancyButton" @click="loginAndPush">
            Verify my identity
        </button>
    </div>
</template>

<script lang="ts">
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

<style scoped type="text/css">
    html {
        background: url(https://www.toptal.com/designers/subtlepatterns/patterns/geometric-leaves.png);
    }

    .fancyButton {
        border: none;
        color: white;
        background: darkslategray;
        padding: 1rem 2rem;
        border-radius: 4px;
        cursor: pointer;
    }
    .fancyButton:hover {
        background: lightslategray;
    }
</style>
