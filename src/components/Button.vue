<template>
    <button class=" flex items-center rounded-xl m-2 bg-accent text-white btn">
        <slot />
    </button>
</template>

<script>
    export default {
        name: 'Button',
    };
</script>

<style scoped>
    .btn:disabled {
        background-color: lightgray;
        cursor: unset;
    }
</style>
