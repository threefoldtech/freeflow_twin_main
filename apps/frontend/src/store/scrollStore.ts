import { reactive } from '@vue/reactivity';
import { toRefs } from 'vue';

const state = reactive<State>({
    scrollEvents: [],
    scrollToNewComment: false,
});

const addScrollEvent = (force = false) => {
    state.scrollEvents.push(force);
};

const popScrollEvent = () => {
    state.scrollEvents.pop();
};

const shiftScrollEvent = () => {
    state.scrollEvents.shift();
};

const clearScrollEvents = () => {
    state.scrollEvents = [];
};

const isScrollToNewComment = (force = false) => {
    state.scrollToNewComment = force;
};

export const useScrollState = () => {
    return {
        ...toRefs(state),
    };
};

export const useScrollActions = () => {
    return {
        addScrollEvent,
        popScrollEvent,
        clearScrollEvents,
        shiftScrollEvent,
        isScrollToNewComment,
    };
};

interface State {
    scrollEvents: boolean[];
    scrollToNewComment: boolean;
}
