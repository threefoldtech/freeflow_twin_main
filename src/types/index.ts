export interface User extends Contact {
    image: string;
    email: string;
    status: string;
}

export interface App {
    id: string;
    name: string;
    url: string;
    iconUrl: string;
    sharedWith: User[];
    accessHistory: User[];
}

export interface Tab {
    name: string;
    icon: string;
}

export interface userMessagesContainer {
    id: DtId;
    messages: Message<MessageBodyType>[];
}

export interface Message<T> {
    id: Id;
    from: DtId;
    to: Id | DtId;
    body: T;
    timeStamp: Date;
    type: MessageBodyType | String;
    subject: Id | null;
    replies: Message<MessageBodyType>[];
    updated?: Date;
}

export interface MessageBodyType {}

export interface StringMessageType extends String, MessageBodyType {}

export interface QuoteBodyType extends MessageBodyType {
    message: string;
    quotedMessage: Message<MessageBodyType>;
}
export interface GroupUpdate extends MessageBodyType {
    type: string;
    contact: Contact;
    chat: Chat;
    adminLocation: string;
}

export interface Chat {
    chatId: Id;
    messages: Message<MessageBodyType>[];
    read: {
        [key: string]: string;
    };
    contacts: (AnonymousContact | Contact)[];
    acceptedChat: boolean;
    name: string;
    isGroup: boolean;
    adminId: Id;
}
export interface PersonChat extends Chat {}

export interface GroupChat extends Chat {}

export interface Contact extends AnonymousContact {
    location: string;
}

export interface AnonymousContact {
    id: DtId;
}

export interface DtId extends Id {}

export interface Id extends String {}

export interface Workspace extends GroupChat {
    subGroups: GroupChat[];
}

export enum SystemMessageTypes {
    REMOVE_USER = 'REMOVEUSER',
    ADD_USER = 'ADDUSER',
    JOINED_VIDEOROOM = 'JOINED_VIDEOROOM',
    CONTACT_REQUEST_SEND = 'CONTACT_REQUEST_SEND',
}

export enum FileTypes {
    RECORDING = 'RECORDING',
    OTHER = 'OTHER',
}

export interface GroupManagementBody extends SystemBody {
    adminLocation: any;
    contact: Contact;
}
export interface JoinedVideoRoomBody extends SystemBody {
    id: string;
}

export interface SystemBody {
    type?: SystemMessageTypes;
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
    chatId: string | undefined;
    types: SharePermission[];
}

export interface ContactInterface {
    id: string;
    location: string;
}
