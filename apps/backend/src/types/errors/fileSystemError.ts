import { ErrorWrapper } from './errorWrapper';
import { StatusCodes } from 'http-status-codes';

export enum FileSystemErrorType {
    FileNotFound,
    PathDoesNotExist,
    WrongFormat,
    ForbidTraversal,
}

const mapFileSystemErrorToHttpError = (error: FileSystemErrorType) => {
    switch (error) {
        case FileSystemErrorType.WrongFormat:
        case FileSystemErrorType.ForbidTraversal:
            return StatusCodes.BAD_REQUEST;
        case FileSystemErrorType.PathDoesNotExist:
        case FileSystemErrorType.FileNotFound:
            return StatusCodes.NOT_FOUND;
        default:
            return StatusCodes.INTERNAL_SERVER_ERROR;
    }
};

export class FileSystemError extends ErrorWrapper<FileSystemErrorType> {
    getHttpStatus = () => mapFileSystemErrorToHttpError(this.status);
}
