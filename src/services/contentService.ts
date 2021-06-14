import { MessageTypes } from '@/types';

const isImage = filename => {
    return (
        filename.indexOf('.gif') !== -1 ||
        filename.indexOf('.png') !== -1 ||
        filename.indexOf('.jpg') !== -1 ||
        filename.indexOf('.jpeg') !== -1
    );
};

const isAudio = filename => {
    return filename.indexOf('.mp3') !== -1 || filename.indexOf('.WebM') !== -1;
};

export const getComponentForType = message => {
    switch (message.type) {
        case MessageTypes.STRING:
            return 'StringContent';
        case MessageTypes.GIF:
            return 'GifContent';
        case MessageTypes.QUOTE:
            return 'QuoteContent';
        case MessageTypes.SYSTEM:
            return 'SystemContent';
        case MessageTypes.FILE:
            if (isImage(message.body.filename)) {
                return 'ImageContent';
            }
            if (isAudio(message.body.filename)) {
                return 'AudioContent';
            }

            return 'FileContent';
        default:
            return 'StringContent';
    }
};
