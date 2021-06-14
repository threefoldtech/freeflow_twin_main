<template>
    <div class="gif flex items-center justify-center">
        <img class="h-48 self-center block" :src="message.body" alt="" />
    </div>
</template>

<script lang="ts">
    import { defineComponent } from 'vue';

    export default defineComponent({
        name: 'GifContent',
        props: {
            message: { type: Object, required: true },
        },
        setup(props) {
            return {};
        },
    });
</script>
