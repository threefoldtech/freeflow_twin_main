import Dockerode, { DeviceMapping } from 'dockerode';
import * as fs from 'fs';
import { release } from 'os';
import { generateMnemonic } from 'bip39';
import { logger } from '../logger';

const docker = new Dockerode({ socketPath: '/var/run/docker.sock' });

export const initDocker = async () => {
    const networks = await docker.listNetworks();
    if (!networks.find(n => n.Name === 'chatnet')) {
        await docker.createNetwork({ Name: 'chatnet' });
    }
};

const uuidv4 = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (Math.random() * 16) | 0,
            v = c == 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
};

const getImage = () => {
    try {
        const image = fs.readFileSync('/config/version.txt').toString();
        return image.trim();
    } catch (err) {
        return 'jimbersoftware/chat:0.6';
    }
};

export const spawnDocker = async (userId: string) => {
    const volumeName = `chat_storage_${userId}`;
    const containerName = `${userId}-chat`;

    console.log('Going to create docker image with: ');
    console.log('volumeName: ', volumeName);
    console.log('containerName: ', containerName);

    const containerList = await docker.listContainers();

    console.log('Got the list: ', containerList);

    if (containerList.find(c => c.Names.includes('/' + containerName))) {
        console.log('Docker already exists, no need to create it.');
        return;
    }

    try {
        console.log('Getting volumes ...');
        const list = await docker.listVolumes();
        console.log('Got the volumes');

        if (!list.Volumes.find(v => v.Name === volumeName)) {
            console.log('Creating volume');
            await docker.createVolume({
                name: volumeName,
                labels: { chat: 'volume' },
            });
            console.log('volume created');
        }
    } catch (e) {
        throw new Error('volumeError');
    }

    const options: Dockerode.ContainerCreateOptions = {
        Image: getImage(),
        Tty: true,
        name: containerName,
        HostConfig: {
            AutoRemove: true,
            NetworkMode: 'chatnet',
            Sysctls: { 'net.ipv6.conf.all.disable_ipv6': '0' },
            CapAdd: 'NET_ADMIN',
            Devices: <DeviceMapping[]>[
                {
                    PathOnHost: '/dev/net/tun',
                    PathInContainer: '/dev/net/tun',
                    CgroupPermissions: 'rwm',
                },
            ],
            Binds: [`${volumeName}:/appdata`],
        },
        Env: [
            `USER_ID=${userId}`,
            `DIGITALTWIN_APPID=${process.env.DIGITALTWIN_APPID}`,
            `ENVIRONMENT=${process.env.ENVIRONMENT}`,
            `SECRET=${uuidv4()}`,
            `THREEBOT_PHRASE=${generateMnemonic()}`,
            `ENABLE_SSL=false`,
        ],
    };

    try {
        console.log('Creating container');
        const container = await docker.createContainer(options);
        console.log('container created ');
        await container.start();
        console.log('container started ');
    } catch (err) {
        logger.error('error', { err });
        throw err;
    }
};

export const fetchChatList = async () => {
    const containers: Dockerode.ContainerInfo[] = await docker.listContainers();
    return containers
        .map((container: Dockerode.ContainerInfo) => container?.Names[0])
        .filter(containerName => containerName.indexOf('-chat') !== -1)
        .map(n => n.replace('-chat', ''))
        .map(n => n.replace('/', ''))
        .map(n => n.trim());
};
