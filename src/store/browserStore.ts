import { ref } from 'vue';

export const hasBrowserBeenStartedOnce = ref(false);

export const setHasBrowserBeenStartedOnce = () => {
    hasBrowserBeenStartedOnce.value = true;
};
