import { sign, verify } from 'jsonwebtoken';

import { config } from '../config/config';
import { getPrivateKey } from '../store/keyStore';

export const createJwtToken = (data: any, exp?: number | string) => {
    const privateKey = getPrivateKey();
    return sign(
        {
            data: data,
        },
        Buffer.from(privateKey),
        { expiresIn: exp ?? '9999 years', issuer: config.userid }
    );
};

export const verifyJwtToken = <T extends object>(token: string): [payload: T, error: any] => {
    const privateKey = getPrivateKey();
    try {
        const payload = verify(token, Buffer.from(privateKey));
        return [payload as T, undefined];
    } catch (ex) {
        return [undefined, ex];
    }
};
export const parseJwt = (token: string) => {
    const base64Url = token.split('.')[1];
    return JSON.parse(Buffer.from(base64Url, 'base64').toString());
};
