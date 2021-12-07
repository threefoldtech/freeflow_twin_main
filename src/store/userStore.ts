import axios from 'axios';
import config from '@/config';
import { useSocket } from '@/plugins/SocketIo';
import { useAuthState } from './authStore';
import { initializeSocket } from './socketStore';

export const setNewAvatar = async selectedFile => {
    var formData = new FormData();
    formData.append('file', selectedFile);
    const url = `${config.baseUrl}api/user/avatar`;
    try {
        const result = await axios.post(url, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return result.data;
    } catch (e) {
        console.log(e);
    }
};

export const isUserAuthenticated = async () => {
    const url = `${config.baseUrl}api/auth/authenticated`;
    try {
        const result = await axios.get(url);
        return result.data;
    } catch (e) {
        console.log(e);
    }
};

// export const sendIsUserAuthenticated = () =>{
//     const { user } = useAuthState();
//     const isSocketInit = <boolean>useSocket();
//     const userId = user.id.toString();
//     if (!isSocketInit) initializeSocket(user.id.toString())
//     const socket = useSocket();


  

//     const callToWebsocket = (res) => socket.emit("is_user_authenticated", {
//         userId
//     }, function callback(result) {
//         if (result.error)
//             throw new Error('is_user_authenticated Failed in backend', result.error)
//         res({
//             hasMore: result.hasMore,
//             messages: result.messages
//         })


//     });

//     const functionWithPromise = () => {
//         return new Promise((res) => {
//             callToWebsocket(res);
//         });
//     };

//     return functionWithPromise().then(val => {
//         return val;
//     })
// }
