import { reactive } from '@vue/reactivity';
import { nextTick, readonly, ref, toRefs } from 'vue';
import axios from 'axios';
import moment from 'moment';
import {
    Chat,
    Contact,
    FileTypes,
    GetMessagesResponse,
    GroupChat,
    GroupManagementBody,
    Message,
    MessageBodyType,
    MessageTypes,
    SystemBody,
    SystemMessageTypes,
} from '../types';
import { initializeSocket, sendDraftMessage, useSocketActions } from './socketStore';
import { requestMyYggdrasilAddress, useAuthState } from './authStore';
import config from '@/config';
import { uuidv4 } from '@/common';
import { startFetchStatusLoop } from '@/store/statusStore';
import { uniqBy } from 'lodash';
import { useScrollActions } from './scrollStore';
import { blocklist } from '@/store/blockStore';
import { useSocket } from '@/plugins/SocketIo';

const messageLimit = 50;
const state = reactive<ChatState>({
    chats: [],
    chatRequests: [],
    chatInfo: {},
});

export const selectedId = ref('');
export const selectedMessageId = ref(undefined);
export const isLoading = ref(false);

export enum MessageAction {
    EDIT = 'EDIT',
    REPLY = 'REPLY',
}

interface MessageState {
    actions: {
        [key: string]: {
            message: Message<any>;
            type: MessageAction;
        };
    };
}

export const messageState = reactive<MessageState>({
    actions: {},
});

export const setMessageAction = (chatId: string, message: Message<any>, action: MessageAction) => {
    messageState.actions = {
        ...(messageState.actions ?? {}),
        [chatId]: {
            message,
            type: action,
        },
    };
};

export const clearMessageAction = (chatId: string) => {
    messageState.actions = {
        ...(messageState.actions ?? {}),
        [chatId]: undefined,
    };
};




export const sendRetrieveChats = () => {
    const { user } = useAuthState();
    const isSocketInit = <boolean>useSocket();
    if (!isSocketInit) initializeSocket(user.id.toString())
    const socket = useSocket();

    socket.emit("retrieve_chats", { 'limit': messageLimit.toString() }, function (result) {
        if (result.error)
            throw new Error('retrieve_chats Failed in backend', result.error)
        const incommingchats = result.data;
        incommingchats.forEach(chat => {
            addChat(chat);
        });
        sortChats();
        isLoading.value = false;
    });
}


export const editMessage = (chatId, message) => {
    clearMessageAction(chatId);
    //nextTick is needed because vue throws dom errors if you switch between Reply and Edit
    nextTick(() => {
        setMessageAction(chatId, message, MessageAction.EDIT);
    });
};

export const replyMessage = (chatId, message) => {
    clearMessageAction(chatId);
    //nextTick is needed because vue throws dom errors if you switch between Reply and Edit
    nextTick(() => {
        setMessageAction(chatId, message, MessageAction.REPLY);
    });
};

const getChat = chatId => state.chats.find(x => x.chatId === chatId);
const setChatHasMoreMessages = (chatId: string, hasMore: boolean): void => {
    state.chatInfo[chatId] = {
        ...(state.chatInfo[chatId] ?? { isLoading: false }),
        hasMoreMessages: hasMore,
    };
};
const setChatMessagesAreLoading = (chatId: string, isLoading: boolean): void => {
    state.chatInfo[chatId] = {
        ...(state.chatInfo[chatId] ?? { hasMoreMessages: false }),
        isLoading: isLoading,
    };
};
const getChatInfo = (chatId: string) => readonly(state.chatInfo[chatId]);

const addChat = (chat: Chat) => {
    setChatHasMoreMessages(<string>chat.chatId, chat.messages && chat.messages.length >= messageLimit);

    if (!chat.isGroup) {
        const { user } = useAuthState();
        const otherContact: Contact = <Contact>chat?.contacts?.find(c => c.id !== user.id);
        if (otherContact) {
            startFetchStatusLoop(otherContact);
        }
    }

    if (chat.acceptedChat) {
        state.chats.push(chat);
        state.chats = uniqBy(state.chats, c => c.chatId);
    } else {
        state.chatRequests.push(chat);
    }
    sortChats();
};

