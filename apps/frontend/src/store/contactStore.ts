import axios from 'axios';
import { Contact, MessageTypes, SystemBody, SystemMessageTypes } from '../types';
import { Contact, GroupContact, MessageTypes, Roles, SystemBody, SystemMessageTypes } from '../types';
import config from '@/config';
import { uuidv4 } from '../../src/common/index';
import { useChatsState } from './chatStore';
import { useAuthState } from './authStore';
import { Message, DtId } from '../types/index';
import { reactive, toRefs } from 'vue';

const state = reactive<ContactState>({
    contacts: [],
});

const retrieveContacts = async () => {
    return axios.get(`${config.baseUrl}api/v2/contacts`).then(function (response) {
        const contacts = response.data;
        state.contacts = contacts;
    });
};

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

const addContact = (username: DtId, location: string, _dontCheck = false) => {
    const { user } = useAuthState();
    const addMessage: Message<SystemBody> = {
        id: uuidv4(),
        chatId: String(username),
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
    axios.post(`${config.baseUrl}api/v2/contacts`, {
        id: username,
        location,
        message: addMessage,
    });
};

export const useContactsState = () => {
    return {
        ...toRefs(state),
        contacts: calculateContacts(),
        groupContacts: calculateContacts().map((c: Contact) => {
            const contact: GroupContact = {
                ...c,
                roles: [Roles.USER],
            };
            return contact;
        }),
        // ...toRefs(state),
    };
};

export const useContactsActions = () => {
    return {
        retrieveContacts,
        // setLastMessage,
        addContact,
    };
};

interface ContactState {
    contacts: Contact[];
}
