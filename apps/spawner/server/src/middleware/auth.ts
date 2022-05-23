import { Request, Response, NextFunction } from 'express';

export const authMiddleware = (request: Request, response: Response, next: NextFunction) => {
    const userId = request.session?.userId;

    if (!userId) {
        throw new Error('UNAUTHORIZED');
    }
    next();
};