export const removeChat = chatId => {
    state.chats = state.chats.filter(c => c.chatId !== chatId);
    state.chatRequests = state.chatRequests.filter(c => c.chatId !== chatId);
    sortChats();
    selectedId.value = <string>state.chats.find(() => true)?.chatId;
};

const sendAddGroupChat = (name: string, contacts: Contact[]) => {
    const { user } = useAuthState();


    const contactInGroup = contacts.map(contact => {
        if (user.id !== contact.id)
            return contact.id
    }).filter(x => {
        return x !== undefined;
    })

    const newGroupchat: GroupChat = {
        isGroup: true,
        chatId: uuidv4(),
        contacts: contacts,
        messages: [
            {
                from: user.id,
                to: name,
                body: {
                    message: `Group created by ${user.id} with the following inital member: ${contactInGroup.join(', ')}`,
                } as SystemBody,
                timeStamp: new Date(),
                id: uuidv4(),
                type: MessageTypes.SYSTEM,
                replies: [],
                subject: null,
            },
        ],
        name: name,
        adminId: user.id,
        read: {},
        acceptedChat: true,
        draft: undefined
    };

    const isSocketInit = <boolean>useSocket();
    if (!isSocketInit) initializeSocket(user.id.toString())
    const socket = useSocket();

    socket.emit("add_group_chat", newGroupchat, function (result) {
        if (result.error)
            throw new Error('add_group_chat Failed in backend', result.error)
    });

}


