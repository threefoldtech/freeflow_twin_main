import { ref } from 'vue';
import axios from 'axios';
import config from '@/config';
import { calcExternalResourceLink } from '@/services/urlService';
import { GroupContact } from '@/types';

export const blocklist = ref<string[]>([]);

export const initBlocklist = async () => {
    try {
        const axiosResponse = await axios.get(`${config.baseUrl}api/v2/blocked`);
        blocklist.value = axiosResponse.data;
    } catch (e) {
        console.log('could not get blocklist');
    }
};

export const addUserToBlockList = (userId: string) => {
    blocklist.value.push(userId);
};

export const removeUserFromBlockList = (userId: string) => {
    blocklist.value = blocklist.value.filter(id => id !== userId);
};

export const userIsBlocked = (userId: string) => blocklist.value.includes(userId);

export const isCurrentUserBlocked = async (location: string, userId: string): Promise<boolean> => {
    const url = `http://[${location}]/api/v2/blocked/${userId}`;
    return (await axios.get(calcExternalResourceLink(url))).data;
};

export const getUnblockedContacts = async (contacts: GroupContact[], userId: string) => {
    for (let con of contacts) {
        const blocked = await isCurrentUserBlocked(con.location, userId);
        if (blocked) contacts = contacts.filter(c => c.id !== con.id);
    }
    return contacts;
};
