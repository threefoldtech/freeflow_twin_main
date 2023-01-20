import { Router, Request, Response } from 'express';
import fs from 'fs';

export const router = Router();

const getVersion = () => {
    try {
        const version = fs.readFileSync('/config/version.txt').toString();
        return version.trim();
    } catch (err) {
        return 'jimbersoftware/chat:0.6';
    }
};

router.get('/', async (req: Request, res: Response) => {
    const version = getVersion();

    res.json({ version: version });
});
