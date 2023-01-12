import {
    AudioFileExtension,
    ImageFileExtension,
    SimpleFileExtension,
    VideoFileExtension,
} from 'custom-types/file-actions.type';

export const isImage = filename => {
    if (!filename) return false;
    return Object.values(ImageFileExtension).includes(filename.split('.').pop());
};

export const isAudio = filename => {
    return Object.values(AudioFileExtension).includes(filename.split('.').pop());
};

export const isSimpleTextFile = fileName => {
    if (!fileName) return false;
    return Object.values(SimpleFileExtension).includes(fileName.split('.').pop());
};

export const isVideo = filename => {
    if (!filename) return false;
    return Object.values(VideoFileExtension).includes(filename.split('.').pop());
};

export const extensionToLanguage = (extension: string) => {
    switch (extension) {
        case SimpleFileExtension.JS:
            return 'javascript';
        case SimpleFileExtension.TXT:
            return 'text';
        case SimpleFileExtension.JSON:
            return 'json';
        case SimpleFileExtension.HTML:
            return 'html';
        case SimpleFileExtension.TS:
            return 'typescript';
        case SimpleFileExtension.CSS:
            return 'css';
        case SimpleFileExtension.SCSS:
            return 'scss';
        case SimpleFileExtension.XML:
            return 'xml';
        case SimpleFileExtension.YML:
            return 'yaml';
        case SimpleFileExtension.YAML:
            return 'yaml';
        case SimpleFileExtension.MD:
            return 'markdown';
        case SimpleFileExtension.MARKDOWN:
            return 'markdown';
        case SimpleFileExtension.PYTHON:
            return 'python';
        default:
            return 'text';
    }
};
