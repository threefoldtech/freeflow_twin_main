import express, { Router } from 'express';
import { StatusCodes } from 'http-status-codes';

import { config } from '../config/config';
import { requiresAuthentication } from '../middlewares/authenticationMiddleware';
import { getAcceptedChatsWithPartialMessages, getChatById, getChatRequests } from '../service/chatService';
import { getChat, persistChat } from '../service/dataService';
import { sendEventToConnectedSockets } from '../service/socketService';
import { contacts } from '../store/contacts';
import { HttpError } from '../types/errors/httpError';
import { IdInterface } from '../types/index';

const router = Router();

router.post('/', requiresAuthentication, (req: express.Request, res: express.Response) => {
    if (req.query.id) {
        console.log('accepting', req.query.id);
        //Flow to add contact request to contacts
        const id: IdInterface = <IdInterface>req.query.id;
        console.log('accepting', id);
        const chat = getChatById(id);
        chat.acceptedChat = true;
        const contact = chat.contacts.find(c => c.id === id);
        contacts.push(contact);
        sendEventToConnectedSockets('new_chat', chat);
        persistChat(chat);
        res.json(chat);
        return;
    }
});

router.get('/', requiresAuthentication, (req: express.Request, res: express.Response) => {
    let limit = parseInt(<string | undefined>req.query.limit);
    limit = limit > 100 ? 100 : limit;

    const chats = getAcceptedChatsWithPartialMessages(limit);
    res.json(chats);
});

router.get('/chatRequests', requiresAuthentication, (_req: express.Request, res: express.Response) => {
    const returnChats = getChatRequests();
    res.json(returnChats);
});

router.get('/:chatId', requiresAuthentication, (req: express.Request, res: express.Response) => {
    const chat = getChat(req.params.chatId);
    if (!chat.contacts.some(x => x.id !== config.userid)) {
        throw new HttpError(StatusCodes.FORBIDDEN);
    }
    res.json(chat);
});

export default router;
