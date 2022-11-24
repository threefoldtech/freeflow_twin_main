import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { exec, execSync, spawn } from 'child_process';
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
        'tcp://gent01.grid.tf:9943',
        'tcp://gent02.grid.tf:9943',
        'tcp://gent03.grid.tf:9943',
        'tcp://gent04.grid.tf:9943',
        'tcp://gent01.test.grid.tf:9943',
        'tcp://gent02.test.grid.tf:9943',
        'tcp://gent01.dev.grid.tf:9943',
        'tcp://gent02.dev.grid.tf:9943',
        'tcp://gw291.vienna1.greenedgecloud.com:9943',
        'tcp://gw293.vienna1.greenedgecloud.com:9943',
        'tcp://gw294.vienna1.greenedgecloud.com:9943',
        'tcp://gw297.vienna1.greenedgecloud.com:9943',
        'tcp://gw298.vienna1.greenedgecloud.com:9943',
        'tcp://gw299.vienna2.greenedgecloud.com:9943',
        'tcp://gw300.vienna2.greenedgecloud.com:9943',
        'tcp://gw304.vienna2.greenedgecloud.com:9943',
        'tcp://gw306.vienna2.greenedgecloud.com:9943',
        'tcp://gw307.vienna2.greenedgecloud.com:9943',
        'tcp://gw309.vienna2.greenedgecloud.com:9943',
        'tcp://gw313.vienna2.greenedgecloud.com:9943',
        'tcp://gw324.salzburg1.greenedgecloud.com:9943',
        'tcp://gw326.salzburg1.greenedgecloud.com:9943',
        'tcp://gw327.salzburg1.greenedgecloud.com:9943',
        'tcp://gw328.salzburg1.greenedgecloud.com:9943',
        'tcp://gw330.salzburg1.greenedgecloud.com:9943',
        'tcp://gw331.salzburg1.greenedgecloud.com:9943',
        'tcp://gw333.salzburg1.greenedgecloud.com:9943',
        'tcp://gw422.vienna2.greenedgecloud.com:9943',
        'tcp://gw423.vienna2.greenedgecloud.com:9943',
        'tcp://gw424.vienna2.greenedgecloud.com:9943',
        'tcp://gw425.vienna2.greenedgecloud.com:9943',
        'tcp://smithtacticalsolutions.com:9943',
        'tcp://108.242.38.186:9943',
        'tls://ipv4.campina-grande.paraiba.brazil.yggdrasil.iasylum.net:50000',
        'tls://192.99.145.61:58226',
        'tls://yyz.yuetau.net:6643',
        'tls://ca1.servers.devices.cwinfo.net:58226',
        'tls://65.21.57.122:61995',
        'tls://95.216.5.243:18836',
        'tls://fi1.servers.devices.cwinfo.net:61995',
        'tls://aurora.devices.waren.io:18836',
        'tls://ygg-fin.incognet.io:8884',
        'tls://152.228.216.112:23108',
        'tls://51.255.223.60:54232',
        'tls://cloudberry.fr1.servers.devices.cwinfo.net:54232',
        'tls://62.210.85.80:39575',
        'tls://fr2.servers.devices.cwinfo.net:23108',
        'tls://s2.i2pd.xyz:39575',
        'tls://p2p-node.de:1338?key=000000d80a2d7b3126ea65c8c08fc751088c491a5cdd47eff11c86fa1e4644ae',
        'tls://vpn.ltha.de:443?key=0000006149970f245e6cec43664bce203f2514b60a153e194f31e2b229a1339d',
        'tls://ygg.mkg20001.io:443',
        'tls://ygg1.mk16.de:1338?key=0000000087ee9949eeab56bd430ee8f324cad55abf3993ed9b9be63ce693e18a',
        'tls://ygg2.mk16.de:1338?key=00000002e71368e36f2fae8fe437e09f935dcf69ee08dc00afe02ad7eae2f5f7',
        'tls://01.ffm.deu.ygg.yt:443',
        'tls://01.blr.ind.ygg.yt:443',
        'tls://01.tky.jpn.ygg.yt:443',
        'tls://minecast.xyz:3785',
        'tls://01.mxc.mex.ygg.yt:443',
        'tls://94.103.82.150:8080',
        'tls://45.147.198.155:6010',
        'tls://ygg-nl.incognet.io:8884',
        'tls://ipv4.dronten.flevoland.netherlands.iasylum.net:50000',
        'tls://ipv6.dronten.flevoland.netherlands.iasylum.net:51000',
        'tls://aaoth.xyz:25565',
        'tls://ygg1.ezdomain.ru:11130',
        'tls://ygg2.ezdomain.ru:11130',
        'tls://ipv4.warsaw.poland.yggdrasil.iasylum.net:50000',
        'tls://54.37.137.221:11129',
        'tls://pl1.servers.devices.cwinfo.net:11129',
        'tls://185.165.169.234:8443',
        'tls://188.225.9.167:18227',
        'tls://yggno.de:18227',
        'tls://ygg.tomasgl.ru:61944?key=c5e0c28a600c2118e986196a0bbcbda4934d8e9278ceabea48838dc5d8fae576',
        'tls://ygg.loskiq.ru:17314',
        'tls://176.215.237.83:8443?sni=irk.peering.flying-squid.host&key=f69da2c11d5fe8bcee7d026a6ed28dc7873db9ecb88c797b29348546e411d934',
        'tls://yggpvs.duckdns.org:8443',
        'tls://ygg0.ezdomain.ru:11130',
        'tls://158.101.229.219:17001',
        'tls://sin.yuetau.net:6643',
        'tls://01.sgp.sgp.ygg.yt:443',
        'tls://01.sel.kor.ygg.yt:443',
        'tls://185.130.44.194:7040',
        'tls://ygg.ace.ctrl-c.liu.se:9999?key=5636b3af4738c3998284c4805d91209cab38921159c66a6f359f3f692af1c908',
        'tls://193.111.114.28:1443',
        'tls://91.224.254.114:18001',
        'tls://ygg-ukr.incognet.io:8884',
        'tls://51.38.64.12:28395',
        'tls://185.175.90.87:43006',
        'tls://uk1.servers.devices.cwinfo.net:28395',
        'tls://01.lon.gbr.ygg.yt:443',
        'tls://108.175.10.127:61216',
        'tls://longseason.1200bps.xyz:13122',
        'tls://supergay.network:9001',
        'tls://lancis.iscute.moe:49274',
        'tls://167.160.89.98:7040',
        'tls://ygg-ny-us.incognet.io:8884',
        'tls://44.234.134.124:443',
        'tls://ygg-tx-us.incognet.io:8884',
        'tls://bazari.sh:3725',
        'tls://lax.yuetau.net:6643',
        'tls://ygg-nv-us.incognet.io:8884',
        'tls://yggdrasil.sticloud.gq:13122',
        'tls://51.81.46.170:5222',
        'tls://01.scv.usa.ygg.yt:443',
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
        console.log('Setting up ygg');
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

        this.cleanAllYggdrasilProcesses();

        const p = spawn('yggdrasil', ['-useconffile', this.configPath, '-logto', this.logPath], {
            detached: true,
            stdio: ['ignore', out, err],
        });
        p.unref();
    }

    /**
     * Gets current location (IPv6) of own connection.
     * @return {string} - Own address.
     * @return {Error} - Error.
     */
    async getSelf(): Promise<string | Error> {
        return new Promise((res, rej) => {
            exec(
                "yggdrasilctl -v getSelf | sed -n -e 's/^.*IPv6 address.* //p'",
                (err: Error, stdout: string, sterr: string) => {
                    if (err) return rej(err);
                    if (sterr) return rej(sterr);
                    const formattedAddress = stdout.replace('\n', '');
                    res(formattedAddress);
                }
            );
        });
    }

    /**
     * Generates and returns replacement private and public keys. Both signed and encrypted.
     * @param {string} seed - Seed to create hash and keys from.
     * @return {string} - Existing yggdrasil replacements found, returns config file.
     * @return {YggdrasilConfig} - New replacement keys if replacement was not found.
     */
    private getReplacements(seed: string): string | YggdrasilConfig {
        if (this._fileService.exists({ path: this.jsonPath })) {
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

    private cleanAllYggdrasilProcesses(): string {
        try {
            return execSync('pkill yggdrasil').toString();
        } catch (e) {
            console.error(e);
        }
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
     * @param {Object} obj - Object.
     * @param {string} obj.generatedConfig - Newly generated config.
     * @param {YggdrasilConfig} obj.replaceConfig - config to replace generatedConfig with.
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
        cfg = cfg.replace(/PublicKey: .*$/gm, `PublicKey: ${replaceConfig.signingPublicKey}`);
        cfg = cfg.replace(/PrivateKey: .*$/gm, `PrivateKey: ${replaceConfig.signingPrivateKey}`);
        cfg = cfg.replace(
            /Peers: \[]/gm,
            `Peers: ${this.yggdrasilPeers.length === 0 ? '[]' : `["${this.yggdrasilPeers.join('","')}"]`}`
        );
        return cfg;
    }

    /**
     * Saves config files to file system.
     * @param {Object} obj - Object.
     * @param {string} obj.config - Confiuration.
     * @param {string} obj.replacements - Replacements.
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
