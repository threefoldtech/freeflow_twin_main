import axios from 'axios';
import express, { Router } from 'express';

import { parseFullChat } from '../service/chatService';
import { persistChat } from '../service/dataService';
import { sendEventToConnectedSockets } from '../service/socketService';
import { getFullIPv6ApiLocation } from '../service/urlService';

const router = Router();

router.put('/invite', async (req, res) => {
    const chat = parseFullChat(req.body);
    persistChat(chat);
    sendEventToConnectedSockets('connectionRequest', chat);
    res.sendStatus(200);
    res.send();
});

router.put('/', async (req: express.Request, res: express.Response) => {
    const preParsedChat = { ...req.body, acceptedChat: true, isGroup: true };
    const chat = parseFullChat(preParsedChat);
    persistChat(chat);

    chat.contacts.forEach(async c => {
        const path = getFullIPv6ApiLocation(c.location, '/v1/group/invite');
        console.log('sending group request to ', path);
        try {
            await axios.put(path, chat);
        } catch (e) {
            console.log('failed to send group request');
        }
    });

    res.json({ success: true });
});

export default router;
