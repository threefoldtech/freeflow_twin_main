<template>
    <div
        class="loader ease-linear rounded-full border-4 border-accent-200 inline-block"
        :class="{
            'h-12 w-12 border-4': xlarge,
            'h-10 w-10': large,
            'h-6 w-6': small,
            'h-4 w-4 border-2': xsmall,
            'h-8 w-8': !xlarge && !large && !small && !xsmall,
        }"
    ></div>
</template>

<script setup lang="ts">
    interface IProps {
        xlarge?: boolean;
        large?: boolean;
        small?: boolean;
        xsmall?: boolean;
    }

    const { xlarge, large, small, xsmall } = withDefaults(defineProps<IProps>(), {
        xlarge: false,
        large: false,
        small: false,
        xsmall: false,
    });
</script>

<style scoped>
    .loader {
        border-top-color: rgb(46, 38, 111) !important;
        -webkit-animation: 1.5s spinner linear infinite;
        animation: 1.5s spinner linear infinite;
    }
</style>
