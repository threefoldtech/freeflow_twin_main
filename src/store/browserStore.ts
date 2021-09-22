import { reactive } from '@vue/reactivity';
import { ref } from 'vue';

const state = reactive<State>({
    hasBrowserBeenStartedOnce: false,
});

export const test = ref(false);

const setHasBrowserBeenStartedOnce = () => {
    console.log('Setting var to true');
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
