import axios from 'axios';
import config from '../../public/config/config';

export const setNewAvatar = async selectedFile => {
    var formData = new FormData();
    formData.append('file', selectedFile);
    const url = `${config.baseUrl}api/user/avatar`;
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
    return true;
    const url = `${config.baseUrl}api/auth/authenticated`;
    try {
        const result = await axios.get(url);
        return result.data;
    } catch (e) {
        console.log(e);
    }
};
