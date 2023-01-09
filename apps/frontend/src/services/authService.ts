import axios from 'axios';
import config from '@/config';

export const login = () => {
    const loginUrl = `/api/v2/auth/signIn`;
    window.location.href = loginUrl + '?username=' + window.location.host.split('.')[0];
};

export const doLogout = async () => {
    const { data } = await axios.post(`${config.baseUrl}/api/v2/auth/signOut`);
    if (!data.success) return;
    window.location.href = `https://${config.getAppId()}`;
};
