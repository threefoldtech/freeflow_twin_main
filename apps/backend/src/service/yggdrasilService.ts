import nacl from 'tweetnacl';
import { encodeHex } from './encryptionService';
import { execSync, spawn } from 'child_process';
import fs from 'fs';
import PATH from 'path';
import { config } from '../config/config';
import { getMyLocation } from './locationService';

export interface YggdrasilConfig {
    signingPrivateKey: string;
    signingPublicKey: string;
    encryptionPrivateKey: string;
    encryptionPublicKey: string;
    peers: string;
}

const configPath = PATH.join(config.baseDir, 'yggdrasil.conf');
const jsonPath = PATH.join(config.baseDir, 'user', 'yggdrasil.json');

export let isInitialized = false;

const replaceValues = (generatedConfig: string, replaceConfig: YggdrasilConfig) => {
    let cfg = generatedConfig;
    cfg = cfg.replace(/EncryptionPublicKey: .*$/gm, `EncryptionPublicKey: ${replaceConfig.encryptionPublicKey}`);
    cfg = cfg.replace(/EncryptionPrivateKey: .*$/gm, `EncryptionPrivateKey: ${replaceConfig.encryptionPrivateKey}`);
    cfg = cfg.replace(/SigningPublicKey: .*$/gm, `SigningPublicKey: ${replaceConfig.signingPublicKey}`);
    cfg = cfg.replace(/SigningPrivateKey: .*$/gm, `SigningPrivateKey: ${replaceConfig.signingPrivateKey}`);
    cfg = cfg.replace(
        /Peers: \[]/gm,
        `Peers: ${config.yggdrasil.peers.length === 0 ? '[]' : `["${config.yggdrasil.peers.join('","')}"]`}`
    );
    return cfg;
};

const generateConfig = (): string => {
    return execSync('yggdrasil -genconf').toString();
};

const getReplacements = (seed: string) => {
    if (fs.existsSync(jsonPath)) {
        console.log('Existing replacements for yggdrasil found');
        return JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    }
    const hash = nacl.hash(Buffer.from(seed)).slice(0, 32);
    const signKeyPair = nacl.sign.keyPair.fromSeed(hash);
    const encryptionKeyPair = nacl.box.keyPair.fromSecretKey(hash);
    return {
        signingPublicKey: encodeHex(signKeyPair.publicKey),
        signingPrivateKey: encodeHex(signKeyPair.secretKey),
        encryptionPublicKey: encodeHex(encryptionKeyPair.publicKey),
        encryptionPrivateKey: encodeHex(encryptionKeyPair.secretKey),
    } as YggdrasilConfig;
};

const saveConfigs = (conf: string, replacements: YggdrasilConfig) => {
    fs.writeFileSync(configPath, conf);
    fs.writeFileSync(jsonPath, JSON.stringify(replacements));
};

const runYggdrasil: () => Promise<void> = () => {
    const out = fs.openSync('/var/log/yggdrasil/out.log', 'a');
    const err = fs.openSync('/var/log/yggdrasil/err.log', 'a');
    const p = spawn('yggdrasil', ['-useconffile', configPath, '-logto', '/var/log/yggdrasil/yggdrasil.log'], {
        detached: true,
        stdio: ['ignore', out, err],
    });
    p.unref();

    return new Promise<void>(async (resolve, reject) => {
        let done = false;
        setTimeout(() => {
            if (done) return;
            reject();
            done = true;
        }, 30000);
        while (!done) {
            const address = await getMyLocation();
            if (address) {
                resolve();
                done = true;
                break;
            }
        }
    });
};

export const initYggdrasil = () => {
    if (!fs.existsSync(configPath)) return;
    console.log('Yggdrasil initialized');
    isInitialized = true;
    return;
};

export const setupYggdrasil = async (seed: string) => {
    const chatSeed = `${seed}-chat`;
    const replacements = getReplacements(chatSeed);
    console.log('Replacing yggdrasil config with: ', replacements);
    const generatedConfig = generateConfig();
    const config = replaceValues(generatedConfig, replacements);
    saveConfigs(config, replacements);
    await runYggdrasil();
};
