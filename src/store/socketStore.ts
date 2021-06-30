import { Id, Message } from '@/types';
import { reactive } from '@vue/reactivity';
import { toRefs, inject } from 'vue';
import { handleRead, removeChat, usechatsActions } from './chatStore';
import { useContactsState } from './contactStore';
import { useAuthState } from '@/store/authStore';
import { addUserToBlockList } from '@/store/blockStore';
import {createErrorNotification} from '@/store/notificiationStore';

const state = reactive<State>({
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

const initializeSocket = (username: string) => {
    state.socket = inject('socket');

    state.socket.on('connect', () => {
        console.log('connected with socket.');
    });
    state.socket.emit('identify', {
        name: username,
    });
    state.socket.on('chat_removed', chatId => {
        console.log('chat_removed');
        removeChat(chatId);
    });
    state.socket.on('chat_blocked', chatId => {
        addUserToBlockList(chatId);
    });
    state.socket.on('message', message => {
        if (message.type === 'READ') {
            handleRead(message);
            return;
        }
        if (
            message.type !== 'SYSTEM' ||
            message.type !== 'EDIT' ||
            message.type !== 'DELETE'
        ) {
            notify({ id: message.id });
        }
        const { addMessage } = usechatsActions();

        const { user } = useAuthState();
        addMessage(message.to === user.id ? message.from : message.to, message);
    });
    state.socket.on('connectionRequest', newContactRequest => {
        const { addChat } = usechatsActions();
        const { contacts } = useContactsState();
        const { user } = useAuthState();
        addChat(newContactRequest);
    });
    state.socket.on('chat_updated', chat => {
        const { updateChat } = usechatsActions();
        updateChat(chat);
    });
    state.socket.on('new_chat', chat => {
        const { addChat } = usechatsActions();
        addChat(chat);
    });
    state.socket.on('disconnect', () => {
        createErrorNotification("Connection Lost", "You appear to be having connection issues")
    });

};

const sendSocketMessage = async (
    chatId: string,
    message: Message<any>,
    isUpdate = false
) => {
    const data = {
        chatId,
        message,
    };
    const messageType = isUpdate ? 'update_message' : 'message';
    await state.socket.emit(messageType, data);
};

export const sendRemoveChat = async (id: Id) => {
    state.socket.emit('remove_chat', id);
};
export const sendBlockChat = async (id: Id) => {
    state.socket.emit('block_chat', id);
};

const sendSocketUserStatus = async (status: string) => {
    const data = {
        status,
    };
    state.socket.emit('status_update', data);
};

const getSocket = () => {
    return state.socket;
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

interface State {
    socket: any;
    notification: object;
}
