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

export enum SimpleFileExtension {
    TXT = 'txt',
    JSON = 'json',
    HTML = 'html',
    JS = 'js',
    TS = 'ts',
    CSS = 'css',
    SCSS = 'scss',
    XML = 'xml',
    YML = 'yml',
    YAML = 'yaml',
    MD = 'md',
    MARKDOWN = 'markdown',
    PYTHON = 'python',
}

export enum FileTypes {
    IMAGE = 'image',
    VIDEO = 'video',
    SIMPLE = 'simpleFile',
}

export enum ImageFileExtension {
    GIF = 'gif',
    PNG = 'png',
    JPG = 'jpg',
    JPEG = 'jpeg',
}

export enum AudioFileExtension {
    MP3 = 'mp3',
    WEBM = 'WebM',
    WAV = 'wav',
}

export enum VideoFileExtension {
    MP4 = 'mp4',
    MOV = 'mov',
    AVI = 'avi',
    MKV = 'mkv',
    FLV = 'flv',
    WMV = 'wmv',
    MPG = 'mpg',
    MPEG = 'mpeg',
    M4V = 'm4v',
    THREE_GP = '3gp',
    THREE_G2 = '3g2',
    M2TS = 'm2ts',
    MTS = 'mts',
    MPE = 'mpe',
}
