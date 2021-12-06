import axios from 'axios';
import config from '@/config';
import { ref } from 'vue';
import { useAuthState } from './authStore';
import { useSocket } from '@/plugins/SocketIo';
import { initializeSocket } from './socketStore';

export const blocklist = ref([]);


export const sendGetBlockList = async () => {
    const { user } = useAuthState();
    const isSocketInit = <boolean>useSocket();
    if (!isSocketInit) initializeSocket(user.id.toString())
    const socket = useSocket();

    socket.emit("get_block_list", {}, function (result) {
        if (result.error)
            throw new Error('get_block_list Failed in backend', result.error)
            blocklist.value = result.data;
    });

};

export const addUserToBlockList = userid => {
    blocklist.value.push(userid);
};

export const isBlocked = (userId: string) => blocklist.value.includes(userId);


export const sendUnblockUser =async (username: string) =>{
    const { user } = useAuthState();
    const isSocketInit = <boolean>useSocket();
    if (!isSocketInit) initializeSocket(user.id.toString())
    const socket = useSocket();

    const callToWebSocket = (res) => socket.emit("unblock_user", { username }, function (result) {
        if (result.error)
            throw new Error('unblock_user Failed in backend', result.error)
    });

    const functionWithPromise = () => {
        return new Promise((res) => {
            callToWebSocket(res);
        });
    };

    return functionWithPromise().then(val => {
        return val;
    })
}
