import { reactive } from '@vue/reactivity';
import { ref } from 'vue';

export const hasBrowserBeenStartedOnce = ref(false);

export const setHasBrowserBeenStartedOnce = () => {
    hasBrowserBeenStartedOnce.value = true;
};

/*
const state = reactive<State>({
    hasBrowserBeenStartedOnce: false,
});



const setHasBrowserBeenStartedOnce = () => {
    state.hasBrowserBeenStartedOnce = true;
};

export const useBrowserState = () => {
    return {
        ...state,
    };
};

export const useBrowserActions = () => {
    return {
        setHasBrowserBeenStartedOnce,
    };
};

interface State {
    hasBrowserBeenStartedOnce: boolean;
}
*/
