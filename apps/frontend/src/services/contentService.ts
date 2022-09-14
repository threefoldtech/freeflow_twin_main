export const isImage = filename => {
    if (!filename) return false;
    return (
        filename.indexOf('.gif') !== -1 ||
        filename.indexOf('.png') !== -1 ||
        filename.indexOf('.jpg') !== -1 ||
        filename.indexOf('.JPG') !== -1 ||
        filename.indexOf('.jpeg') !== -1
    );
};

export const isAudio = filename => {
    return filename?.indexOf('.mp3') !== -1 || filename.indexOf('.WebM') !== -1;
};

export const isSimpleTextFile = fileName => {
    if (!fileName) return false;
    return (
        fileName.indexOf('txt') !== -1 ||
        fileName.indexOf('json') !== -1 ||
        fileName.indexOf('html') !== -1 ||
        fileName.indexOf('js') !== -1 ||
        fileName.indexOf('ts') !== -1 ||
        fileName.indexOf('css') !== -1 ||
        fileName.indexOf('scss') !== -1 ||
        fileName.indexOf('xml') !== -1 ||
        fileName.indexOf('yml') !== -1 ||
        fileName.indexOf('yaml') !== -1 ||
        fileName.indexOf('md') !== -1 ||
        fileName.indexOf('markdown') !== -1 ||
        fileName.indexOf('python') !== -1
    );
};

export const extensionToLanguage = (extension: string) => {
    switch (extension) {
        case 'js':
            return 'javascript';
        case 'ts':
            return 'typescript';
        case 'html':
            return 'html';
        case 'css':
            return 'css';
        case 'scss':
            return 'scss';
        case 'yml':
            return 'yaml';
        case 'yaml':
            return 'yaml';
        case 'md':
            return 'markdown';
        case 'markdown':
            return 'markdown';
        case 'python':
            return 'python';
        default:
            return 'text';
    }
};

export const isVideo = filename => {
    if (!filename) return false;
    return (
        filename?.indexOf('.mp4') !== -1 ||
        filename?.indexOf('.mov') !== -1 ||
        filename?.indexOf('.avi') !== -1 ||
        filename?.indexOf('.mkv') !== -1 ||
        filename?.indexOf('.flv') !== -1 ||
        filename?.indexOf('.wmv') !== -1 ||
        filename?.indexOf('.mpg') !== -1 ||
        filename?.indexOf('.mpeg') !== -1 ||
        filename?.indexOf('.m4v') !== -1 ||
        filename?.indexOf('.3gp') !== -1 ||
        filename?.indexOf('.3g2') !== -1 ||
        filename?.indexOf('.m2ts') !== -1 ||
        filename?.indexOf('.mts') !== -1 ||
        filename?.indexOf('.mpe') !== -1
    );
};
