import axios from 'axios';
import config from '@/config';
import { Contact } from '@/types';
import { useContactsState } from '@/store/contactStore';
import { useAuthState } from '@/store/authStore';
import { ref } from 'vue';

export const setNewAvatar = async (selectedFile): Promise<{ id: string; filename: string; url: string }> => {
    var formData = new FormData();
    formData.append('file', selectedFile);
    const url = `${config.baseUrl}api/v2/user/avatar`;
    try {
        const result = await axios.post(url, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return result.data;
    } catch (e) {
        console.log(e);
    }
};

export const isUserAuthenticated = async () => {
    const url = `${config.baseUrl}api/v2/auth/authenticated`;
    try {
        const result = await axios.get(url);
        return result.data;
    } catch (e) {
        console.log(e);
    }
};

export const allUsers = ref<Contact[]>([]);

export const loadAllUsers = async (users: Contact[]) => {
    const { contacts } = useContactsState();
    const { user } = useAuthState();

    const contactsCopy = [...contacts, user];
    allUsers.value = users.filter(u => !contactsCopy.some(c => c.id === u.id));
};
