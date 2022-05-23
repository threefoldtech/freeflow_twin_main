import { SharedFileInterface } from '../service/fileShareService';

export interface UserInterface extends AnonymousContactInterface {
    image: string;
    status: string;
    lastSeen: number;
}

export interface AppInterface {
    id: string;
    name: string;
    url: string;
    iconUrl: string;
    sharedWith: UserInterface[];
    accessHistory: UserInterface[];
}

export interface TabInterface {
    name: string;
    icon: string;
}

export enum MessageTypes {
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
    POST_DELETE = 'POST_DELETE',
}

export enum MessageAction {
    EDIT = 'EDIT',
    REPLY = 'REPLY',
}

export enum SystemMessageType {
    ADDUSER = 'ADDUSER',
    REMOVEUSER = 'REMOVEUSER',
    JOINED_VIDEOROOM = 'JOINED_VIDEOROOM',
    CONTACT_REQUEST_SEND = 'CONTACT_REQUEST_SEND',
    USER_LEFT_GROUP = 'USER_LEFT_GROUP',
}

export enum FileTypes {
    RECORDING = 'RECORDING',
    OTHER = 'OTHER',
}

export enum MessageOperations {
    NEW = 'NEW',
    UPDATE = 'UPDATE',
    DELETE = 'DELETE',
}

export interface MessageInterface<T> extends MessageBodyTypeInterface {
    id: IdInterface;
    from: DtIdInterface;
    to: IdInterface | DtIdInterface;
    body: T;
    type: MessageTypes;
    timeStamp: Date;
    subject: IdInterface | null;
    replies: MessageInterface<MessageBodyTypeInterface>[];
    signatures: string[];
    updated?: Date | undefined;
    action?: MessageAction;
}

export interface MessageBodyTypeInterface {}

export type StringMessageTypeInterface = MessageBodyTypeInterface;

export interface ContactRequest extends MessageBodyTypeInterface, ContactInterface {}

export interface FileMessageType extends MessageBodyTypeInterface {
    type: FileTypes;
    filename: string;
    url: string;
}

export interface FileShareMessageType extends MessageBodyTypeInterface, SharedFileInterface {}

export interface FileShareDeleteMessageType extends MessageBodyTypeInterface, String {}

export interface FileShareUpdateMessageType extends MessageBodyTypeInterface, SharedFileInterface {}

export interface SystemMessageInterface extends MessageBodyTypeInterface {
    type: SystemMessageType;
}

export interface GroupUpdateType extends SystemMessageInterface {
    contact: ContactInterface;
    adminLocation: string;
    nextAdmin?: string;
}

export interface ChatInterface {
    chatId: IdInterface;
    messages: MessageInterface<MessageBodyTypeInterface>[];
    read: {
        [key: string]: string;
    };
    name: string;
}

export interface PersonChatInterface extends ChatInterface {
    chatId: DtIdInterface;
    messages: MessageInterface<MessageBodyTypeInterface>[];
}

export interface GroupChatInterface extends ChatInterface {
    chatId: IdInterface;
    contacts: (AnonymousContactInterface | ContactInterface)[];
}

export interface ContactInterface extends AnonymousContactInterface {
    id: DtIdInterface;
    location: string;
}

export interface AnonymousContactInterface {
    id: DtIdInterface;
}

export type DtIdInterface = IdInterface;

export type IdInterface = string;

export interface WorkspaceInterface extends GroupChatInterface {
    subGroups: GroupChatInterface[];
}

export enum POST_TYPE {
    SOCIAL_POST = 'SOCIAL_POST',
}

export enum POST_ACTIONS {
    POST_DELETE = 'POST_DELETE',
}

export interface POST_MODEL {
    id: string;
    type: POST_TYPE;
    body: string;
    isGroupPost: boolean;
    createdOn: Date;
    lastModified: Date;
}

interface POST_OWNER {
    id: string;
    location: string;
}

export enum MESSAGE_TYPE {
    COMMENT = 'COMMENT',
    COMMENT_REPLY = 'COMMENT_REPLY',
}

interface LIKE_MODEL extends POST_OWNER {}
interface COMMENT_OWNER extends POST_OWNER {}

interface POST_IMAGE {
    name: string;
    data: object;
    size: number;
    encoding: string;
    tempFilePath: string;
    truncated: boolean;
    mimetype: string;
    md5: string;
    path: string;
}

export interface COMMENT_MODEL {
    id: string;
    body: string;
    owner: COMMENT_OWNER;
    post: {
        id: string;
        owner: POST_OWNER;
    };
    type: MESSAGE_TYPE;
    replies: COMMENT_MODEL[];
    createdOn: Date;
    likes: LIKE_MODEL[];
    replyTo?: string | undefined;
    isReplyToComment: boolean;
}

export interface SOCIAL_POST {
    post: POST_MODEL;
    owner: POST_OWNER;
    likes: LIKE_MODEL[];
    images: POST_IMAGE[];
    replies: COMMENT_MODEL[];
    isTyping?: String[];
    action?: POST_ACTIONS;
}
