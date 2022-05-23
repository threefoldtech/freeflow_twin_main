import express from 'express';
import { StatusCodes } from 'http-status-codes';

import { config } from '../config/config';
import { yggdrasilIsInitialized } from '../index';
import { HttpError } from '../types/errors/httpError';

/**
 * Handles authentication check
 * @param error
 * @param request
 * @param response
 * @param next
 */

export const requiresAuthentication = (
    error: Error,
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
): express.Response | void => {
    const userId = request?.session?.userId;
    const isDevelopmentMode = process.env.ENVIRONMENT === 'development';
    if (!userId && (!isDevelopmentMode || !yggdrasilIsInitialized)) {
        throw new HttpError(StatusCodes.UNAUTHORIZED);
    }
    if (userId !== config.userid) {
        throw new HttpError(StatusCodes.UNAUTHORIZED);
    }

    next();
};
