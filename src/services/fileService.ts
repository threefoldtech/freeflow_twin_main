import axios, { AxiosRequestConfig } from 'axios';
import config from '@/config';

const endpoint = `${config.baseUrl}/api/v1/files`;

// Used to upload files in the backend in tmp folder and returns uuid of the file.
// This uuid can be used with sockets to perform actions on the file and save it on the correct place.
// All unused files in tmp will be deleted after a while.
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
