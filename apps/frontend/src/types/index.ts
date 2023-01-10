import { MessageAction } from '@/store/chatStore';

export interface User extends Contact {
    image: string;
    email: string;
    status: string;
}

export interface Message<T> {
    id: string;
    chatId: string;
    from: string;
    to: string;
    body: T;
    timeStamp: Date;
    type: MessageBodyType | String;
    subject: string | null;
    replies: Message<any>[];
    updated?: Date;
    action?: MessageAction;
}

export interface MessageBodyType {
    filename?: string;
    type?: FileTypes;
    url?: string;
}

export interface StringMessageType extends String, MessageBodyType {}

export interface QuoteBodyType extends MessageBodyType {
    message: string;
    quotedMessage: Message<any>;
}

interface IRead {
    userId: string;
    messageId: string;
}

export interface Chat {
    chatId: string;
    messages: Message<any>[];
    read: IRead[];
    contacts: (GroupContact | Contact)[];
    acceptedChat: boolean;
    name: string;
    isGroup: boolean;
    adminId: string;
    draft: Message<MessageBodyType>;
}

export interface Contact extends AnonymousContact {
    location: string;
    app_Id?: string;
}

export interface DtContact {
    appId: string;
    derivedPublicKey: string;
    location: string;
    username: string;
}

export interface GroupContact extends Contact {
    roles: Roles[];
}

export interface AnonymousContact {
    id: string;
}

export interface GroupChat extends Chat {}

export enum Roles {
    USER = 'USER',
    MODERATOR = 'MODERATOR',
    ADMIN = 'ADMIN',
}

export enum SystemMessageTypes {
    REMOVE_USER = 'REMOVE_USER',
    ADD_USER = 'ADD_USER',
    JOINED_VIDEO_ROOM = 'JOINED_VIDEO_ROOM',
    CONTACT_REQUEST_SEND = 'CONTACT_REQUEST_SEND',
    USER_LEFT_GROUP = 'USER_LEFT_GROUP',
    CHANGE_USER_ROLE = 'CHANGE_USER_ROLE',
}

export enum FileTypes {
    RECORDING = 'RECORDING',
    OTHER = 'OTHER',
}

export interface GroupManagementBody extends SystemBody {
    adminLocation: string;
    contact: Contact;
    nextAdmin?: string;
}

export interface JoinedVideoRoomBody extends SystemBody {
    id: string;
}

export interface SystemBody {
    type?: SystemMessageTypes;
    id?: string;
    message: string;
}

export interface GetMessagesResponse {
    hasMore: boolean;
    messages: Array<Message<MessageBodyType>>;
}

export enum MessageTypes {
    STRING = 'STRING',
    SYSTEM = 'SYSTEM',
    GIF = 'GIF',
    MESSAGE = 'MESSAGE',
    FILE = 'FILE',
    FILE_UPLOAD = 'FILE_UPLOAD',
    FILE_SHARE = 'FILE_SHARE',
    FILE_SHARE_REQUEST = 'FILE_SHARE_REQUEST',
    EDIT = 'EDIT',
    READ = 'READ',
    CONTACT_REQUEST = 'CONTACT_REQUEST',
    DELETE = 'DELETE',
    QUOTE = 'QUOTE',
    POST_SHARE = 'POST_SHARE',
}

export interface SharedFileInterface {
    id: string;
    path: string;
    owner: ContactInterface;
    name: string | undefined;
    isFolder: Boolean;
    size: number | undefined;
    lastModified: number | undefined;
    permissions: SharePermissionInterface[];
}

export enum SharePermission {
    Read = 'r',
    Write = 'w',
}

export interface SharePermissionInterface {
    userId: string | undefined;
    sharePermissionTypes: SharePermission[];
    name?: string;
}

export interface ContactInterface {
    id: string;
    location: string;
}

export interface FileShareMessageType extends MessageBodyType, SharedFileInterface {}
