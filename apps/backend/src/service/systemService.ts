import axios from 'axios';

import { config } from '../config/config';
import Chat from '../models/chat';
import Contact from '../models/contact';
import Message from '../models/message';
import { GroupUpdateType, SystemMessageType } from '../types';
import { sendMessageToApi } from './apiService';
import { persistMessage } from './chatService';
import { deleteChat, persistChat } from './dataService';
import { sendEventToConnectedSockets } from './socketService';
import { getFullIPv6ApiLocation } from './urlService';

export const handleSystemMessage = (message: Message<GroupUpdateType>, chat: Chat) => {
    if (
        [SystemMessageType.ADDUSER, SystemMessageType.REMOVEUSER].includes(message.body.type) &&
        chat.adminId !== message.from
    ) {
        throw Error('not allowed');
    }

    switch (message.body.type) {
        case SystemMessageType.ADDUSER: {
            const path = getFullIPv6ApiLocation(message.body.contact.location, '/v1/group/invite');
            chat.contacts.push(message.body.contact);
            chat.messages.push(message);
            //@todo send message request to invited 3 bot
            try {
                axios
                    .put(path, chat)
                    .then(() => {
                        sendEventToConnectedSockets('chat_updated', chat);
                        sendMessageToApi(message.body.contact.location, message);
                    })
                    .catch(() => {
                        console.log('failed to send group request');
                    });
            } catch (e) {
                console.log('failed to send group request');
            }

            break;
        }
        case SystemMessageType.USER_LEFT_GROUP: {
            const contact = message.body.contact.id;
            if (contact === chat.adminId && chat.contacts.length > 1) {
                let newAdmin = chat.contacts.find(c => c.id === message.body.nextAdmin);
                if (!newAdmin) newAdmin = chat.contacts.filter(c => c.id !== contact)[0];
                chat.adminId = newAdmin.id;
            }
            if (contact === config.userid) {
                deleteChat(chat.chatId);
                sendEventToConnectedSockets('chat_removed', chat.chatId);
                return;
            }
            chat.contacts = chat.contacts.filter(c => c.id !== contact);
            chat.messages.push(message);
            sendEventToConnectedSockets('chat_updated', chat);
            break;
        }
        case SystemMessageType.REMOVEUSER:
            if (message.body.contact.id === config.userid) {
                deleteChat(<string>chat.chatId);
                sendEventToConnectedSockets('chat_removed', chat.chatId);
                return;
            }
            chat.contacts = chat.contacts.filter(c => c.id !== message.body.contact.id);
            chat.messages.push(message);

            sendEventToConnectedSockets('chat_updated', chat);
            sendMessageToApi(message.body.contact.location, message);
            break;
        case SystemMessageType.JOINED_VIDEOROOM: {
            persistMessage(chat.chatId, message);
            return;
        }
        case SystemMessageType.CONTACT_REQUEST_SEND: {
            persistMessage(chat.chatId, message);
            return;
        }
        default:
            throw Error(`not implemented type: ${message.body.type}`);
    }

    persistChat(chat);
};
