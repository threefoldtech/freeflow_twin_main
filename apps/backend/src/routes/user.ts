import { Router } from 'express';
import { UploadedFile } from 'express-fileupload';
import * as fs from 'fs';

import { uuidv4 } from '../common';
import { config } from '../config/config';
import { deleteAvatar, saveAvatar } from '../service/dataService';
import { connections } from '../store/connections';
import { getPublicKey } from '../store/keyStore';
import { getAvatar, getImage, getLastSeen, getStatus, updateAvatar } from '../store/user';

const router = Router();

router.get('/publickey', (req, res) => {
    res.json(getPublicKey());
});

router.get('/getStatus', async (req, res) => {
    const isOnline = connections.getConnections().length ? true : false;
    const status = getStatus();
    const avatar = await getAvatar();
    const lastSeen = getLastSeen();
    const data = {
        status,
        avatar,
        isOnline,
        lastSeen,
    };
    // console.log('getStatus', data);
    res.json(data);
});

router.get('/avatar/:avatarId', async (req, res) => {
    if (!req.params.avatarId) {
        res.sendStatus(403);
    }
    let path = `${config.baseDir}user/avatar-${req.params.avatarId}`;
    if (req.params.avatarId === 'default') {
        //@ts-ignore
        const userConfigAvatarId = JSON.parse(fs.readFileSync(`${config.baseDir}user/userinfo.json`)).image;
        if (userConfigAvatarId !== '' || userConfigAvatarId !== undefined)
            path = `${config.baseDir}user/avatar-${userConfigAvatarId}`;
    }
    console.log(path);
    console.log('Does it exist???? : ' + fs.existsSync(path));

    res.download(path);
});

router.post('/avatar', async (req, resp) => {
    const file = <UploadedFile>req.files.file;
    const avatarId = uuidv4();
    await saveAvatar(file, avatarId);
    await deleteAvatar(getImage());
    updateAvatar(avatarId);
    const newUrl = await getAvatar();
    resp.status(200).json(newUrl);
});

export default router;
