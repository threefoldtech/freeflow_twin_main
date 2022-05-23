/**
 * Handles all the http Errors thrown by the server
 * @param error
 * @param request
 * @param response
 * @param next
 */
import express from 'express';
import { ErrorWrapper } from '../types/errors/errorWrapper';
import { getReasonPhrase, StatusCodes } from 'http-status-codes';

const errorMiddleware = (
    error: Error,
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
): express.Response | void => {
    try {
        next();
    } catch (err) {
        if (error instanceof ErrorWrapper) {
            return response.status(error.getHttpStatus()).send(
                error.data ?? {
                    reason: getReasonPhrase(error.getHttpStatus()),
                    message: error.message,
                }
            );
        }
        return response.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ message: error.message });
    }
};

export default errorMiddleware;
