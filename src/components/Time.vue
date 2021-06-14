<template>
    <TimeContent
        :time="time"
        :key="clockType === ClockType.HOURS ? hourClock : clockType === ClockType.MINUTES ? minuteClock : clock"
    />
</template>

<script lang="ts">
    import { defineComponent } from 'vue';
    import { clock, minuteClock, hourClock, ClockType } from '@/services/clockService';
    import TimeContent from '@/components/TimeContent.vue';

    export default defineComponent({
        name: 'Time',
        components: { TimeContent },
        props: {
            time: { type: Date },
        },
        setup(props) {
            const now = new Date();
            const diff = now.getTime() - props.time.getTime();
            let clockType = ClockType.HOURS;
            if (diff < 1000 * 60 * 5) clockType = ClockType.SECONDS;
            else if (diff < 1000 * 60 * 40) clockType = ClockType.MINUTES;

            return {
                clock,
                clockType,
                ClockType,
                hourClock,
                minuteClock,
            };
        },
    });
</script>

<style scoped></style>
