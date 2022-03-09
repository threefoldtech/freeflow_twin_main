export const login = () => {
    const loginUrl = `/nest/auth/signin`;
    window.location.href = loginUrl + '?username=' + window.location.host.split('.')[0];
};
