import axios from 'axios';
import config from '@/config';

export const login = () => {
    const loginUrl = `/api/v1/auth/signin`;
    window.location.href = loginUrl + '?username=' + window.location.host.split('.')[0];
};

export const doLogout = async () => {
    const res = (await axios.get(`${config.baseUrl}/api/v1/auth/signout`)).data;
    if (!res) return;
    window.location.href = `https://${config.getAppId()}`;
};
