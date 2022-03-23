export const calculateBaseUrl = userId => {
    let location = '';
    if (window.location.origin === 'http://localhost:8080') {
        return (location = 'http://localhost:3000');
    }
    let url: Array<String> = window.location.host.split('.');
    url.splice(0, 1);
    return (location = `https://${userId}.${url.join('.')}`);
};

export const calcExternalResourceLink = location => {
    return `${window.location.origin}/getExternalResource?resource=${location}`;
};
