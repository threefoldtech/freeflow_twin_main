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
import { useSocketActions } from './socketStore';
import { useAuthState } from './authStore';
import config from '@/config';
import { uuidv4 } from '@/common';
import { startFetchStatusLoop } from '@/store/statusStore';
import { uniqBy } from 'lodash';
import { useScrollActions } from './scrollStore';
import { blocklist } from '@/store/blockStore';
import { FileAction } from 'custom-types/file-actions.type';

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

const retrieveChats = async () => {
    const params = new URLSearchParams();
    params.append('limit', messageLimit.toString());
    isLoading.value = true;
    await axios.get(`${config.baseUrl}api/v2/chats`, { params: params }).then(response => {
        const incomingchats = response.data;

        // debugger
        incomingchats.forEach((chat: Chat) => {
            addChat(chat);
        });
        sortChats();
        isLoading.value = false;
    });
};

export const editMessage = (chatId: string, message: any) => {
    clearMessageAction(chatId);
    //nextTick is needed because vue throws dom errors if you switch between Reply and Edit
    nextTick(() => {
        setMessageAction(chatId, message, MessageAction.EDIT);
    });
};

export const replyMessage = (chatId: string, message: any) => {
    clearMessageAction(chatId);
    //nextTick is needed because vue throws dom errors if you switch between Reply and Edit
    nextTick(() => {
        setMessageAction(chatId, message, MessageAction.REPLY);
    });
};

const getChat = (chatId: string) => state.chats.find(x => x.chatId === chatId);
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

export const removeChat = (chatId: string) => {
    state.chats = state.chats.filter(c => c.chatId !== chatId);
    state.chatRequests = state.chatRequests.filter(c => c.chatId !== chatId);
    sortChats();
    selectedId.value = <string>state.chats.find(() => true)?.chatId;
};

const addGroupchat = (name: string, contacts: Contact[]) => {
    const { user } = useAuthState();

    const contactInGroup = contacts
        .map(contact => {
            if (user.id !== contact.id) return contact.id;
        })
        .filter(x => {
            return x !== undefined;
        });

    const chatId = uuidv4();
    const newGroupchat: GroupChat = {
        isGroup: true,
        chatId,
        contacts: contacts,
        messages: [
            {
                chatId,
                from: user.id,
                to: name,
                body: {
                    message: `Group created by ${user.id} with the following initial member: ${contactInGroup.join(
                        ', '
                    )}`,
                } as SystemBody,
                timeStamp: new Date(),
                id: uuidv4(),
                type: MessageTypes.SYSTEM,
                replies: [],
                subject: null,
            },
        ],
        name: name,
        adminId: user.id.toString(),
        read: null,
        acceptedChat: true,
        draft: null,
    };
    axios
        .post(`${config.baseUrl}api/v2/chats/group`, newGroupchat)
        .then(res => {
            console.log(res);
        })
        .catch(e => {
            console.log('failed to add groupchat', e);
        });
};

const acceptChat = (id: string) => {
    axios
        .post(`${config.baseUrl}api/v2/chats?id=${id}`)
        .then(() => {
            const index = state.chatRequests.findIndex(c => c.chatId == id);
            state.chatRequests[index].acceptedChat = true;
            addChat(state.chatRequests[index]);
            const { user } = useAuthState();
            sendSystemMessage(id, `${user.id} accepted invitation`);
            state.chatRequests.splice(index, 1);
        })
        .catch(error => {
            console.log('Got an error: ', error);
        });
};

const updateChat = (chat: Chat) => {
    removeChat(chat.chatId);
    addChat(chat);
};

