import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { execSync, spawn } from 'child_process';
import PATH from 'path';

import { EncryptionService } from '../encryption/encryption.service';
import { FileService } from '../file/file.service';
import { YggdrasilConfig } from './models/yggdrasil.model';

@Injectable()
export class YggdrasilService {
    private initialised = false;

    private configPath = '';
    private jsonPath = '';
    private logPath = '';

    private yggdrasilPeers = [
        'tcp://45.138.172.192:5001',
        'tcp://140.238.168.104:17117',
        'tls://140.238.168.104:17121',
        'tcp://[2a04:5b81:2010::90]:2000',
        'tls://[2607:5300:201:3100::50a1]:58226',
        'tls://[2a09:8280:1::a:2e2]:10020',
        'tcp://[2a09:8280:1::a:2e2]:10010',
        'tcp://45.231.133.188:58301',
        'tcp://213.188.197.95:10010',
        'tls://213.188.197.95:10020',
    ];

    constructor(
        private readonly _configService: ConfigService,
        private readonly _encryptionService: EncryptionService,
        private readonly _fileService: FileService
    ) {
        const baseDir = this._configService.get<string>('baseDir');
        this.configPath = PATH.join(baseDir, 'yggdrasil.conf');
        this.jsonPath = PATH.join(baseDir, 'user', 'yggdrasil.json');
        this.logPath = '/var/log/yggdrasil/out.log';
    }

    /**
     * Returns true if yggdrasil is initialised
     * @return {boolean} - Initialised or not
     */
    isInitialised(): boolean {
        return this.initialised;
    }

    /**
     * Sets up Yggdrasil configurations based on chat seed.
     * @param {string} seed - Chat seed.
     */
    async setupYggdrasil(seed: string): Promise<void> {
        const chatSeed = `${seed}-chat`;
        const keyReplacements = this.getReplacements(chatSeed);
        const generatedConfig = this.generateConfig();
        const config = this.replaceConfigValues({ generatedConfig, replaceConfig: keyReplacements as YggdrasilConfig });
        this.saveConfigs({ config, replacements: keyReplacements as YggdrasilConfig });
        this.runYggdrasil();
    }

    /**
     * Runs Yggdrasil using the created configurations and an Yggdrasil spawner.
     */
    runYggdrasil() {
        const out = this._fileService.openFile({ path: this.logPath, flags: 'a' });
        const err = this._fileService.openFile({ path: '/var/log/yggdrasil/err.log', flags: 'a' });
        const p = spawn('yggdrasil', ['-useconffile', this.configPath, '-logto', this.logPath], {
            detached: true,
            stdio: ['ignore', out, err],
        });
        p.unref();
    }

    /**
     * Generates and returns replacement private and public keys. Both signed and encrypted.
     * @param {string} seed - Seed to create hash and keys from.
     * @return {string} - Existing yggdrasil replacements found, returns config file.
     * @return {YggdrasilConfig} - New replacement keys if replacement was not found.
     */
    private getReplacements(seed: string): string | YggdrasilConfig {
        if (this._fileService.fileExists({ path: this.jsonPath })) {
            console.log('existing replacements for yggdrasil found');
            return this._fileService.readJSONFile({ path: this.jsonPath });
        }
        const hash = this._encryptionService.generateHashFromSeed(seed);
        const signKeyPair = this._encryptionService.getKeyPair(hash);
        const encryptionKeyPair = this._encryptionService.getEncryptionKeyPair(hash);

        return {
            signingPublicKey: this._encryptionService.encodeHex(signKeyPair.publicKey),
            signingPrivateKey: this._encryptionService.encodeHex(signKeyPair.secretKey),
            encryptionPublicKey: this._encryptionService.encodeHex(encryptionKeyPair.publicKey),
            encryptionPrivateKey: this._encryptionService.encodeHex(encryptionKeyPair.secretKey),
        } as YggdrasilConfig;
    }

    /**
     * Generates and returns new yggdrasil config.
     * @return {string} - Generated config.
     */
    private generateConfig(): string {
        return execSync('yggdrasil -genconf').toString();
    }

    /**
     * Replaces old config values with new ones.
     * @param {string} generatedConfig - Newly generated config.
     * @param {YggdrasilConfig} replaceConfig - config to replace generatedConfig with.
     * @return {string} - Generated config in string format.
     */
    private replaceConfigValues({
        generatedConfig,
        replaceConfig,
    }: {
        generatedConfig: string;
        replaceConfig: YggdrasilConfig;
    }): string {
        let cfg = generatedConfig;
        cfg = cfg.replace(/EncryptionPublicKey: .*$/gm, `EncryptionPublicKey: ${replaceConfig.encryptionPublicKey}`);
        cfg = cfg.replace(/EncryptionPrivateKey: .*$/gm, `EncryptionPrivateKey: ${replaceConfig.encryptionPrivateKey}`);
        cfg = cfg.replace(/SigningPublicKey: .*$/gm, `SigningPublicKey: ${replaceConfig.signingPublicKey}`);
        cfg = cfg.replace(/SigningPrivateKey: .*$/gm, `SigningPrivateKey: ${replaceConfig.signingPrivateKey}`);
        cfg = cfg.replace(
            /Peers: \[]/gm,
            `Peers: ${this.yggdrasilPeers.length === 0 ? '[]' : `["${this.yggdrasilPeers.join('","')}"]`}`
        );
        return cfg;
    }

    /**
     * Saves config files to file system.
     * @param {string} config - Confiuration.
     * @param {string} replacements - Replacements.
     */
    private saveConfigs({ config, replacements }: { config: string; replacements: YggdrasilConfig }): void {
        try {
            this._fileService.writeFile({ path: this.configPath, content: config });
            this._fileService.writeFile({ path: this.jsonPath, content: JSON.stringify(replacements) });
        } catch (error) {
            throw new BadRequestException(`${error}`);
        }
    }
}
