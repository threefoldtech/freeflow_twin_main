<template>
    <router-view />
</template>

<script lang="ts">
    import { defineComponent } from 'vue';

    import { login } from './service/authService';

    export default defineComponent({
        setup() {
            return {
                login,
            };
        },
    });
</script>

<style>
    #app {
        font-family: Avenir, Helvetica, Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        text-align: center;
        color: #2c3e50;
        width: 100%;
        height: 100%;
        margin: 0 auto;
        background-color: #f3f5fe;
        display: flex;
        justify-content: center;
        align-items: center;
    }
</style>
