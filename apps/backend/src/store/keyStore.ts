import { getKey, Key, saveKey } from '../service/dataService';
import { uint8ToBase64 } from '../service/encryptionService';

interface KeyCache {
    [userId: string]: string;
}

let cache: KeyCache = {};
let privateKey: string;
let publicKey: string;

export const getPublicKeyFromCache = (userId: string): string | undefined => {
    return cache[userId];
};

export const setPublicKeyInCache = (userId: string, key: string) => {
    cache = {
        ...cache,
        [userId]: key,
    };
};

const setKeys = () => {
    publicKey = getKey(Key.Public);
    privateKey = getKey(Key.Private);
};

export const initKeys = () => {
    console.log('Init keys');
    try {
        setKeys();
    } catch (ex) {
        console.log('Pub and private key not found, first time login no keys yet');
    }
};

export const getPrivateKey = () => {
    return privateKey;
};

export const updatePrivateKey = (pk: Uint8Array) => {
    const pkString = uint8ToBase64(pk);
    saveKey(pkString, Key.Private);
    privateKey = pkString;
};

export const getPublicKey = () => {
    return publicKey;
};

export const updatePublicKey = (pk: Uint8Array) => {
    const pkString = uint8ToBase64(pk);
    saveKey(pkString, Key.Public);
    publicKey = pkString;
};
