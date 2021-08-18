<template>
    <suspense>
        <router-view />
    </suspense>
</template>

<script lang="ts">
    import { defineComponent } from 'vue';
    import version from '../public/config/version';
    // const {gitDescribe, gitDescribeSync} = require('git-describe');

    // process.env.VUE_APP_GIT_HASH = gitDescribeSync().hash
    console.log('Version: ' + version);
    // console.log(`Version: ${process.env.VUE_APP_GIT_VERSION}`);

    export default defineComponent({
        name: 'App',
    });
</script>

<style>
</style>
