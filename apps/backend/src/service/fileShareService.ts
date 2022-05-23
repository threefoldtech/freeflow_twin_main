import { uuidv4 } from '../common';
import { config } from '../config/config';
import Chat from '../models/chat';
import Message from '../models/message';
import {
    AnonymousContactInterface,
    ContactInterface,
    FileShareDeleteMessageType,
    FileShareMessageType,
    FileShareUpdateMessageType,
    IdInterface,
    MessageBodyTypeInterface,
    MessageTypes,
} from '../types';
import { sendMessageToApi } from './apiService';
import { persistMessage } from './chatService';
import { getChat, getShareConfig, persistChat, persistShareConfig } from './dataService';
import { appendSignatureToMessage } from './keyService';
import { getMyLocation } from './locationService';
import { parseMessage, renameShareInChat } from './messageService';
import { sendEventToConnectedSockets } from './socketService';

export enum ShareStatus {
    Shared = 'Shared',
    SharedWithMe = 'SharedWithMe',
}

export enum SharePermission {
    Read = 'r',
    Write = 'w',
}

export interface SharePermissionInterface {
    chatId: string | undefined;
    types: SharePermission[];
}

export interface SharedFileInterface {
    id: string;
    path: string;
    owner: ContactInterface;
    name: string | undefined;
    isFolder: boolean;
    size: number | undefined;
    lastModified: number | undefined;
    permissions: SharePermissionInterface[];
}

export interface SharesInterface {
    Shared: SharedFileInterface[];
    SharedWithMe: SharedFileInterface[];
}

// function epoch(date: Date = new Date()) {
//     return new Date(date).getTime();
// }

// function epochToDate(epoch: number) {
//     if (epoch < 10000000000) epoch *= 1000; // convert to milliseconds (Epoch is usually expressed in seconds, but Javascript uses Milliseconds)
//     epoch = epoch + new Date().getTimezoneOffset() * -1; //for timeZone
//     return new Date(epoch);
// }

export const updateSharePath = (oldPath: string, newPath: string) => {
    const allShares = getShareConfig();
    const share = allShares.Shared.find(share => share.path == oldPath);
    if (!share) throw new Error(`Share doesn't exist`);
    share.path = newPath;
    persistShareConfig(allShares);
    notifySharedWithConsumers(share);
};

export const updateShareName = (id: string, name: string) => {
    const allShares = getShareConfig();
    const share = allShares.Shared.find(share => share.id == id);
    if (!share) throw new Error(`Share doesn't exist`);
    share.name = name;
    persistShareConfig(allShares);
    notifySharedWithConsumers(share);
};
const notifySharedWithConsumers = (share: SharedFileInterface) => {
    share.permissions.map(async (permission: SharePermissionInterface) => {
        const body: FileShareUpdateMessageType = {
            id: share.id,
            isFolder: share.isFolder,
            lastModified: share.lastModified,
            name: share.name,
            owner: share.owner,
            path: share.path,
            permissions: [permission],
            size: share.size,
        };
        const message: Message<MessageBodyTypeInterface> = parseMessage({
            id: uuidv4(),
            to: permission.chatId,
            body,
            from: config.userid,
            type: MessageTypes.FILE_SHARE_UPDATE,
            timeStamp: new Date(),
            replies: [],
            signatures: [],
            subject: null,
        });
        appendSignatureToMessage(message);
        const chat = getChat(permission.chatId, 0);

        renameShareInChat(message.body as FileShareMessageType, chat.contacts);

        chat.contacts.forEach(contact => {
            sendMessageToApi(contact.location, message);
        });
    });
};
export const notifyDeleteSharePermission = (
    permission: SharePermissionInterface,
    shareId: string,
    location: string
) => {
    const message: Message<MessageBodyTypeInterface> = parseMessage({
        id: uuidv4(),
        to: permission.chatId,
        body: shareId,
        from: config.userid,
        type: MessageTypes.FILE_SHARE_DELETE,
        timeStamp: new Date(),
        replies: [],
        signatures: [],
        subject: null,
    });
    appendSignatureToMessage(message);
    sendMessageToApi(location, message);
    // const chat = getChat(permission.chatId, 0);
    // chat.contacts.forEach(contact => {
    // console.log('looping chats');
    // sendMessageToApi(contact.location, message);
    // });
};

