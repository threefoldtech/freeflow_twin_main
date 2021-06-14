<template>
    <suspense>
        <router-view />
    </suspense>
</template>

<script lang="ts">
    import { defineComponent } from 'vue';
    import version from "../public/config/version";
    // const {gitDescribe, gitDescribeSync} = require('git-describe');

    // process.env.VUE_APP_GIT_HASH = gitDescribeSync().hash
    console.log('Version: '+ version);
    // console.log(`Version: ${process.env.VUE_APP_GIT_VERSION}`);

    export default defineComponent({
        name: 'App',
    });
</script>

<style>
    a {
        text-decoration: none !important;
    }
    #app .prose h1,
    #app .prose h2,
    #app .prose h3 {
        margin-top: 0;
        margin-bottom: 0;
    }
</style>
