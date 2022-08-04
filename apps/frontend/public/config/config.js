import config from '/config/config-def.js';

// const config = {
//     appBackend: 'https://login.threefold.me/',
//     documentServerLocation: 'https://documentserver.digitaltwin.jimbertesting.be/',
//     giphyApiKey: 'uk3XRSO0vYrPDEQKDPZJ2wGz33qzIxST',
//     beta: true,
// };

config.baseUrl = `${window.location.origin}/`;

window.config = config;
