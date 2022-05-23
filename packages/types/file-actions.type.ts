export enum FileAction {
    ADD_TO_CHAT = 'ADD_TO_CHAT',
    CHANGE_AVATAR = 'CHANGE_AVATAR',
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
