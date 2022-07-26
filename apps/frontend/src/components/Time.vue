<template>
    <TimeContent
        :time="time"
        :key="clockType === ClockType.HOURS ? hourClock : clockType === ClockType.MINUTES ? minuteClock : clock"
    />
</template>

<script setup lang="ts">
    import { defineComponent } from 'vue';
    import { clock, minuteClock, hourClock, ClockType } from '@/services/clockService';
    import TimeContent from '@/components/TimeContent.vue';

    const props = defineProps<{ time: Data }>();

    const now = new Date();
    const diff = now.getTime() - props.time.getTime();
    let clockType = ClockType.HOURS;
    if (diff < 1000 * 60 * 5) clockType = ClockType.SECONDS;
    else if (diff < 1000 * 60 * 40) clockType = ClockType.MINUTES;
</script>

<style scoped></style>
