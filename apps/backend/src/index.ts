import './utils/extensions';

import { httpLogger } from './logger';
import errorMiddleware from './middlewares/errorHandlingMiddleware';
import routes from './routes';
import { getKeyPair } from './service/encryptionService';
import { startSocketIo } from './service/socketService';
import { initYggdrasil, isInitialized as yggdrasilIsInitialized, setupYggdrasil } from './service/yggdrasilService';
import { initKeys, updatePrivateKey, updatePublicKey } from './store/keyStore';
import { initTokens } from './store/tokenStore';
import { initUserData } from './store/user';

const initAll = () => {
    initKeys();
    initUserData();
    initTokens();
    initYggdrasil();
};

export {
    errorMiddleware,
    getKeyPair,
    httpLogger,
    initAll,
    routes,
    setupYggdrasil,
    startSocketIo,
    updatePrivateKey,
    updatePublicKey,
    yggdrasilIsInitialized,
};
