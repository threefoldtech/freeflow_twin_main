import { ref } from 'vue';
import axios from 'axios';
import config from '@/config';

export const blocklist = ref([]);

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
