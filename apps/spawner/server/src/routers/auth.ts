import { Router } from 'express';
import { appCallback, getAppLoginUrl } from '../service/authService';

export const router = Router();

router.get('/signIn/:name', async (request, respose) => {
    console.log(request.rawHeaders);
    console.log(request.cookies);
    const name = request.params.name;
    const loginUrl = await getAppLoginUrl(request, `/api/v1/auth/callback`, name);
    respose.redirect(loginUrl);
});

router.get('/callback', async (request, respose) => {
    console.log(request.rawHeaders);
    console.log(request.cookies);
    const callback = await appCallback(request);
    respose.redirect(callback);
});
