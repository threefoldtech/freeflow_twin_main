import { reactive } from '@vue/reactivity';

const state = reactive<State>({
    scrollEvents: [],
});

const addScrollEvent = (force = false) => {
    state.scrollEvents.push(force);
};

const popScrollEvent = () => {
    state.scrollEvents.pop();
}

const shiftScrollEvent = () => {
    state.scrollEvents.shift();
}

const clearScrollEvents = () => {
    state.scrollEvents = [];
}

export const useScrollState = () => {
    return {
        ...state,
    };
};

export const useScrollActions = () => {
    return {
        addScrollEvent,
        popScrollEvent,
        clearScrollEvents,
        shiftScrollEvent
    };
};

interface State {
    scrollEvents: boolean[];
}
