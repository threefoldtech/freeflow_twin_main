import crypto from 'crypto';
import { readFileSync } from 'fs';

export const getDocumentBrowserKey = (canWrite: boolean, path: string) => {
    const fileBuffer = readFileSync(path);
    const hashSum = crypto.createHash('sha256');
    hashSum.update(fileBuffer);
    const hex = hashSum.digest('hex');
    return crypto
        .createHash('sha1')
        .update(`${canWrite ? 'write' : 'read'}${path}${hex}`)
        .digest('hex');
};

export const hasSpecialCharacters = (name: string) => {
    const format = /[`!@#$%^&*()+\=\[\]{};':"\\|,<>\/?~]/;
    return format.test(name);
};
