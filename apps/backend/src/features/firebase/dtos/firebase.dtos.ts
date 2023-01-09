export interface PostIdentificationDto {
    appId: string;
    identifier: string;
}

export interface PostNotificationDto {
    timestamp: string;
    message: string;
    sender: string;
    group: string;
    me: string;
    appId: string;
}
