import { reactive } from '@vue/reactivity';
import axios from 'axios';
import { Socket } from 'socket.io-client';
import { inject, ref } from 'vue';
import { User } from '../types';
import { sendMessageObject } from './chatStore';
import { socket, state, useSocketActions } from './socketStore';




export const getMyStatus = async () => {
    const res = await axios.get(`${window.location.origin}/api/user/getStatus`);
    // sendGetMyStatus();
    console.log('shodul be result', res.data.status)
    return res.data.status;
};





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

export const myYggdrasilAddress = async () => {
    const res = await axios.get(`${window.location.origin}/api/yggdrasil_address`);
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


export const myAccountStatus = ref('')
const { user } = useAuthState();
export const sendGetMyStatus = async () => {



    const { initializeSocket } = useSocketActions();
    if (!socket) initializeSocket(user.id.toString())


    console.log("send get my status -------------", state.socket)
    socket.emit("get_my_status", {}, function (data) {
        if (data.error)
            console.log('Something went wrong on the server');

        if (data.ok)
            console.log('Event was processed successfully');
        myAccountStatus.value = data.data.status;

    });
}
