import {
    IAudioFileExtension,
    IImageFileExtension,
    ISimpleFileExtension,
    IVideoFileExtension,
} from 'custom-types/file-actions.type';

export const isImage = filename => {
    if (!filename) return false;
    return Object.values(IImageFileExtension).includes(filename.split('.').pop());
};

export const isAudio = filename => {
    return Object.values(IAudioFileExtension).includes(filename.split('.').pop());
};

export const isSimpleTextFile = fileName => {
    if (!fileName) return false;
    return Object.values(ISimpleFileExtension).includes(fileName.split('.').pop());
};

export const isVideo = filename => {
    if (!filename) return false;
    return Object.values(IVideoFileExtension).includes(filename.split('.').pop());
};

export const extensionToLanguage = (extension: string) => {
    switch (extension) {
        case ISimpleFileExtension.TXT:
            return 'javascript';
        case ISimpleFileExtension.JSON:
            return 'json';
        case ISimpleFileExtension.HTML:
            return 'html';
        case ISimpleFileExtension.JS:
            return 'javascript';
        case ISimpleFileExtension.TS:
            return 'typescript';
        case ISimpleFileExtension.CSS:
            return 'css';
        case ISimpleFileExtension.SCSS:
            return 'scss';
        case ISimpleFileExtension.XML:
            return 'xml';
        case ISimpleFileExtension.YML:
            return 'yaml';
        case ISimpleFileExtension.YAML:
            return 'yaml';
        case ISimpleFileExtension.MD:
            return 'markdown';
        case ISimpleFileExtension.MARKDOWN:
            return 'markdown';
        case ISimpleFileExtension.PYTHON:
            return 'python';
        default:
            return 'text';
    }
};
