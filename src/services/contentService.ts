import { MessageTypes } from '@/types';

export const isImage = filename => {
    return (
        filename.indexOf('.gif') !== -1 ||
        filename.indexOf('.png') !== -1 ||
        filename.indexOf('.jpg') !== -1 ||
        filename.indexOf('.jpeg') !== -1
    );
};

export const isAudio = filename => {
    return filename?.indexOf('.mp3') !== -1 || filename.indexOf('.WebM') !== -1;
};
