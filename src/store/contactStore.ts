import { reactive } from '@vue/reactivity';
import { toRefs } from 'vue';
import axios from 'axios';
import moment from 'moment';
import { Contact, MessageTypes, SystemBody, SystemMessageTypes } from '../types';
import config from '../../public/config/config';
import { uuidv4 } from '../../src/common/index';
import { Chat } from '../types';
import { usechatsActions, usechatsState } from './chatStore';
import { useAuthState } from './authStore';
import { Message, PersonChat, DtId } from '../types/index';

// const state = reactive<State>({
//     contacts:[]
// });

// const retrieveContacts = async () => {
//     return axios.get(`${config.baseUrl}api/contacts`).then(function(response) {
//         const contacts = response.data
//         console.log(`here are the contacts`, contacts)

//         state.contacts = contacts;
//     })

// }

// const contactIsHealthy = (location) => {
//     let isAvailable = false
//     axios.get(`https://${location}.digitaltwin.jimbertesting.be/api/healthcheck`).then( (res) => {
//         console.log(res)
//         isAvailable = true
//     }).catch( res => {
//         isAvailable = false
//     })
//     return isAvailable
// }

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
    axios
        .post(`${config.baseUrl}api/contacts`, {
            id: username,
            location,
            message: addMessage,
        })
        .then(res => {});
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

// interface State {
//     contacts: Contact[]
// }
