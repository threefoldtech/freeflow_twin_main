import PATH from 'path';
import fs from 'fs';
import { config } from '../config/config';
import { getTokenFile, saveTokenFile } from '../service/dataService';
import { verifyJwtToken } from '../service/jwtService';

export enum Permission {
    FileBrowserRead = 'FileBrowserRead',
    FileBrowserWrite = 'FileBrowserWrite',
}

export interface ITokenFile {
    blockedTokens: string[];
}

export interface Token<T extends TokenData> {
    iat: number;
    exp: number;
    data: T;
}

export interface TokenData {
    permissions: Permission[];
}

export const initTokens = () => {
    try {
        if (fs.existsSync(PATH.join(config.baseDir, '/user', '/tokens.json'))) {
            removeExpiredTokens();
            return;
        }
        throw new Error();
    } catch (ex) {
        saveTokenFile({
            blockedTokens: [],
        } as ITokenFile);
    }
};

const isValid = (token: string): boolean => {
    const [data, err] = verifyJwtToken(token);
    return data && !err;
};

export const isBlocked = (token: string): boolean => {
    return getTokenFile().blockedTokens.some(x => x === token);
};

const removeExpiredTokens = () => {
    const tokens = getTokenFile();
    const newTokens = {
        blockedTokens: tokens.blockedTokens.filter(isValid),
    } as ITokenFile;
    saveTokenFile(newTokens);
};
