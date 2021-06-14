<template>
    <img class="rounded-full h-9 w-9" :src="src" alt="" />
</template>

<script lang="ts">
    import { defineComponent } from 'vue';

    export default defineComponent({
        name: 'Avatar',
        props: {
            src: String,
        },
        setup(props) {
            return {
                ...props,
            };
        },
    });
</script>

<style scoped></style>
