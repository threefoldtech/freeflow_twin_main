import { Request } from 'express';
import { SessionData } from 'express-session';

declare module 'express-session' {
    interface SessionData {
        [key: string]: any;
    }
}
