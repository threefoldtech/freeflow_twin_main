import { io } from 'socket.io-client';

export default {
    install: async (app: any, { connection, options }) => {
        const socket = io(connection, options);
        app.config.globalProperties.$socket = socket;

        app.provide('socket', socket);
    },
};
