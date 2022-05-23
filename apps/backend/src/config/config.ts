const userid = process.env.USER_ID || 'patatje3';

const appId = process.env.DIGITALTWIN_APPID || 'digitaltwin.jimbertesting.be';
const environment = process.env.ENVIRONMENT || 'production';

export const config = {
    port: parseInt(process.env.PORT, 10) || 3000,
    node_env: process.env.NODE_ENV || 'development',
    appBackend: environment === 'production' ? 'https://login.threefold.me' : 'https://login.staging.jimber.io',
    kycBackend: environment === 'production' ? 'https://openkyc.live' : 'http://openkyc.staging.jimber.org',
    appId: `${userid}.${appId}`,
    seedPhrase:
        'calm science teach foil burst until next mango hole sponsor fold bottom cousin push focus track truly tornado turtle over tornado teach large fiscal',
    baseDir: process.env.BASEDIR || '/appdata/',
    userid,
    storage: '/storage/',
    yggdrasil: {
        peers: [
            'tcp://45.138.172.192:5001',
            'tcp://140.238.168.104:17117',
            'tls://140.238.168.104:17121',
            'tcp://[2a04:5b81:2010::90]:2000',
            'tls://[2607:5300:201:3100::50a1]:58226',
            'tls://[2a09:8280:1::a:2e2]:10020',
            'tcp://[2a09:8280:1::a:2e2]:10010',
            'tcp://45.231.133.188:58301',
            'tcp://213.188.197.95:10010',
            'tls://213.188.197.95:10020',
        ],
    },
    sessionSecret: process.env.SESSION_SECRET || 'secret',
};
