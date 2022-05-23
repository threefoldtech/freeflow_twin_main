import { reactive } from '@vue/reactivity';

const state = reactive<State>({
    example: '',
});

const exampleAction = () => {
    console.log('update state');
    state.example = 'new state';
};

export const useState = () => {
    return {
        ...state,
    };
};

export const useActions = () => {
    return {
        exampleAction,
    };
};

interface State {
    example: string;
}
