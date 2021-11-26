import { reactive } from '@vue/reactivity';
import { toRefs } from 'vue';
import axios from 'axios';
import moment from 'moment';
import { Contact, MessageTypes, SystemBody, SystemMessageTypes } from '../types';
import config from '@/config';
import { uuidv4 } from '../../src/common/index';
import { Chat } from '../types';
import { usechatsActions, usechatsState } from './chatStore';
import { useAuthState } from './authStore';
import { Message, PersonChat, DtId } from '../types/index';
import { sendAddContact } from './socketStore';


const addContact = (username: DtId, location, dontCheck = false) => {
    const { user } = useAuthState();
    const addMessage: Message<SystemBody> = {
        id: uuidv4(),
        body: {
            type: SystemMessageTypes.CONTACT_REQUEST_SEND,
            message: `Request has been sent to ${username}`,
        },
        from: user.id,
        to: username,
        timeStamp: new Date(),
        type: MessageTypes.SYSTEM,
        replies: [],
        subject: null,
    };
    const chatname: String = username;
    sendAddContact(username, location, addMessage);
};

const calculateContacts = () => {
    const { chats } = usechatsState();
    const { user } = useAuthState();
    const contacts = chats.value
        .filter(chat => !chat.isGroup && chat.acceptedChat)
        .map(chat => chat.contacts.find(contact => contact.id !== user.id));
    return contacts;
};

export const useContactsState = () => {
    return {
        contacts: calculateContacts(),
        // ...toRefs(state),
    };
};

export const useContactsActions = () => {
    return {
        // retrieveContacts,
        // setLastMessage,
        addContact,
    };
};