export const removeFilePermissions = (path: string, chatId: string, location: string) => {
    const allShares = getShareConfig();
    const shareIndex = allShares.Shared.findIndex(share => share.path === path);
    if (shareIndex === -1) return;
    const share = allShares.Shared.find(share => share.path === path);
    const index = share.permissions.findIndex(p => p.chatId === chatId);
    const deletedSharedPermission = share.permissions[index];
    share.permissions.splice(index, 1);

    allShares.Shared[shareIndex] = share;
    persistShareConfig(allShares);

    const chat = getChat(chatId);
    chat.messages = chat.messages.filter(m => (m.body as AnonymousContactInterface)?.id !== share.id);
    persistChat(chat);

    notifyDeleteSharePermission(deletedSharedPermission, share.id, location);
};

export const removeShare = (path: string) => {
    const allShares = getShareConfig();
    const shareIndex = allShares.Shared.findIndex(share => share.path === path);
    if (shareIndex === -1) return;
    const deletedShare = allShares.Shared[shareIndex];
    allShares.Shared.splice(shareIndex, 1);
    persistShareConfig(allShares);

    for (const permission of deletedShare.permissions) {
        const chat = getChat(permission.chatId);
        if (!chat) continue;
        const location = chat.contacts.find(con => con.id === permission.chatId)?.location;
        chat.messages = chat.messages.filter(m => (m.body as AnonymousContactInterface)?.id !== deletedShare.id);
        persistChat(chat);
        notifyDeleteSharePermission(permission, deletedShare.id, location);
    }
};
// @TODO implement in above
export const removeSharedWithMe = (path: string) => {
    const allShares = getShareConfig();
    const shareIndex = allShares.SharedWithMe.findIndex(share => share.path === path);
    if (shareIndex === -1) throw new Error(`Share doesn't exist`);
    allShares.SharedWithMe.splice(shareIndex, 1);
    persistShareConfig(allShares);
};

// NOT used anymore?
// export const initFileShares = () => {
//     let config = getShareConfig();
//     // removeExpiredShares(config);
//     persistShareConfig(config);
// };

export const getShareByPath = (
    allShares: SharesInterface,
    path: string,
    shareStatus: ShareStatus
): SharedFileInterface => {
    const share = allShares[shareStatus].reverse().find(share => share.path === path);
    return share;
};

// @todo rename to getShareByChatId
export const getShare = (path: string, chatId: string, shareStatus: ShareStatus) => {
    const allShares = getShareConfig();
    const share = allShares[shareStatus].find(share => share.path === path);
    if (!share) throw new Error(`Share doesn't exist`);
    const userPermissions = share.permissions.find(permission => permission.chatId === chatId);
    return userPermissions;
};
export const getShareWithId = (id: string, shareStatus: ShareStatus): SharedFileInterface => {
    const allShares = getShareConfig();
    return allShares[shareStatus].reverse().find(share => share.id === id);
};

export const appendShare = (
    status: ShareStatus,
    shareId: string,
    path: string,
    name: string | undefined,
    owner: ContactInterface,
    isFolder: boolean,
    size: number | undefined,
    lastModified: number | undefined,
    newSharePermissions: SharePermissionInterface[],
    myChatId: IdInterface
): SharedFileInterface => {
    const allShares = getShareConfig();
    const share: SharedFileInterface = getShareWithId(shareId, status);

    if (!share) {
        const initialShare: SharedFileInterface = {
            id: shareId,
            path,
            name,
            owner,
            size,
            lastModified,
            isFolder,
            permissions: newSharePermissions,
        };
        allShares[status].push(initialShare);
        persistShareConfig(allShares);
        return initialShare;
    }
    share.path = path;
    share.name = name;
    share.isFolder = isFolder;
    share.size = size;
    share.lastModified = lastModified;

    // console.log("p", share.permissions)

    newSharePermissions.forEach(newShare => {
        const existing = share.permissions.find(existingShare => existingShare.chatId == newShare.chatId);

        if (existing) {
            // console.log('has existing', existing)
            existing.types = newShare.types;
            // console.log('updated types', existing.types)
            return;
        }

        share.permissions.push(newShare);
    });

    if (share.owner.id === myChatId) {
        allShares.Shared = [...allShares.Shared.filter(s => s.id !== shareId), share].sort((a, b) => {
            const textA = a.name.toUpperCase();
            const textB = b.name.toUpperCase();
            return textA < textB ? -1 : textA > textB ? 1 : 0;
        });
    } else {
        allShares.SharedWithMe = [...allShares.SharedWithMe.filter(s => s.id !== shareId), share].sort((a, b) => {
            const textA = a.name.toUpperCase();
            const textB = b.name.toUpperCase();
            return textA < textB ? -1 : textA > textB ? 1 : 0;
        });
    }

    persistShareConfig(allShares);
    return share;
};

