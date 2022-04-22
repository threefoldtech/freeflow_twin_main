export const login = () => {
    const loginUrl = `/api/v1/auth/signin`;
    window.location.href = loginUrl + '?username=' + window.location.host.split('.')[0];
};
