import { ref } from 'vue';

export const blocklist = ref([]);

export const addUserToBlockList = (userId: string) => {
    blocklist.value.push(userId);
};

export const userIsBlocked = (userId: string) => blocklist.value.includes(userId);
