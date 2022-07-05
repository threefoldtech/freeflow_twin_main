<template>
    <div class="gif flex items-center justify-center">
        <img class="h-48 self-center block" :src="message.body" alt="" />
    </div>
</template>

<script lang="ts" setup>
    interface IProp {
        message: Object;
    }

    const props = defineProps<IProp>();
</script>
