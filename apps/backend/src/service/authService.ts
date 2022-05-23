import { generateRandomString, ThreefoldLogin } from '@threefoldjimber/threefold_login';
import { Request } from 'express';

import { config } from '../config/config';
import { updatePrivateKey, updatePublicKey } from '../store/keyStore';
import { getKeyPair } from './encryptionService';
import { getMyLocation, registerDigitaltwin } from './locationService';
import { isInitialized as yggdrasilIsInitialized, setupYggdrasil } from './yggdrasilService';

export const getAppLoginUrl = async (request: Request, redirectUrl: string): Promise<string> => {
    const login = new ThreefoldLogin(
        config.appBackend,
        config.appId,
        config.seedPhrase,
        redirectUrl,
        config.kycBackend
    );
    await login.init();
    const loginState = generateRandomString();
    request.session.state = loginState;
    return login.generateLoginUrl(loginState, {
        scope: '{"email":true,"derivedSeed":true,"digitalTwin":true}',
    });
};
export const appCallback = async (request: Request): Promise<string> => {
    console.log('Going to login now ...');

    const login = new ThreefoldLogin(
        config.appBackend,
        config.appId,
        config.seedPhrase,
        '', // No callback needed
        config.kycBackend
    );
    await login.init();
    const redirectUrl = new URL(request.protocol + '://' + request.get('host') + request.originalUrl);
    console.log(request.session);
    console.log(request.session.state);
    // @ts-ignore
    const profileData = (await login.parseAndValidateRedirectUrl(redirectUrl, request.session.state))?.profile;

    delete request.session.state;

    const doubleName: string = <string>profileData.doubleName;
    const derivedSeed: string = <string>profileData.derivedSeed;
    const userId = doubleName.replace('.3bot', '');

    if (userId !== config.userid || !derivedSeed) return '/unauthorized';

    const keyPair = getKeyPair(derivedSeed);
    if (!keyPair) return '/unauthorized';
    console.log(keyPair.secretKey);
    try {
        updatePublicKey(keyPair.publicKey);
        updatePrivateKey(keyPair.secretKey);
    } catch (ex) {
        console.error(ex);
        return '/unauthorized';
    }

    if (!yggdrasilIsInitialized) {
        await setupYggdrasil(derivedSeed);
    }
    const yggdrasilAddress = await getMyLocation();
    try {
        await registerDigitaltwin(doubleName, derivedSeed, yggdrasilAddress);
    } catch (error) {
        console.error(error);
    }

    request.session.userId = userId;
    return '/callback';
};
