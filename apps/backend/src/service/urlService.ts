// const ipv4Regex = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])(:[0-9]+)?$/
// const isIpv4 = ipv4Regex.test(location);
// location = isIpv4 ? location : `[${location}]`;

export const getFullIPv6ApiLocation = (location: string, apiEndPoint: string) => {
    return `http://[${location}]/api${apiEndPoint}`;
};
