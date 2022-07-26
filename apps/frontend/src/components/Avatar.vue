<template>
    <img class="rounded-full h-9 w-9" :src="src" alt="" />
</template>

<script lang="ts" setup>
    interface IProps {
        src: string;
    }

    defineProps<IProps>();
</script>

<style scoped></style>
