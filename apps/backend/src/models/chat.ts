import { ChatInterface, DtIdInterface, MessageBodyTypeInterface } from '../types';
import Contact from './contact';
import Message from './message';

export default class Chat implements ChatInterface {
    chatId: string;
    contacts: Contact[];
    isGroup: boolean;
    messages: Message<MessageBodyTypeInterface>[];
    name: string;
    acceptedChat: boolean;
    adminId: DtIdInterface;
    read: { [key: string]: string } = {};
    draft?: Message<MessageBodyTypeInterface>;
    createdAt: Date;

    constructor(
        chatId: string,
        contacts: Contact[],
        isGroup: boolean,
        messages: Message<MessageBodyTypeInterface>[],
        name: string,
        acceptedChat: boolean,
        adminId: DtIdInterface,
        read: { [key: string]: string } = {},
        draft?: Message<MessageBodyTypeInterface>
    ) {
        this.chatId = chatId;
        this.contacts = contacts;
        this.isGroup = isGroup;
        this.messages = messages;
        this.name = name;
        this.acceptedChat = acceptedChat;
        this.adminId = adminId;
        this.read = read;
        this.draft = draft;
        this.createdAt = new Date();
    }

    addMessage(message: Message<MessageBodyTypeInterface>) {
        this.messages.push(message);
    }
}
