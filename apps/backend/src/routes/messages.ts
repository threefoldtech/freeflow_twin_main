import express, { Router } from 'express';
import { fromBuffer } from 'file-type';
import { StatusCodes } from 'http-status-codes';

import { uuidv4 } from '../common';
import { config } from '../config/config';
import Chat from '../models/chat';
import Contact from '../models/contact';
import Message from '../models/message';
import { sendMessageToApi } from '../service/apiService';
import { persistMessage, syncNewChatWithAdmin } from '../service/chatService';
import { getBlocklist, getChat, persistChat } from '../service/dataService';
import {
    handleIncommingFileShare,
    handleIncommingFileShareDelete,
    handleIncommingFileShareUpdate,
} from '../service/fileShareService';
import { appendSignatureToMessage, verifyMessageSignature } from '../service/keyService';
import { getMyLocation } from '../service/locationService';
import { editMessage, handleRead, parseMessage } from '../service/messageService';
import { sendEventToConnectedSockets } from '../service/socketService';
import { handleSystemMessage } from '../service/systemService';
import { contactRequests } from '../store/contactRequests';
import {
    ContactRequest,
    DtIdInterface,
    FileShareDeleteMessageType,
    FileShareMessageType,
    GroupUpdateType,
    MessageBodyTypeInterface,
    MessageTypes,
    StringMessageTypeInterface,
} from '../types';
import { getFile, Path } from '../utils/files';

const router = Router();

const handleContactRequest = async (message: Message<ContactRequest>) => {
    contactRequests.push(<Contact>(<unknown>message.body));
    const otherContact = new Contact(<string>message.from, message.body.location);
    const myLocation = await getMyLocation();
    const myself = new Contact(<string>config.userid, myLocation);
    const requestMsg: Message<StringMessageTypeInterface> = {
        from: message.from,
        to: message.to,
        body: `You've received a new message request from ${message.from}`,
        id: uuidv4(),
        type: MessageTypes.SYSTEM,
        timeStamp: new Date(),
        replies: [],
        signatures: message.signatures ?? [],
        subject: null,
    };

    // const chatExists = getChatById(message.from)?.contacts.some(c => c.location === otherContact.location);

    // if (chatExists) return;

    const newchat = new Chat(
        message.from as string,
        [myself, otherContact],
        false,
        [requestMsg],
        <string>message.from,
        false,
        message.from
    );
    sendEventToConnectedSockets('connectionRequest', newchat);
    persistChat(newchat);
};

export const determineChatId = (message: Message<MessageBodyTypeInterface>): DtIdInterface => {
    if (message.to === config.userid) {
        return message.from;
    }

    return message.to;
};

export const verifySignedMessageByChat = async (chat: Chat, signedMessage: Message<MessageBodyTypeInterface>) => {
    const adminContact = chat.contacts.find(x => x.id === chat.adminId);
    const fromContact = chat.contacts.find(x => x.id === signedMessage.from);
    return verifySignedMessage(chat.isGroup, adminContact, fromContact, signedMessage);
};

export const verifySignedMessage = async (
    isGroup: boolean,
    adminContact: Contact,
    fromContact: Contact,
    signedMessage: Message<MessageBodyTypeInterface>
): Promise<boolean> => {
    let signatureIndex = 0;
    if (isGroup && adminContact?.id !== config.userid) {
        const adminIsVerified = await verifyMessageSignature(
            adminContact,
            signedMessage,
            signedMessage.signatures[signatureIndex]
        );
        if (!adminIsVerified) {
            console.log(`Admin signature is not correct`);
            return false;
        }
        signatureIndex++;
    }

    if (!fromContact) {
        console.log(`Sender ${signedMessage.from} is not found in the contact list`);
        return false;
    }

    return await verifyMessageSignature(fromContact, signedMessage, signedMessage.signatures[signatureIndex]);
};

const handleGroupAdmin = async <ResBody, Locals>(
    chat: Chat,
    message: Message<MessageBodyTypeInterface>,
    res: any,
    chatId: DtIdInterface
) => {
    const messageIsVerified = await verifySignedMessage(
        false,
        undefined,
        chat.contacts.find(x => x.id === message.from),
        message
    );
    if (!messageIsVerified) {
        res.sendStatus(500);
        return;
    }

    appendSignatureToMessage(message);
    chat.contacts.filter(c => c.id !== config.userid).forEach(c => sendMessageToApi(c.location, message));

    if (message.type === <string>MessageTypes.SYSTEM) {
        handleSystemMessage(<any>message, chat);
        res.json({ status: 'success' });
        return;
    }

    sendEventToConnectedSockets('message', message);

    if (message.type === MessageTypes.READ) {
        handleRead(message as Message<StringMessageTypeInterface>);
        res.json({ status: 'success' });
        return;
    }

    if (message.type === MessageTypes.EDIT || message.type === MessageTypes.DELETE) {
        editMessage(chatId, message);
        sendEventToConnectedSockets('message', message);
        res.json({ status: 'success' });
        return;
    }

    persistMessage(chat.chatId, message);
    res.json({ status: 'success' });
    return;
};

