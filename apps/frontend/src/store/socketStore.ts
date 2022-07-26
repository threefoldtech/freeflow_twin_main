import { Chat, Contact, Id, Message } from '@/types';
import { reactive } from '@vue/reactivity';
import { inject, toRefs } from 'vue';
import { handleRead, newUnreadChats, removeChat, usechatsActions } from './chatStore';
import { setLocation, useAuthState } from '@/store/authStore';
import { addUserToBlockList, blocklist, removeUserFromBlockList } from '@/store/blockStore';
import { createErrorNotification } from '@/store/notificiationStore';
import { getAllPosts } from '@/services/socialService';
import { getSharedContent } from '@/store/fileBrowserStore';
import { FileAction } from 'custom-types/file-actions.type';
import { loadAllUsers } from '@/store/userStore';
import config from '@/config';
import { statusList } from './statusStore';

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
    state.socket.on('chat_removed', (chatId: string) => {
        removeChat(chatId);
        const { removeUnreadChats } = usechatsActions();
        removeUnreadChats(chatId);
    });
    state.socket.on('chat_blocked', (chatId: string) => {
        addUserToBlockList(chatId);
    });
    state.socket.on('chat_unblocked', (chatId: string) => {
        removeUserFromBlockList(chatId);
    });
    state.socket.on('message', (message: Message<any>) => {
        if (message.type !== 'READ') createOSNotification('Message received', `From: ${message.from}`);
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
            const { newUnreadChats } = usechatsActions();
            newUnreadChats(message.to === user.id ? message.from.toString() : message.to.toString());
        }
        const { addMessage } = usechatsActions();

        addMessage(String(message.to) === String(user.id) ? String(message.from) : String(message.to), message);
    });
    state.socket.on('connection_request', (newContactRequest: Chat) => {
        const contact = newContactRequest.contacts.find(x => x.id !== username);
        createOSNotification('New contact request', `From: ${contact.id}`);
        const { addChat } = usechatsActions();
        addChat(newContactRequest);
        newUnreadChats(newContactRequest.chatId);
    });
    state.socket.on('chat_updated', (chat: Chat) => {
        const { updateChat } = usechatsActions();
        updateChat(chat);
    });
    state.socket.on('new_chat', (chat: Chat) => {
        const { addChat } = usechatsActions();
        addChat(chat);
    });
    state.socket.on('posts_updated', () => {
        getAllPosts();
    });
    state.socket.on('disconnect', () => {
        createErrorNotification('Connection Lost', 'You appear to be having connection issues');
    });
    state.socket.on('shares_updated', () => {
        getSharedContent();
    });
    state.socket.on('update_status', ({ id, isOnline }: { id: string; isOnline: boolean }) => {
        if (statusList[id]) statusList[id].isOnline = isOnline;
    });
    state.socket.on('appID', (url: string) => {
        config.setAppId(url);
    });
    state.socket.on('yggdrasil', (location: string) => {
        setLocation(location);
    });
    state.socket.on('blocked_contacts', (contacts: { id: string }[]) => {
        blocklist.value = contacts;
    });
    state.socket.on('users_loaded', async (users: Contact[]) => {
        loadAllUsers(users);
    });
};

const sendSocketMessage = async (chatId: string, message: Message<any>, isUpdate = false) => {
    const data = {
        chatId,
        message: { ...message, chatId },
    };
    const messageType = isUpdate ? 'update_message' : 'message';
    await state.socket.emit(messageType, data);
};

export const sendRemoveChat = async (id: Id) => {
    state.socket.emit('remove_chat', id);
};
export const sendRemoveUser = async (id: Id) => {
    state.socket.emit('remove_user', id);
};
export const sendBlockChat = async (id: Id) => {
    state.socket.emit('block_chat', id);
};

const sendUnBlockedChat = async (id: Id) => {
    state.socket.emit('unblock_chat', id);
    blocklist.value = blocklist.value.filter(x => x !== id);
};

const sendSocketUserStatus = async (status: string) => {
    state.socket.emit('status_update', status);
};

const sendHandleUploadedFile = async ({
    fileId,
    action,
    payload,
}: {
    fileId: string;
    payload: unknown;
    action: FileAction;
}) => {
    state.socket.emit('handle_uploaded_file', {
        fileId,
        payload,
        action,
    });
};

export const useSocketActions = () => {
    return {
        initializeSocket,
        sendSocketMessage,
        sendSocketUserStatus,
        sendHandleUploadedFile,
        sendUnBlockedChat,
        sendRemoveChat,
        sendBlockChat,
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

const createOSNotification = (title: string, body: string) => {
    const notifImg = '/purple_uhuru_logo.ico';
    const options = {
        body,
        icon: notifImg,
    };
    Notification.requestPermission().then(result => {
        if (result === 'granted') new Notification(title, options);
    });
};
