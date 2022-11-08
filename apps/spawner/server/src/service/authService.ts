import { Request } from 'express';
import { config as productionConfig } from '../config/config';
import { config as stagingConfig } from '../config/config_staging';
import { ThreefoldLogin } from '@threefoldjimber/threefold_login';
import { generateRandomString } from '@threefoldjimber/threefold_login/dist';

export const getAppLoginUrl = async (request: Request, redirectUrl: string, name: string): Promise<string> => {
    const config = process.env.VUE_APP_ENVIRONMENT === 'production' ? productionConfig : stagingConfig;
    console.log('config: ');
    console.log(config);

    console.log('Redirect: ', redirectUrl);
    console.log('Name: ', name);

    const login = new ThreefoldLogin(
        config.appBackend,
        `${name}.${config.appId}`,
        config.seedPhrase,
        '/api/auth/callback',
        config.kycBackend
    );
    await login.init();
    const loginState = generateRandomString();
    console.log(request.session);
    request.session.state = loginState;
    console.log(request.session.state);
    return login.generateLoginUrl(loginState);
};
export const appCallback = async (request: Request): Promise<string> => {
    const config = process.env.VUE_APP_ENVIRONMENT === 'production' ? productionConfig : stagingConfig;
    const login = new ThreefoldLogin(
        config.appBackend,
        config.appId,
        config.seedPhrase,
        '', // No callback needed
        config.kycBackend
    );
    await login.init();
    const redirectUrl = new URL(request.protocol + '://' + request.get('host') + request.originalUrl);
    try {
        console.log(request.session);
        console.log(request.session.state);
        // @ts-ignore
        const profileData = (await login.parseAndValidateRedirectUrl(redirectUrl, request.session.state))?.profile;

        delete request.session.state;
        const doubleName: string = <string>profileData.doubleName;
        request.session.userId = doubleName.replace('.3bot', '');
        return '/callback';
    } catch (e) {
        throw new Error(e.message);
    }
};