function getMessage(chat: Chat, id: string) {
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

const fetchMessages = async (
    chatId: string,
    limit: number,
    lastMessageId: string | undefined
): Promise<GetMessagesResponse | undefined> => {
    const params = new URLSearchParams();
    if (lastMessageId) params.append('fromId', lastMessageId);
    params.append('limit', limit.toString());

    const response = await axios.get<GetMessagesResponse>(`${config.baseUrl}api/v1/messages/${chatId}`, {
        params: params,
    });

    if (200 > response.status && response.status >= 300) {
        console.error(response.statusText + ': failed fetching more messages');
        return;
    }

    return response.data;
};

const getNewMessages = async (chatId: string) => {
    const info = getChatInfo(chatId);
    if (!info || info.isLoading || !info.hasMoreMessages) return;

    try {
        setChatMessagesAreLoading(chatId, true);

        const chat = getChat(chatId);
        if (!chat) return;

        const response = await fetchMessages(<string>chat.chatId, messageLimit, <string>chat.messages[0]?.id);
        setChatHasMoreMessages(<string>chat.chatId, response.hasMore);
        appendMessages(chat, response.messages);
        return response.messages.length > 0;
    } catch (ex) {
        return false;
    } finally {
        setChatMessagesAreLoading(chatId, false);
    }
};

const addMessage = (chatId: string, message: any) => {
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

const sendMessage = (chatId: string, message: any, type: string = 'STRING') => {
    const { sendSocketMessage } = useSocketActions();
    const { user } = useAuthState();

    const msg: Message<String> = {
        chatId,
        id: uuidv4(),
        body: message,
        from: user.id,
        to: chatId,
        timeStamp: new Date(),
        type,
        replies: [],
        subject: null,
    };
    addMessage(chatId, msg);
    sendSocketMessage(chatId, msg);
};

const sendSystemMessage = (chatId: string, message: string) => {
    sendMessage(chatId, { message: message } as SystemBody, MessageTypes.SYSTEM);
};

export const sendMessageObject = (chatId: string, message: Message<MessageBodyType>) => {
    const { sendSocketMessage } = useSocketActions();
    // console.log(chatId, message);
    // @TODO when doing add message on SYSTEM/groupupdate results in  max call stack exeeded
    if (message.type !== 'SYSTEM') {
        addMessage(chatId, message);
    }
    const isEdit = message.type === 'EDIT' || message.type === 'DELETE';
    sendSocketMessage(chatId, message, isEdit);
};

export const imageUpload = ref([]);
export const imageUploadQueue = ref([]);

const sendFile = async (chatId: string, selectedFile: any, isBlob = false, isRecording = false) => {
    const { sendHandleUploadedFile } = useSocketActions();
    if (selectedFile.size > 20000000) return false;
    let formData = new FormData();
    if (!isBlob) {
        formData.append('file', selectedFile);
    } else {
        formData.append('file', selectedFile, `recording-${Date.now()}.WebM`);
    }

    if (isRecording) formData.append('type', FileTypes.RECORDING);
    else formData.append('type', FileTypes.OTHER);

    const arr = new Uint8Array(await selectedFile.arrayBuffer());
    const blob = new Blob([arr], { type: 'image/png' });
    const uuid = uuidv4();
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();

    try {
        imageUploadQueue.value.push({
            id: uuid,
            cancelToken: source,
            error: false,
            retry: false,
            error_message: '',
            type: selectedFile.type,
            isImage: selectedFile.type.includes('image'),
            title: selectedFile.name,
            data: window.URL.createObjectURL(blob),
            time: new Date(),
            loaded: 0,
            total: selectedFile.total,
            chatId: chatId,
            selectedFile: selectedFile,
        });

        const { data } = await axios.post(`${config.baseUrl}api/v2/files/upload`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            cancelToken: source.token,
            onUploadProgress: ({ loaded: progress, total }) => {
                const i = imageUploadQueue.value.findIndex(el => el.id === uuid);
                imageUploadQueue.value.splice(i, 1, {
                    ...imageUploadQueue.value[i],
                    loaded: progress,
                    total: total,
                });
            },
        });
        if (!data.id) return false;
        sendHandleUploadedFile({
            fileId: String(data.id),
            payload: { chatId, messageId: uuid, type: formData.get('type').toString(), filename: data.filename },
            action: FileAction.ADD_TO_CHAT,
        });
        return true;
    } catch (e) {
        catchErrorsSendFile(e, uuid);
    }
};

const catchErrorsSendFile = (e: { message: string }, uuid: string) => {
    const i = imageUploadQueue.value.findIndex(el => el.id === uuid);
    if (e.message === 'Operation canceled by the user.') return;

    if (e.message == 'Request failed with status code 413') {
        //!TODO Upload limit

        //errorBody = 'ERROR: File exceeds 20MB limit!';
        imageUploadQueue.value.splice(i, 1, {
            ...imageUploadQueue.value[i],
            error_message: 'File exceeds 20MB limit!',
            error: true,
        });
        return;
    }
    //errorBody = 'ERROR: File failed to send!';
    imageUploadQueue.value.splice(i, 1, {
        ...imageUploadQueue.value[i],
        error_message: 'File failed to send.',
        error: true,
        retry: true,
    });
};

export const retrySendFile = async (file: { id: string; uuid: string; chatId: string; selectedFile: File }) => {
    //When a upload fails in chat and you retry

    const { id: uuid, chatId, selectedFile } = file;

    let formData = new FormData();

    formData.append('file', selectedFile);

    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();

    try {
        const i = imageUploadQueue.value.findIndex(el => el.id === uuid);
        imageUploadQueue.value.splice(i, 1, {
            ...imageUploadQueue.value[i],
            error_message: '',
            loaded: 0,
            retry: false,
            error: false,
            cancelToken: source,
        });

        await axios.post(`${config.baseUrl}api/v1/files/${chatId}/${uuid}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            cancelToken: source.token,
            onUploadProgress: ({ loaded: progress, total }) => {
                const i = imageUploadQueue.value.findIndex(el => el.id === uuid);
                imageUploadQueue.value.splice(i, 1, {
                    ...imageUploadQueue.value[i],
                    loaded: progress,
                    total: total,
                    retry: false,
                    error: false,
                    error_message: '',
                });
            },
        });
    } catch (e) {
        catchErrorsSendFile(e, uuid);
    }
};

const setLastMessage = (chatId: string, _message: Message<String>) => {
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

const readMessage = (chatId: string, messageId: string) => {
    const { user } = useAuthState();

    const newMessage: Message<string> = {
        chatId,
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

const updateContactsInGroup = async (
    groupId: string,
    contact: Contact,
    type: SystemMessageTypes,
    nextAdmin?: string
) => {
    const { user } = useAuthState();
    const chat = getChat(groupId);
    const admin = chat.contacts.find(c => c.id === chat.adminId);
    if (!('location' in admin)) return;
    const adminLocation = admin.location;

    let msg = `${contact.id} has been removed from the group`;
    if (type === SystemMessageTypes.ADD_USER) msg = `${contact.id} has been added to the group`;
    if (type === SystemMessageTypes.USER_LEFT_GROUP) msg = `${contact.id} has left the group`;

    const message: Message<GroupManagementBody> = {
        chatId: groupId,
        id: uuidv4(),
        from: user.id,
        to: groupId,
        body: {
            type,
            message: msg,
            adminLocation,
            contact,
            nextAdmin,
        },
        timeStamp: new Date(),
        type: MessageTypes.SYSTEM,
        replies: [],
        subject: null,
    };

    sendMessageObject(groupId, message);
};

export const useChatsState = () => {
    return {
        ...toRefs(state),
    };
};

export const draftMessage = (chatId: string, message: any) => {
    getChat(chatId).draft = message;
    // axios.post(`${config.baseUrl}api/v1/updateDraft`, {
    //     params: {
    //         draftMessage: message,
    //     },
    // });
};

export const usechatsActions = () => {
    return {
        addChat,
        retrieveChats,
        sendMessage,
        addMessage,
        sendFile,
        sendMessageObject,
        addGroupchat,
        readMessage,
        acceptChat,
        removeChat,
        updateContactsInGroup,
        updateChat,
        getNewMessages,
        getChatInfo,
        getChat,
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

    const { chats } = useChatsState();
    const chat = chats.value.find(c => c.chatId == chatId);

    const newRead = getMessage(chat, message.body);
    const oldRead = getMessage(chat, <string>message.from);

    if (oldRead && new Date(newRead.timeStamp).getTime() < new Date(oldRead.timeStamp).getTime()) {
        return;
    }

    chat.read[<string>message.from] = message.body;
};