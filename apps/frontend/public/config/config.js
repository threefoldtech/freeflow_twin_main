// const config = {
//     appBackend:
//         process.env.NODE_ENV !== 'production' ? 'https://login.staging.jimber.io/' : 'https://login.threefold.me/',
//     documentServerLocation:
//         process.env.NODE_ENV !== 'production'
//             ? 'https://documentserver.digitaltwin-test.jimbertesting.be/'
//             : 'https://documentserver.digitaltwin.jimbertesting.be/',
//     giphyApiKey: 'uk3XRSO0vYrPDEQKDPZJ2wGz33qzIxST',
//     beta: true,
// };
import config from '/config/config.json' assert { type: 'json' };

config.baseUrl = `${window.location.origin}/`;

window.config = config;
