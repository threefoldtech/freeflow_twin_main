import { SessionData } from 'express-session';
import { Request } from 'express';

declare module 'express-session' {
    interface SessionData {
        [key: string]: any;
    }
}
