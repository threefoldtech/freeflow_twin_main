export enum FileAction {
    ADD_TO_CHAT = 'ADD_TO_CHAT',
    CHANGE_AVATAR = 'CHANGE_AVATAR',
    ADD_TO_POST = 'ADD_TO_POST',
}

export enum FileType {
    RECORDING = 'RECORDING',
    OTHER = 'OTHER',
}

export interface ChatFile {
    messageId: string;
    chatId: string;
    type: FileType;
    filename: string;
}

export interface PostFile {
    postId: string;
    filename: string;
}
