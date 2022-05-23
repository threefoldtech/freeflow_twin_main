import { Router, Request, Response } from 'express';
import { spawnDocker } from '../service/dockerService';

export const router = Router();

router.post('/spawn', async (req: Request, res: Response) => {
    var name = req.body.name;

    try {
        if (name) {
            console.log('Creating docker for: ', name);
            await spawnDocker(name);

            res.json({
                success: true,
                redirectUrl: `https://${name}.${process.env.DIGITALTWIN_APPID}`,
            });
        }
    } catch (err) {
        console.log("/spawn: Couldn't create docker for user: " + name);

        res.json({
            success: false,
            redirectUrl: `https://${name}.${process.env.DIGITALTWIN_APPID}`,
        });
    }
});