// export const updateShare = (config: SharedFileInterface, path: string, userId: string | undefined, expiration?: number, writable?: boolean) => {
//     let index = getPathId(config, path);
//     if (!index)
//         throw new Error(`Share for user ${userId ?? 'public'} does not exists`);
//     const share = config[index].shares.find(x => !userId ? x.isPublic : x.userId === userId);
//
//     if (expiration !== undefined)
//         share.expiration = expiration === 0 ? undefined : expiration;
//
//     if (writable !== undefined)
//         share.writable = writable;
//
//     return {
//         id: index,
//         ...share,
//     };
// };

// export const deleteShare = (config: SharedFileInterface, path: string, userId?: string) => {
//     let index = getPathId(config, path);
//     if (!index)
//         return;
//
//     config[index].shares = config[index].shares.filter(x => !userId ? !x.isPublic : x.userId !== userId);
// };

export const createShare = async (
    path: string,
    name: string | undefined,
    isFolder: boolean,
    size: number | undefined,
    lastModified: number | undefined,
    shareStatus: ShareStatus,
    newSharePermissions: SharePermissionInterface[],
    id?: string
) => {
    const mylocation = await getMyLocation();
    const myuser = <ContactInterface>{
        id: config.userid,
        location: mylocation,
    };
    if (!id) id = uuidv4();
    const share = appendShare(
        shareStatus,
        id,
        path,
        name,
        myuser,
        isFolder,
        size,
        lastModified,
        newSharePermissions,
        myuser.id
    );
    return share;
};

// @todo tokens are not used anymore
// export const getShareFromToken = (tokenData: ShareTokenData) => {
//     const config = getShareConfig();
//     const shareConfig = config['Shared'][tokenData.id];
//     if (!shareConfig)
//         throw new ShareError(ShareErrorType.ShareNotFound);

//     const share = shareConfig.permissions.find(x => x.userId === tokenData.userId);
//     if (!share)
//         throw new ShareError(ShareErrorType.ShareNotFound);

//     return {
//         ...share,
//         id: tokenData.id,
//         path: shareConfig.path,
//     };
// };

export const getSharesWithme = (status: ShareStatus) => {
    const config = getShareConfig();
    return config[status];
};

export const handleIncommingFileShare = (message: Message<FileShareMessageType>, chat: Chat) => {
    const shareConfig = message.body;
    if (!shareConfig.name || !shareConfig.owner) return;
    appendShare(
        ShareStatus.SharedWithMe,
        shareConfig.id,
        shareConfig.path,
        shareConfig.name,
        shareConfig.owner,
        shareConfig.isFolder,
        shareConfig.size,
        shareConfig.lastModified,
        shareConfig.permissions,
        message.to
    );
    chat.messages = chat.messages.filter(m => (m.body as AnonymousContactInterface)?.id !== shareConfig.id);
    persistChat(chat);
    persistMessage(chat.chatId, message);
};

export const handleIncommingFileShareUpdate = (message: Message<FileShareMessageType>) => {
    const shareConfig = message.body;

    renameShareInChat(shareConfig);
    if (!shareConfig.name || !shareConfig.owner) return;
    appendShare(
        ShareStatus.SharedWithMe,
        shareConfig.id,
        shareConfig.path,
        shareConfig.name,
        shareConfig.owner,
        shareConfig.isFolder,
        shareConfig.size,
        shareConfig.lastModified,
        shareConfig.permissions,
        message.to
    );
};

export const handleIncommingFileShareDelete = (message: Message<FileShareDeleteMessageType>) => {
    const shareId = message.body;
    // if (!shareConfig.name || !shareConfig.owner) return;
    const share = getShareWithId(shareId.toString(), ShareStatus.SharedWithMe);
    if (!share) return;
    if (share.owner.id != message.from) return;
    removeSharedWithMe(share.path);
    const chat = getChat(message.from);
    if (!chat) return;
    chat.messages = chat.messages.filter(
        m => (m.body as AnonymousContactInterface)?.id !== (shareId as unknown as string)
    );
    persistChat(chat);
};

export const getSharePermissionForUser = (shareId: string, userId: string): SharePermission[] => {
    const share = getShareWithId(shareId, ShareStatus.Shared);
    if (!share) return [];
    const permissions: SharePermission[] = [];

    share.permissions.forEach(permission => {
        const chat = getChat(permission.chatId, 0);
        if (chat.contacts.find(c => c.id === userId)) {
            permission.types.forEach(t => {
                if (!permissions.some(x => x == t)) permissions.push(t);
            });
            return;
        }
    });
    return permissions;
};

export const notifyPersist = (config: SharesInterface) => {
    sendEventToConnectedSockets('shares_updated', config);
};
