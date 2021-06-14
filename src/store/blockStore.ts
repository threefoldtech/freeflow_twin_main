import axios from 'axios';
import config from '../../public/config/config';
import { ref } from 'vue';

export const blocklist = ref([]);

export const initBlocklist = async () => {
    try {
        const axiosResponse = await axios.get(`${config.baseUrl}api/blocked/`);
        blocklist.value = axiosResponse.data;
    } catch (e) {
        console.log('could not get blocklist');
    }
};

export const addUserToBlockList = userid => {
    blocklist.value.push(userid);
};

export const isBlocked = (userId: string) => blocklist.value.includes(userId);

export const deleteBlockedEntry = async user => {
    await axios.delete(`${config.baseUrl}api/blocked/${user}/`);
    blocklist.value = blocklist.value.filter(x => x !== user);
};
