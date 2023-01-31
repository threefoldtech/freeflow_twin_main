<template>
    <div
        class="loader ease-linear rounded-full border-4 border-accent-200 inline-block"
        :class="{
            'h-12 w-12 border-4': xLarge,
            'h-10 w-10': large,
            'h-6 w-6': small,
            'h-4 w-4 border-2': xSmall,
            'h-8 w-8': !xLarge && !large && !small && !xSmall,
        }"
    ></div>
</template>

<script setup lang="ts">
    interface IProps {
        xLarge?: boolean;
        large?: boolean;
        small?: boolean;
        xSmall?: boolean;
    }

    const { xLarge, large, small, xSmall } = withDefaults(defineProps<IProps>(), {
        xLarge: false,
        large: false,
        small: false,
        xSmall: false,
    });
</script>

<style scoped>
    .loader {
        border-top-color: rgb(46, 38, 111) !important;
        -webkit-animation: 1.5s spinner linear infinite;
        animation: 1.5s spinner linear infinite;
    }
</style>
