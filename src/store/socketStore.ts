import { DtId, Id, Message, MessageBodyType, SystemBody } from '@/types';
import { reactive } from '@vue/reactivity';
import { toRefs, ref } from 'vue';
import { handleRead, removeChat, usechatsActions } from './chatStore';
import { useContactsState } from './contactStore';
import { useAuthState } from '@/store/authStore';
import { addUserToBlockList } from '@/store/blockStore';
import { createErrorNotification } from '@/store/notificiationStore';
import { login } from '@/services/authService';
import { io, Socket } from 'socket.io-client';
import { useSocket } from '@/plugins/SocketIo';
export const state = reactive<State>({
    socket: '',
    notification: {
        id: '',
        sound: '',
    },
});

const notify = ({ id, sound = 'beep.mp3' }) => {
    state.notification = {
        id,
        sound,
    };
};


export const initializeSocket = async (username: string) => {
      
        const socket = useSocket();
    // console.log("in socketstore" , {...socket})

        socket.on('connect', () => {
            console.log('connected with socket.');
        });
        socket.emit('identify', {
            name: username,
        });
        socket.on('chat_removed', chatId => {
            console.log('chat_removed');
            removeChat(chatId);
        });
        socket.on('chat_blocked', chatId => {
            addUserToBlockList(chatId);
        });
        socket.on('message', message => {
            console.log("message in websocket client ", message)
            const { user } = useAuthState();
            if (message.type === 'FILE_SHARE_REQUEST') {
                return;
            }
            if (message.type === 'READ') {
                handleRead(message);
                return;
            }
            if (message.type !== 'SYSTEM' || message.type !== 'EDIT' || message.type !== 'DELETE') {
                notify({ id: message.id });
            }
            const { addMessage } = usechatsActions();

            addMessage(message.to === user.id ? message.from : message.to, message);
        });
        socket.on('connectionRequest', newContactRequest => {
            const { addChat } = usechatsActions();
            const { contacts } = useContactsState();
            const { user } = useAuthState();
            addChat(newContactRequest);
        });
        socket.on('chat_updated', chat => {
            const { updateChat } = usechatsActions();
            updateChat(chat);
        });
        socket.on('new_chat', chat => {
            const { addChat } = usechatsActions();
            addChat(chat);
        });
        socket.on('disconnect', () => {
            createErrorNotification('Connection Lost', 'You appear to be having connection issues');
        });
        socket.on('shares_updated', share => {
            //@todo implement this
        });
        socket.on('status', share => {
            console.log("getting avatar")
        });
}

const sendSocketMessage = async (chatId: string, message: Message<any>, isUpdate = false) => {
    const data = {
        chatId,
        message,
    };
    const messageType = isUpdate ? 'update_message' : 'message';
    const socket = useSocket();
    await socket.emit(messageType, data);
};

export const sendRemoveChat = async (id: Id) => {
    const socket = useSocket();
    socket.emit('remove_chat', id);
};
export const sendBlockChat = async (id: Id) => {
    const socket = useSocket();
    socket.emit('block_chat', id);
};

const sendSocketUserStatus = async (status: string) => {
    const socket = useSocket();
    const data = {
        status,
    };
    socket.emit('status_update', data);
};

const getSocket = () => {
    const socket = useSocket();
    return socket;
};

export const useSocketActions = () => {
    return {
        initializeSocket,
        sendSocketMessage,
        sendSocketUserStatus,
        notify,
    };
};

export const useSocketState = () => {
    return {
        ...toRefs(state),
    };
};

export const sendDraftMessage = async (message: MessageBodyType) => {
    const socket = useSocket();
    // state.socket.emit('draft_message', function (response) {
    //     console.log(response);
    // });
    socket.emit("draft_message", { property: message }, function (data) {
        console.log("data from backend", data)
        if (data.error)
            console.log('Something went wrong on the server');

        if (data.ok)
            console.log('Event was processed successfully');
    });
}

export const sendAddContact = async (username: DtId, location: string, addMessage: Message<SystemBody>) => {
    console.log("send add contact")
    const socket = useSocket();
    socket.emit("add_contact", { "username": username, "location": location, "addMessage": addMessage }, function (data) {
        if (data.error)
            console.log('Something went wrong on the server');

        if (data.ok)
            console.log('Event was processed successfully');

    });
}

interface State {
    socket: any;
    notification: object;
}

