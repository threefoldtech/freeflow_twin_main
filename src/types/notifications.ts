import { uuidv4 } from '@/common';

export enum Status {
    Info = 'Info',
    Success = 'Success',
    Error = 'Error'
}

export enum NotificationType {
    Info = 'Info',
    Progress = 'Progress'
}

type Callback = (n: Notification) => void;

export interface NotificationOptions {
    interval: number;
    destroy: Callback;
    update: Callback;
}

export interface ProgressNotificationOptions extends NotificationOptions {
    onSuccess?: <T>(n: T) => void | undefined;
    onFailed?: <T>(n: T) => void | undefined;
}

export interface Notification<T extends NotificationOptions = NotificationOptions> {
    id: string;
    type: NotificationType;
    title: string;
    text: string;
    options: T;
    status: Status;
}

export interface ProgressNotification extends Notification<ProgressNotificationOptions> {
    max: number;
    progress: number;
}

export const format = (source: string, params: string[]) => {
    params.forEach((val, i) => {
        source = source.replace(new RegExp('\\{' + i + '\\}', 'g'), val);
    });
    return source;
};