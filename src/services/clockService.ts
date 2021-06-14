import { ref } from 'vue';

export const clock = ref(new Date().getTime());
export const minuteClock = ref(new Date().getTime());
export const hourClock = ref(new Date().getTime());

export enum ClockType {
    SECONDS = 'SECONDS',
    MINUTES = 'MINUTES',
    HOURS = 'HOURS',
}

setInterval(() => {
    clock.value = new Date().getTime();
}, 1000);


setInterval(() => {
    minuteClock.value = new Date().getTime();
}, 1000 * 40);

setInterval(() => {
    hourClock.value = new Date().getTime();
}, 1000 * 60 * 40);
