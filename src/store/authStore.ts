import { useSocket } from '@/plugins/SocketIo';
import { reactive } from '@vue/reactivity';
import { Socket } from 'socket.io-client';
import { ref } from 'vue';
import { User } from '../types';
import { sendMessageObject } from './chatStore';
import { initializeSocket } from './socketStore';


const authState = reactive<AuthState>({
    user: {
        id: window.location.host.split('.')[0].replace('localhost:8080', 'localhost:3000'),
        image: `${window.location.origin}/api/user/avatar/default`,
        email: 'testemail',
        status: '',
        // @TODO implement this
        location: '@TODO implement this',
    },
});

// @TODO get name from backend not URL
export const loginName = window.location.host.split('.')[0];



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




export const myAccountStatus = ref('')
const { user } = useAuthState();


export const sendGetMyStatus = async () => {
    const isSocketInit = <boolean>useSocket();
    if (!isSocketInit) initializeSocket(user.id.toString())
    const socket = useSocket();
    const callToWebsocket = (res) =>socket.emit("get_my_status", {}, function (data) {
        if (data.error)
            throw new Error('get_my_status Failed in backend', data.error)
        myAccountStatus.value = data.data.status
        res(data.data.status)

    });

    const functionWithPromise = () => {
        return new Promise((res) => {
            callToWebsocket(res);
        });
    };

    return functionWithPromise().then(val => {
        return val;
    })
}

export const requestMyYggdrasilAddress = () => {
    const isSocketInit = <boolean>useSocket();
    if (!isSocketInit) initializeSocket(user.id.toString())
    const socket = useSocket();
    const callToWebsocket = (res) =>socket.emit("my_yggdrasil_address", {}, function (data) {
        if (data.error)
            throw new Error('my_yggdrasil_address Failed in backend', data.error)
        res(data.data)

    });

    const functionWithPromise = () => {
        return new Promise((res) => {
            callToWebsocket(res);
        });
    };

    return functionWithPromise().then(val => {
        return val;
    })
}
