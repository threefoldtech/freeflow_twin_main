import axios from 'axios';
import config from '@/config';

export const getOwnLocation = async () => {
    const { data } = await axios.get(`${config.baseUrl}/api/v2/user/location`, {
        timeout: 4000,
    });
    return data;
};
