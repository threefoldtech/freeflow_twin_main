export const login = () => {
    const loginUrl = `/api/auth/signin`;
    window.location.href = loginUrl + "?username=" + window.location.host.split('.')[0]
};
