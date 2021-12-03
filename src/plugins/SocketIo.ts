import config from '@/config';
import { useAuthState } from '@/store/authStore';
import { io, Socket } from 'socket.io-client';
let socket;






export const useSocket  = () =>{
    const { user } = useAuthState();
    if(!user.id){
        throw new Error('app not initialized')
    }
    if(!socket){
        socket = io(config.baseUrl, {
            "debug": true,
            // "path": "/socket.io",
            // "hostname": user.id.toString(),
            "secure": true,
            "port": "443"
        } );

    }
    return socket;
    
}



export const installSocket = async (app: any, { connection, options }) => {
    socket = io(connection, options);
    app.config.globalProperties.$socket = socket.value;
}