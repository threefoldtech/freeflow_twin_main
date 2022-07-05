import { UploadedFile } from 'express-fileupload';
import fs from 'fs';
import im from 'imagemagick';
import { uniqBy } from 'lodash';
import PATH from 'path';

import { config } from '../config/config';
import Chat from '../models/chat';
import { ITokenFile } from '../store/tokenStore';
import { Exception } from '../types/errors/exceptionError';
import { IdInterface, UserInterface } from '../types/index';
import { parseFullChat, parsePartialChat } from './chatService';
import { notifyPersist, SharesInterface } from './fileShareService';
import { sendEventToConnectedSockets } from './socketService';

const userDirectory = PATH.join(config.baseDir, '/user');
const chatsDirectory = PATH.join(config.baseDir, '/chats');

export const getChatIds = (): IdInterface[] => {
    const locations = fs.readdirSync(chatsDirectory);
    console.log(locations);
    return locations;
};

export const getChat = (id: IdInterface, messagesAmount: number | undefined = undefined): Chat => {
    const path = PATH.join(chatsDirectory, id as string, 'chat.json');
    const chat: Chat = <Chat>JSON.parse(fs.readFileSync(path).toString());
    return messagesAmount === undefined ? parseFullChat(chat) : parsePartialChat(chat, messagesAmount);
};

export const getTokenFile = (): ITokenFile => {
    return JSON.parse(fs.readFileSync(PATH.join(userDirectory, '/tokens.json')).toString());
};

export const saveTokenFile = (tokens: ITokenFile) => {
    fs.writeFileSync(PATH.join(userDirectory, '/tokens.json'), JSON.stringify(tokens, null, 4), {
        flag: 'w',
    });
};

export const getUserdata = () => {
    const location = PATH.join(userDirectory, 'userinfo.json');
    try {
        const data = JSON.parse(fs.readFileSync(location).toString());
        return data;
    } catch {
        throw new Error("Userinfo file doesn't exitst");
    }
};

export enum Key {
    Public = 'publicKey',
    Private = 'privateKey',
}

export const saveKey = (key: string, keyName: Key, force = false) => {
    const path = PATH.join(userDirectory, keyName);
    if (force || !fs.existsSync(path)) {
        fs.writeFileSync(path, key);
    }
};

export const getKey = (keyName: string): string => {
    try {
        return fs.readFileSync(PATH.join(userDirectory, keyName), 'utf8');
    } catch (ex) {
        if ((ex as Exception).code === 'ENOENT') {
            console.log(keyName + ' not found!');
        }
        throw ex;
    }
};

const sortChat = (chat: Chat) => {
    const messages = uniqBy(chat.messages, m => m.id);

    messages.map(m => {
        const replies = uniqBy(m.replies, r => r.id);
        replies.sort((a, b) => a.timeStamp.getTime() - b.timeStamp.getTime());
        m.replies = replies;
    });

    messages.sort((a, b) => a.timeStamp.getTime() - b.timeStamp.getTime());

    chat.messages = messages;

    return chat;
};

export const persistChat = (chat: Chat) => {
    const sortedChat = sortChat(chat);
    const path = PATH.join(chatsDirectory, sortedChat.chatId as string);

    if (!fs.existsSync(path)) {
        fs.mkdirSync(path);
        fs.mkdirSync(PATH.join(path, '/files'));
    }

    fs.writeFileSync(PATH.join(path, '/chat.json'), JSON.stringify(sortedChat, null, 4), {
        flag: 'w',
    });
    sendEventToConnectedSockets('chat_updated', chat);
};
export const deleteChat = (chatId: string) => {
    const path = PATH.join(chatsDirectory, chatId);
    try {
        fs.rmdirSync(path, { recursive: true });
    } catch (e) {
        // console.log(e);
        return false;
    }
    return true;
};

export const persistUserdata = (userData: UserInterface) => {
    const userdata = JSON.stringify(userData, null, 4);
    const location = PATH.join(userDirectory, 'userinfo.json');
    fs.writeFileSync(location, userdata, { flag: 'w' });
    return;
};

export const saveFile = (chatId: IdInterface, messageId: string, file: UploadedFile) => {
    let path = PATH.join(chatsDirectory, chatId as string, 'files', messageId);
    fs.mkdirSync(path);
    path = PATH.join(path, file.name);
    if (file.tempFilePath && file.mv) {
        file.mv(path);
    } else if (file.data) {
        fs.writeFileSync(path, file.data);
    }
    return path;
};

export const saveAvatar = async (file: UploadedFile, id: string) => {
    const path = PATH.join(userDirectory, `avatar-${id}`);
    //const path = PATH.join(userDirectory, `avatar-default`);
    console.log(path);
    const tempPath = PATH.join(userDirectory, `temp-avatar-${id}`);
    console.log(tempPath);
    await file.mv(tempPath);
    await resizeAvatar(tempPath, path);
    fs.unlinkSync(tempPath);
};

export const deleteAvatar = (id: string) => {
    const path = PATH.join(userDirectory, `avatar-${id}`);
    fs.unlinkSync(path);
};

export const resizeAvatar = async (from: string, to: string): Promise<unknown> => {
    return new Promise((resolve, reject) => {
        im.resize(
            {
                srcPath: from,
                dstPath: to,
                width: 64,
            },
            (err: Error, result) => {
                if (err) {
                    reject(err);
                }
                resolve(result);
            }
        );
    });
};

export const persistBlocklist = (blockList: string[]) => {
    const location = PATH.join(userDirectory, 'blocklist.json');
    fs.writeFileSync(location, JSON.stringify(blockList, null, 4), {
        flag: 'w',
    });
};

export const getBlocklist = (): string[] => {
    const location = PATH.join(userDirectory, 'blocklist.json');
    try {
        return JSON.parse(fs.readFileSync(location).toString());
    } catch {
        return [];
    }
};

export const getShareConfig = (): SharesInterface => {
    const location = PATH.join(userDirectory, 'shares.json');
    try {
        return JSON.parse(fs.readFileSync(location, 'utf8'));
    } catch (ex) {
        if ((ex as Exception).code === 'ENOENT') {
            console.log('Shares.json not found!');
            const obj = <SharesInterface>{
                Shared: [],
                SharedWithMe: [],
            };
            const json = JSON.stringify(obj);
            fs.writeFileSync(location, json);
            return JSON.parse(fs.readFileSync(location, 'utf8'));
        }
    }
};

export const persistShareConfig = (config: SharesInterface) => {
    const location = PATH.join(userDirectory, 'shares.json');
    fs.writeFileSync(location, JSON.stringify(config, null, 2), {
        flag: 'w',
    });
    notifyPersist(config);
};
