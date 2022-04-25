import { reactive } from '@vue/reactivity';
import axios from 'axios';
import { User } from '../types';

export const getMyStatus = async () => {
    const res = await axios.get(`${window.location.origin}/api/v2/user/status`);
    return res.data.status;
};

const authState = reactive<AuthState>({
    user: {
        id: window.location.host.split('.')[0].replace('localhost:8080', 'localhost:3000'),
        image: `${window.location.origin}/api/v1/user/avatar/default`,
        email: 'testemail',
        status: '',
        // @TODO implement this
        location: '@TODO implement this',
    },
});

// @TODO get name from backend not URL
export const loginName = window.location.host.split('.')[0];

export const myYggdrasilAddress = async () => {
    const res = await axios.get(`${window.location.origin}/api/v2/locations/yggdrasil`);
    return res.data;
};

export const useAuthState = () => {
    return {
        ...authState,
    };
};

export const useAuthActions = () => {
    return {};
};

interface AuthState {
    user: User;
}
