import { config } from '../config/config';
import Chat from '../models/chat';
import Contact from '../models/contact';
import { DtIdInterface, IdInterface, MessageBodyTypeInterface, MessageInterface } from '../types';
import { getChatfromAdmin } from './apiService';
import { getChat, getChatIds, persistChat } from './dataService';
import { parseMessages } from './messageService';
import { sendEventToConnectedSockets } from './socketService';

export const persistMessage = (chatId: IdInterface, message: MessageInterface<MessageBodyTypeInterface>) => {
    const chat = getChat(chatId);
    if (!message.subject) {
        chat.messages.push(message);
        persistChat(chat);
        sendEventToConnectedSockets('message', message);
        return;
    }

    const subjectMessageIndex = chat.messages.findIndex(m => m.id === message.subject);
    const subjectMessage = chat.messages[subjectMessageIndex];
    subjectMessage.replies = [...subjectMessage.replies, message];
    chat.messages[subjectMessageIndex] = subjectMessage;

    // logger.info(subjectMessage)
    persistChat(chat);
    sendEventToConnectedSockets('message', chat.messages[subjectMessageIndex]);
};

export const addChat = (
    chatId: IdInterface,
    contacts: Contact[],
    isGroupchat: boolean,
    message: MessageInterface<MessageBodyTypeInterface>[],
    name: string,
    acceptedChat: boolean,
    adminId: DtIdInterface
) => {
    const chat = new Chat(chatId as string, contacts, isGroupchat, message, name, acceptedChat, adminId, {});
    // @TODO clean this up
    if (chat.chatId == config.userid) {
        return null;
    }
    persistChat(chat);
    sendEventToConnectedSockets('new_chat', chat);
    return chat;
};

export const syncNewChatWithAdmin = async (adminLocation: string, chatId: string) => {
    const chat = await getChatfromAdmin(adminLocation, chatId);
    sendEventToConnectedSockets('new_chat', chat);
    persistChat(chat);
};

export const getMessagesFromId = (chatId: IdInterface) => true;

export const setChatToAccepted = (chatId: IdInterface) => true;

//@TODO filter for acceptedchatss
export const getAcceptedChatsWithPartialMessages = (messageAmount = 0) => {
    return getChatIds().map(chatid => getChat(chatid, messageAmount));
    // .filter((chat) => chat.acceptedChat);
};

// @TODO will need to use this later
export const getChatRequests = () => {
    return getChatIds()
        .map(chatid => getChat(chatid))
        .filter(chat => !chat.acceptedChat);
};

export const getChatById = (id: IdInterface) => {
    return getChat(id);
};

export const parseFullChat = (chat: Chat) => parseChat(chat, parseMessages(chat.messages));
export const parsePartialChat = (chat: Chat, amount: number) => {
    const start = chat.messages.length - amount;
    const messages = chat.messages.slice(start < 0 ? 0 : start, chat.messages.length);
    return parseChat(chat, parseMessages(messages));
};

export const parseChat = (chat: Chat, messages: Array<MessageInterface<MessageBodyTypeInterface>>) => {
    return new Chat(
        chat.chatId,
        chat.contacts,
        chat.isGroup,
        messages,
        chat.name,
        chat.acceptedChat,
        chat.adminId,
        chat.read,
        chat.draft
    );
};
