import { IsArray, IsBoolean, IsString } from 'class-validator';

import { ContactDTO } from '../../contact/dtos/contact.dto';
import { MessageDTO } from '../../message/dtos/message.dto';
import { Message } from '../../message/models/message.model';

export class ChatDTO {
    chatId: string;
    contacts: ContactDTO[];
    messages?: MessageDTO<unknown>[];
    isGroup: boolean;
    name: string;
    acceptedChat: boolean;
    adminId: string;
    read: string[];
    draft?: MessageDTO<unknown>[];
}

export class GroupChatDTO extends ChatDTO {}

export class CreateChatDTO {
    @IsString()
    chatId: string;

    @IsString()
    name: string;

    @IsArray()
    contacts: ContactDTO[];

    @IsBoolean()
    acceptedChat: boolean;

    @IsString()
    adminId: string;

    @IsArray()
    read: string[];

    @IsBoolean()
    isGroup: boolean;

    @IsArray()
    draft?: Message[];
}

export class CreateGroupChatDTO extends CreateChatDTO {}
