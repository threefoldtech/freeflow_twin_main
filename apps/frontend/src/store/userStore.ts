import axios from 'axios';
import config from '@/config';

export const setNewAvatar = async (selectedFile): Promise<{ id: string; filename: string; url: string }> => {
    const formData = new FormData();
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
