import axios, { AxiosRequestConfig } from 'axios';
import config from '@/config';

const endpoint = `${config.baseUrl}/api/v1/files`;

export const uploadTempFile = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    let config: AxiosRequestConfig = {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    };
    return (await axios.post(`${endpoint}/upload`, formData, config)).data;
};
