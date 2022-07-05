import { ErrorWrapper } from './errorWrapper';
import { StatusCodes } from 'http-status-codes';

export class HttpError extends ErrorWrapper<StatusCodes> {
    getHttpStatus = () => this.status;
}
