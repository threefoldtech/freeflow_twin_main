import { reactive } from '@vue/reactivity';
import { ref } from 'vue';
import axios from 'axios';
import { User } from '../types';

export const getMyStatus = async () => {
    const res = await axios.get(`${window.location.origin}/api/v2/user/status`);
    return res.data.status;
};

const authState = reactive<AuthState>({
    user: {
        id: window.location.host.split('.')[0].replace('localhost:8080', 'localhost:3000'),
        image: `${window.location.origin}/api/v2/user/avatar/default`,
        email: 'testemail',
        status: '',
        location: '',
    },
});

// @TODO get name from backend not URL
export const loginName = window.location.host.split('.')[0];

export const useAuthState = () => {
    return {
        ...authState,
    };
};

export const setLocation = (loc: string) => {
    authState.user.location = loc;
};

export const useAuthActions = () => {
    return {};
};

interface AuthState {
    user: User;
}
