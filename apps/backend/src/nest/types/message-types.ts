import { FileType } from 'custom-types/file-actions.type';

import { ContactDTO } from '../features/contact/dtos/contact.dto';
import { IFileShare } from '../features/quantum/interfaces/file-share.interface';

export interface MessageBody {
    message: string;
    type: MessageType;
}

export interface ContactRequest {
    id: string;
    location: string;
}

export interface FileMessage {
    type: FileType;
    filename: string;
    url: string;
}

export interface SystemMessage {
    type: SystemMessageType;
}

export interface UserLeftGroupMessage extends SystemMessage {
    contact: ContactDTO;
    nextAdmin: string;
}

export interface GroupUpdate extends SystemMessage {
    contact: ContactDTO;
    adminLocation: string;
}

export type IFileShareMessage = IFileShare;

export enum MessageType {
    STRING = 'STRING',
    SYSTEM = 'SYSTEM',
    GIF = 'GIF',
    MESSAGE = 'MESSAGE',
    FILE = 'FILE',
    FILE_UPLOAD = 'FILE_UPLOAD',
    FILE_SHARE = 'FILE_SHARE',
    FILE_SHARE_UPDATE = 'FILE_SHARE_UPDATE',
    FILE_SHARE_REQUEST = 'FILE_SHARE_REQUEST',
    EDIT = 'EDIT',
    READ = 'READ',
    CONTACT_REQUEST = 'CONTACT_REQUEST',
    DELETE = 'DELETE',
    GROUP_UPDATE = 'GROUP_UPDATE',
    QUOTE = 'QUOTE',
    FILE_SHARE_DELETE = 'FILE_SHARE_DELETE',
    DOWNLOAD_ATTACHMENT = 'DOWNLOAD_ATTACHMENT',
}

export enum SystemMessageType {
    ADD_USER = 'ADD_USER',
    REMOVE_USER = 'REMOVE_USER',
    JOINED_VIDEOROOM = 'JOINED_VIDEOROOM',
    CONTACT_REQUEST_SEND = 'CONTACT_REQUEST_SEND',
    USER_LEFT_GROUP = 'USER_LEFT_GROUP',
    DEFAULT = 'DEFAULT',
}
