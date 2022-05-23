import { decodeBase64 } from 'tweetnacl-util';
import nacl, { SignKeyPair } from 'tweetnacl';

export const uint8ToBase64 = (uint8array: Uint8Array) => Buffer.from(uint8array).toString('base64');
export const base64ToUint8Array = (base64: string) => new Uint8Array(decodeBase64(base64));
export const objectToBase64 = (data: any): string => Buffer.from(JSON.stringify(data)).toString('base64');
export const objectToUint8Array = (data: any): Uint8Array => base64ToUint8Array(objectToBase64(data));

export const decodeHex = (hexString: string) => {
    return new Uint8Array(hexString.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
};

export const encodeHex = (bytes: Uint8Array) => {
    return bytes.reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');
};

export const getKeyPair = (userSeed: string): SignKeyPair => {
    const seed = new Uint8Array(decodeBase64(userSeed));
    return nacl.sign.keyPair.fromSeed(seed);
};

export const createSignature = (data: any, secretKey: string) => {
    if (!secretKey || !data) return;
    return nacl.sign.detached(objectToUint8Array(data), decodeBase64(secretKey));
};

export const createBase64Signature = (data: any, secretKey: string) => {
    const signature = createSignature(data, secretKey);
    if (!signature) return;
    return uint8ToBase64(signature);
};

export const verifySignature = (data: any, signature: string, publicKey: string) => {
    return nacl.sign.detached.verify(objectToUint8Array(data), base64ToUint8Array(signature), decodeBase64(publicKey));
};
