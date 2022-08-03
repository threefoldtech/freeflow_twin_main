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

export const isVideo = filename => {
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
