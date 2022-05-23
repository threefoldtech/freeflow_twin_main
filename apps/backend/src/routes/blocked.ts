import express, { Router } from 'express';
import { getBlocklist, persistBlocklist } from '../service/dataService';
import { requiresAuthentication } from '../middlewares/authenticationMiddleware';

const router = Router();

router.get('/', requiresAuthentication, (req: express.Request, res: express.Response) => {
    res.json(getBlocklist());
});

router.delete('/:name', requiresAuthentication, (req: express.Request, res: express.Response) => {
    persistBlocklist(getBlocklist().filter(b => b != req.params.name));
    res.json({ status: 'success' });
});

export default router;
