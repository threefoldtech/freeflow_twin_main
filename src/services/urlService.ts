export const calculateBaseUrl = (userId: string) => {
    let location = '';
    if (window.location.origin === 'http://localhost:8080') {
        return (location = 'http://localhost:3000');
    }
    let url: Array<String> = window.location.host.split('.');
    url.splice(0, 1);
    return (location = `https://${userId}.${url.join('.')}`);
};

export const calcExternalResourceLink = (location: string) => {
    return `${window.location.origin}/api/v1/getExternalResource?resource=${location}`;
};
