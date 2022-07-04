export const FileAction = {
    ADD_TO_CHAT: 'ADD_TO_CHAT',
    CHANGE_AVATAR: 'CHANGE_AVATAR',
    ADD_TO_POST: 'ADD_TO_POST',
    ADD_TO_QUANTUM: 'ADD_TO_QUANTUM',
};
export type FileAction = typeof FileAction[keyof typeof FileAction];

const FileType = {
    RECORDING: 'RECORDING',
    OTHER: 'OTHER',
};
export type FileType = typeof FileType[keyof typeof FileType];

export interface IChatFile {
    messageId: string;
    chatId: string;
    type: FileType;
    filename: string;
}

export interface IPostFile {
    postId: string;
    filename: string;
}

export interface IAvatarFile {
    filename: string;
}

export interface IQuantumFile {
    filename: string;
    path: string;
}
