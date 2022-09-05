import { reactive } from '@vue/reactivity';
import axios from 'axios';
import { User } from '../types';
import { ref } from 'vue';

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

export const loginName = ref<string>('');

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
