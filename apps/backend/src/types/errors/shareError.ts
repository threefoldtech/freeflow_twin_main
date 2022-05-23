import { ErrorWrapper } from './errorWrapper';
import { StatusCodes } from 'http-status-codes';

export enum ShareErrorType {
    ShareNotFound,
    ShareExpired,
}

const mapShareErrorToHttpError = (error: ShareErrorType) => {
    switch (error) {
        case ShareErrorType.ShareNotFound:
            return StatusCodes.UNAUTHORIZED;
        case ShareErrorType.ShareExpired:
            return StatusCodes.UNAUTHORIZED;
        default:
            return StatusCodes.INTERNAL_SERVER_ERROR;
    }
};

export class ShareError extends ErrorWrapper<ShareErrorType> {
    getHttpStatus = () => mapShareErrorToHttpError(this.status);
}
