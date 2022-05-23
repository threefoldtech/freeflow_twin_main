import Contact from '../models/contact';
import Message from '../models/message';
import { getPrivateKey, getPublicKeyFromCache, setPublicKeyInCache } from '../store/keyStore';
import { getPublicKey } from './apiService';
import { createBase64Signature, verifySignature } from './encryptionService';

export const appendSignatureToMessage = <T>(message: Message<T>) => {
    const secretKey = getPrivateKey();
    if (!secretKey) return;
    const signature = createBase64Signature(message, secretKey);
    message.signatures = [signature, ...(message.signatures ?? [])];
};

export const verifyMessageSignature = async <T>(contact: Contact, message: Message<T>, signature: string) => {
    const signatureIndex = message.signatures.findIndex(s => s === signature);
    let publicKey = getPublicKeyFromCache(contact.id);
    if (!publicKey) {
        const base64Key = await getPublicKey(contact.location);
        if (!base64Key) return false;

        publicKey = base64Key;
        setPublicKeyInCache(contact.id, publicKey);
    }
    // console.log(`PUBLIC KEY: ${publicKey}`);
    const messageWithoutSignature = {
        ...message,
        signatures: message.signatures.slice(signatureIndex + 1, message.signatures.length),
    } as Message<T>;
    return verifySignature(messageWithoutSignature, signature, publicKey);
};
