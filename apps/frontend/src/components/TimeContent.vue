<template>
    {{ timeString }}
</template>

<script setup lang="ts">
    import { computed } from 'vue';
    import moment from 'moment';

    const props = defineProps<{ time: Date }>();

    const timeString = computed(() => {
        return moment(props.time).fromNow();
    });
</script>

<style scoped></style>
