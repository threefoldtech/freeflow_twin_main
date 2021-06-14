import { ref } from 'vue';
import {
    Notification,
    NotificationOptions,
    NotificationType,
    ProgressNotification,
    ProgressNotificationOptions,
    Status,
} from '@/types/notifications';
import { uuidv4 } from '@/common';

export const notifications = ref<Notification[]>([]);
export const addNotification = (n: Notification) => notifications.value.push(n);
export const destroyNotification = (n: Notification) => {
    notifications.value = notifications.value.filter(x => x.id !== n.id);
};

const canDestroy = (n: Notification) => {
    switch (n.type) {
        case NotificationType.Progress: return n.status === Status.Success;
        default: return true;
    }
}

export const getKey = (n: Notification) => {
    const key = `${n.id}-${n.status}`
    switch (n.type) {
        case NotificationType.Progress: return `${key}-${(n as ProgressNotification).progress}`
        default: return true;
    }
}

export const updateNotification = (n: Notification) => {
    const index = notifications.value.findIndex(x => x.id === n.id);
    if(index === -1) return;
    const copy = {...n};

    if(checkCompletion(n)) return;
    notifications.value.splice(index, 1, copy);

    if(!canDestroy(n)) return;
    setTimeout(() => destroyNotification(n), n.options?.interval ?? 5000);
}

export const checkCompletion = (notification: Notification) => {
    if(notification.type === NotificationType.Info || notification.status === Status.Success) return;
    const progressNotification = notification as ProgressNotification;
    if(progressNotification.progress !== progressNotification.max) return;
    success(progressNotification);
    return true;
}

export const fail = (notification: ProgressNotification) => {
    if(notification.status === Status.Error) return;
    notification.status = Status.Error;
    updateNotification(notification);
}

export const success = (notification: ProgressNotification) => {
    if(notification.status === Status.Success) return;
    notification.status = Status.Success;
    updateNotification(notification);
}

const defaultOptions = {
    interval: 5000,
    destroy: destroyNotification,
    update: updateNotification
} as NotificationOptions;

export const createNotification = (title: string, text: string, options = defaultOptions) => {
    const newOptions = {
        ...defaultOptions,
        ...options,
    };
    const n = {
        id: uuidv4(),
        type: NotificationType.Info,
        title: title,
        text: text,
        options: newOptions,
        status: Status.Info
    } as Notification
    addNotification(n);
    return n;
};

export const createErrorNotification = (title: string, text: string, options = defaultOptions) => {
    const newOptions = {
        ...defaultOptions,
        ...options,
    };
    const n = {
        id: uuidv4(),
        type: NotificationType.Info,
        title: title,
        text: text,
        options: newOptions,
        status: Status.Error
    } as Notification
    addNotification(n);
    return n;
};

export const createPercentProgressNotification = (title: string, text: string, start = 0, options = defaultOptions as ProgressNotificationOptions) => {
    const newOptions = {
        ...defaultOptions,
        ...options,
    } as ProgressNotificationOptions;
    const n = {
        id: uuidv4(),
        type: NotificationType.Progress,
        title: title,
        text: text,
        options: newOptions,
        status: Status.Info,
        progress: start,
        max: 1
    } as ProgressNotification
    notifications.value.push(n);
    return n;
};

export const createProgressNotification = (title: string, text, max: number, interval = 5000, start = 0, options = defaultOptions as ProgressNotificationOptions) => {
    const newOptions = {
        ...defaultOptions,
        ...options,
    } as ProgressNotificationOptions;
    const n = {
        id: uuidv4(),
        type: NotificationType.Progress,
        title: title,
        text: text,
        options: newOptions,
        status: Status.Info,
        progress: start,
        max: max
    } as ProgressNotification
    addNotification(n);
    return n;
};


