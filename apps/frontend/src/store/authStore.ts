import { reactive } from '@vue/reactivity';
import axios from 'axios';
import { User } from '../types';

export const getMyStatus = async () => {
    const res = await axios.get(`${window.location.origin}/api/v2/user/status`);
    return res.data.status;
};

const authState = reactive<AuthState>({
    user: {
        id: 'test.3bot',
        image: `${window.location.origin}/api/v2/user/avatar/default`,
        email: 'testemail',
        status: '',
        location: '',
    },
});

export const myYggdrasilAddress = async () => {
    const res = await axios.get(`${window.location.origin}/api/v2/locations/yggdrasil`);
    return res.data;
};

export const getMyName = async () => {
    const res = await axios.get(`${window.location.origin}/api/v2/user/me`);
    return res.data.username;
};

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
