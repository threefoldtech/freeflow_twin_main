import { IsNotEmpty, IsString } from 'class-validator';

export class PostIdentificationDto {
    @IsString()
    @IsNotEmpty()
    appId: string;

    @IsString()
    @IsNotEmpty()
    identifier: string;
}

export class PostNotificationDto {
    @IsString()
    @IsNotEmpty()
    timestamp: string;

    @IsString()
    @IsNotEmpty()
    message: string;

    @IsString()
    @IsNotEmpty()
    sender: string;

    @IsString()
    @IsNotEmpty()
    group: string;

    @IsString()
    @IsNotEmpty()
    me: string;

    @IsString()
    @IsNotEmpty()
    appId: string;
}