const sendAcceptChat = (id) => {
    const { user } = useAuthState();
    const isSocketInit = <boolean>useSocket();
    if (!isSocketInit) initializeSocket(user.id.toString())
    const socket = useSocket();

    const callToWebSocket = (res) => socket.emit("accept_chat", { id }, function (result) {
        if (result.error)
            throw new Error('accept_chat Failed in backend', result.error)
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

const updateChat = (chat: Chat) => {
    removeChat(chat.chatId);
    addChat(chat);
};

function getMessage(chat: Chat, id) {
    let message = chat.messages.find(m => m.id === id);

    if (!message) {
        chat.messages.find(m => {
            const found = m.replies.find(r => r.id === id);
            if (!found) {
                return false;
            }

            message = found;
            return true;
        });
    }

    return message;
}

const appendMessages = (chat: Chat, messages: Array<Message<MessageBodyType>> | undefined): void => {
    if (!messages) return;
    chat.messages = messages.concat(chat.messages);
};

export const fetchedMessages = ref<Object>('')

const sendFetchMessages = async (chatId: string,
    limit: number,
    lastMessageId: string | undefined
) => {
    const { user } = useAuthState();
    const isSocketInit = <boolean>useSocket();
    if (!isSocketInit) initializeSocket(user.id.toString())
    const socket = useSocket();

    const params = new Object();

    if (lastMessageId) params['fromId'] = lastMessageId;

    params['limit'] = limit.toString();

    let hasMore;
    let messages;

    const callToWebsocket = (res) => socket.emit("fetch_messages", {
        'chatId': chatId, 'params': params
    }, function callback(result) {
        if (result.error)
            throw new Error('fetch_messages Failed in backend', result.error)
        res({
            hasMore: result.hasMore,
            messages: result.messages
        })


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


const getNewMessages = async (chatId: string) => {

    const info = getChatInfo(chatId);
    console.log(info)
    if (!info || info.isLoading || !info.hasMoreMessages) return;

    try {
        setChatMessagesAreLoading(chatId, true);
        const chat = getChat(chatId);
        if (!chat) return;
        const response = await sendFetchMessages(<string>chat.chatId, messageLimit, <string>chat.messages[0]?.id);
        console.log("response from websocket is ", response)
        sendFetchMessages(<string>chat.chatId, messageLimit, <string>chat.messages[0]?.id).then(val => {
            console.log("promise", val)
        })

    } catch (ex) {
        return false;
    } finally {
        setChatMessagesAreLoading(chatId, false);
    }
};

const addMessage = (chatId, message) => {
    const { addScrollEvent } = useScrollActions();
    if (message.type === 'READ') {
        const chat: Chat = getChat(chatId);

        const newRead = getMessage(chat, message.body);
        const oldRead = getMessage(chat, <string>message.from);

        if (oldRead && new Date(newRead.timeStamp).getTime() > new Date(oldRead.timeStamp).getTime()) {
            return;
        }

        chat.read = { ...chat.read, [<string>message.from]: message.body };
        return;
    }

    if (message.type === 'REMOVEUSER' || message.type === 'ADDUSER') {
        return;
    }

    const chat: Chat = getChat(chatId);

    if (message.subject) {
        const subjectMessageIndex = chat.messages.findIndex(m => m.id === message.subject);
        if (subjectMessageIndex === -1) {
            return;
        }
        const subjectMessage = chat.messages[subjectMessageIndex];

        const replyIndex = subjectMessage.replies.findIndex(m => m.id === message.id);
        if (replyIndex === -1) {
            return;
        }
        const reply = subjectMessage.replies[replyIndex];
        if (message.type === MessageTypes.DELETE || message.type === MessageTypes.EDIT) {
            reply.body = message.body;
        } else {
            subjectMessage.replies = [...subjectMessage.replies, message];
            chat.messages[subjectMessageIndex] = subjectMessage;
        }

        setLastMessage(chatId, message);
        addScrollEvent();
        return;
    }

    if (message.type === 'EDIT') {
        const index = chat.messages.findIndex(mes => mes.id == message.body.id);

        if (index === -1) return;
        chat.messages[index] = message.body;
        return;
    }

    const index = chat.messages.findIndex(mes => mes.id == message.id);
    if (index !== -1) {
        chat.messages[index] = message;
    }

    if (index === -1) {
        chat.messages.push(message);
    }

    sortChats();
    setLastMessage(chatId, message);
    addScrollEvent();
};

const sendMessage = (chatId, message, type: string = 'STRING') => {
    const { sendSocketMessage } = useSocketActions();
    const { user } = useAuthState();

    const msg: Message<String> = {
        id: uuidv4(),
        body: message,
        from: user.id,
        to: chatId,
        timeStamp: new Date(),
        type: type,
        replies: [],
        subject: null,
    };
    addMessage(chatId, msg);
    sendSocketMessage(chatId, msg);
};

const sendSystemMessage = (chatId, message: string) => {
    sendMessage(chatId, { message: message } as SystemBody, MessageTypes.SYSTEM);
};

export const sendMessageObject = (chatId, message: Message<MessageBodyType>) => {
    const { sendSocketMessage } = useSocketActions();
    // @TODO when doing add message on SYSTEM/groupupdate results in  max call stack exeeded
    if (message.type !== 'SYSTEM') {
        addMessage(chatId, message);
    }
    const isEdit = message.type === 'EDIT' || message.type === 'DELETE';
    sendSocketMessage(chatId, message, isEdit);
};

const sendFile = async (chatId, selectedFile, isBlob = false, isRecording = false) => {
    const { user } = useAuthState();
    const id = uuidv4();
    var formData = new FormData();
    if (!isBlob) {
        formData.append('file', selectedFile);
    } else {
        formData.append('file', selectedFile, `recording-${Date.now()}.WebM`);
    }

    if (isRecording) formData.append('type', FileTypes.RECORDING);
    else formData.append('type', FileTypes.OTHER);

    const msgToSend: Message<Object> = {
        id,
        body: 'Uploading file in progress ...',
        from: user.id,
        to: chatId,
        timeStamp: new Date(),
        type: 'MESSAGE',
        replies: [],
        subject: null,
    };

    addMessage(chatId, msgToSend);

    try {
        await axios.post(`${config.baseUrl}api/files/${chatId}/${id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        console.log('File uploaded.');
    } catch (e) {
        let errorBody = '';
        if (e.message == 'Request failed with status code 413') {
            errorBody = 'ERROR: File exceeds 100MB limit!';
        } else {
            errorBody = 'ERROR: File failed to send!';
        }

        const failedMsg = {
            ...msgToSend,
            body: errorBody,
            type: 'STRING',
        };
        addMessage(chatId, failedMsg);
    }
};

const setLastMessage = (chatId: string, message: Message<String>) => {
    if (!state.chats) return;
    const chat = state.chats.find(c => c.chatId == chatId);
    if (!chat) return;

    sortChats();
};

const sortChats = () => {
    const blockList = blocklist.value;
    state.chats.sort((a, b) => {
        const aIsBlocked = blockList.includes(a.chatId);
        const bIsBlocked = blockList.includes(b.chatId);
        if (aIsBlocked && !bIsBlocked) return 1;

        if (!aIsBlocked && bIsBlocked) return -1;

        var adate = a.messages[a.messages.length - 1]
            ? a.messages[a.messages.length - 1].timeStamp
            : new Date(-8640000000000000);
        var bdate = b.messages[b.messages.length - 1]
            ? b.messages[b.messages.length - 1].timeStamp
            : new Date(-8640000000000000);
        return moment(bdate).unix() - moment(adate).unix();
    });
};

const readMessage = (chatId, messageId) => {
    const { user } = useAuthState();

    const newMessage: Message<string> = {
        id: uuidv4(),
        from: user.id,
        to: chatId,
        body: messageId,
        timeStamp: new Date(),
        type: 'READ',
        replies: [],
        subject: null,
    };
    sendMessageObject(chatId, newMessage);
};

const updateContactsInGroup = async (groupId, contact: Contact, remove: boolean) => {
    const { user } = useAuthState();
    const myLocation = await requestMyYggdrasilAddress();
    const message: Message<GroupManagementBody> = {
        id: uuidv4(),
        from: user.id,
        to: groupId,
        body: {
            type: remove ? SystemMessageTypes.REMOVE_USER : SystemMessageTypes.ADD_USER,
            message: `${contact.id} has been ${remove ? 'removed from' : 'added to'} the group`,
            adminLocation: myLocation,
            contact,
        },
        timeStamp: new Date(),
        type: MessageTypes.SYSTEM,
        replies: [],
        subject: null,
    };

    sendMessageObject(groupId, message);
};

export const usechatsState = () => {
    return {
        ...toRefs(state),
    };
};

export const draftMessage = (chatId, message: Message<MessageBodyType>) => {
    getChat(chatId).draft = message;
    sendDraftMessage(message)
}

export const usechatsActions = () => {
    return {
        addChat,
        sendRetrieveChats,
        sendMessage,
        sendFetchMessages,
        addMessage,
        sendFile,
        sendMessageObject,
        sendAddGroupChat,
        readMessage,
        sendAcceptChat,
        removeChat,
        updateContactsInGroup,
        updateChat,
        getNewMessages,
        getChatInfo,
        draftMessage,
    };
};

interface ChatInfo {
    [chatId: string]: {
        hasMoreMessages: boolean;
        isLoading: boolean;
    };
}

interface ChatState {
    chats: Chat[];
    chatRequests: Chat[];
    chatInfo: ChatInfo;
}

export const handleRead = (message: Message<string>) => {
    const { user } = useAuthState();

    let chatId = message.to === user.id ? message.from : message.to;

    const { chats } = usechatsState();
    const chat = chats.value.find(c => c.chatId == chatId);

    const newRead = getMessage(chat, message.body);
    const oldRead = getMessage(chat, <string>message.from);

    if (oldRead && new Date(newRead.timeStamp).getTime() < new Date(oldRead.timeStamp).getTime()) {
        return;
    }

    chat.read[<string>message.from] = message.body;
}