import { IsNotEmpty, IsString } from 'class-validator';

import { MessageType } from '../../../types/message-types';
import { Message } from '../models/message.model';

export class MessageDTO<T> {
    id: string;
    from: string;
    to: string;
    body: T;
    timeStamp: Date;
    type: MessageType;
    subject: string;
    signatures: string[];
    replies: Message[];
}

export class CreateMessageDTO<T> {
    @IsString()
    id: string;

    @IsString()
    from: string;

    @IsString()
    to: string;

    @IsNotEmpty()
    body: T;

    @IsNotEmpty()
    timeStamp: Date;

    @IsNotEmpty()
    type: MessageType;

    subject: string;

    signatures: string[];

    replies: Message[];
}