// Should be externally availble
router.put('/', async (req: express.Request, res: express.Response) => {
    // @ TODO check if valid

    const msg = req.body;
    let message = msg as Message<MessageBodyTypeInterface>;

    try {
        message = parseMessage(msg);
    } catch (e) {
        console.log('message failed to parse');
        res.status(500).json({ status: 'failed', reason: 'validation failed' });
        return;
    }

    const blockList = getBlocklist();
    if (message.type === MessageTypes.CONTACT_REQUEST) {
        if (blockList.includes(<string>message.from)) {
            //@todo what should i return whenblocked
            res.json({ status: 'blocked' });
            return;
        }

        const msg = message as Message<ContactRequest>;
        await verifySignedMessage(false, undefined, msg.body as Contact, message);
        await handleContactRequest(msg);

        res.json({ status: 'success' });
        return;
    }

    const chatId = determineChatId(message);

    let chat: Chat;
    try {
        chat = getChat(chatId);
    } catch (e) {
        console.log(e);

        res.status(403).json("Sorry but I'm not aware of this chat id");
        return;
    }

    const messageIsCorrectlySigned = await verifySignedMessageByChat(chat, message);
    if (!messageIsCorrectlySigned) {
        console.log('message failed to verify');
        res.sendStatus(500);
        return;
    }

    if (blockList.includes(<string>chatId)) {
        //@todo what should i return whenblocked
        res.json({ status: 'blocked' });
        return;
    }

    if (message.type === MessageTypes.SYSTEM) {
        const groupUpdateMsg = message as unknown as Message<GroupUpdateType>;
        if (groupUpdateMsg.body.type === 'ADDUSER' && groupUpdateMsg.body.contact.id === config.userid) {
            await syncNewChatWithAdmin(groupUpdateMsg.body.adminLocation, <string>groupUpdateMsg.to);
            res.json({ status: 'Successfully added chat' });
            return;
        }
    }

    if (chat.isGroup && chat.adminId == config.userid) {
        return await handleGroupAdmin(chat, message, res, chatId);
    }

    if (!chat && !chat.isGroup && contactRequests.find(c => c.id == message.from)) {
        //@todo maybe 3 messages should be allowed or something
        res.status(403).json({
            status: 'Forbidden',
            reason: 'contact not yet approved',
        });
        return;
    }

    if (!chat) {
        res.status(403).json({ status: 'Forbidden', reason: 'not in contact' });
        return;
    }

    switch (message.type) {
        case MessageTypes.EDIT:
        case MessageTypes.DELETE:
            editMessage(chatId, message);
            sendEventToConnectedSockets('message', message);
            res.json({ status: 'success' });
            return;
        case MessageTypes.READ:
            handleRead(message as Message<StringMessageTypeInterface>);

            res.json({ status: 'success' });
            return;
        case MessageTypes.SYSTEM:
            console.log('handling system message as ', config.userid);
            handleSystemMessage(<any>message, chat);

            res.json({ status: 'success' });
            return;
        case MessageTypes.FILE_SHARE:
            if (message.from == config.userid) {
                res.json({ status: 'cannot share with yourself' });
                return;
            }
            handleIncommingFileShare(message as Message<FileShareMessageType>, chat);
            res.json({ status: 'success' });
            return;
        case MessageTypes.FILE_SHARE_UPDATE:
            if (message.from === config.userid) {
                res.json({ status: 'cannot update share with yourself' });
                return;
            }
            handleIncommingFileShareUpdate(message as Message<FileShareMessageType>);
            res.json({ status: 'success' });
            return;
        case MessageTypes.FILE_SHARE_DELETE:
            console.log('delete fileshare');
            if (message.from === config.userid) {
                console.log(message.from, config.userid);
                res.json({ status: 'cannot update share with yourself' });
                return;
            }

            handleIncommingFileShareDelete(message as Message<FileShareDeleteMessageType>);
            res.json({ status: 'success' });
            return;
        case MessageTypes.DOWNLOAD_ATTACHMENT: {
            if (message.from === config.userid) {
                res.json({
                    status: 'downloading file to your quantum',
                });
            }

            const url: string = decodeURI(new URL(<string>message.body).pathname).replace(
                '/api/v1/files/' + message.from,
                '' + message.from + '/files'
            );

            const file = await getFile(new Path(url, '/appdata/chats'));
            const mime = await fromBuffer(file);

            res.set('Content-Type', mime?.mime || null);
            res.send(file);
            return;
        }
        case MessageTypes.POST_DELETE:
            sendEventToConnectedSockets('post_deleted', message.body);
            res.status(StatusCodes.OK);
            res.send();
            return;
    }

    // const message = new Message(msg.from, msg.to, msg.body);
    console.log(`received new message from ${message.from}`);
    //
    persistMessage(chat.chatId, message);

    res.sendStatus(200);
});

router.get('/:chatId', (req, res) => {
    const fromId = <string | undefined>req.query.fromId;
    const page = parseInt(<string | undefined>req.query.page);
    let limit = parseInt(<string | undefined>req.query.limit);
    limit = limit > 100 ? 100 : limit;

    const chat = getChat(req.params.chatId);
    if (!chat) {
        res.sendStatus(404);
        return;
    }

    let end = chat.messages.length;
    if (page) end = chat.messages.length - page * limit;
    else if (fromId) end = chat.messages.findIndex(m => m.id === fromId);

    const start = end - limit < 0 ? 0 : end - limit;

    res.json({
        hasMore: start !== 0,
        messages: chat.messages.slice(start, end),
    });
});

export default router;
