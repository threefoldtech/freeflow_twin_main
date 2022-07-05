import { config } from '../config/config';
import Chat from '../models/chat';
import Contact from '../models/contact';
import { getChat, getChatIds } from '../service/dataService';

//todo create propper contactArray

export const getContacts = () =>
    getChatIds()
        .map((chatId): Chat => getChat(chatId))
        .filter(chat => !chat.isGroup)
        .map(chat => {
            return chat.contacts.find(cont => cont.id !== config.userid);
        });
export const contacts: Array<Contact> = getContacts();
