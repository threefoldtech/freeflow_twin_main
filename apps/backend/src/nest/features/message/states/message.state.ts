import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import {
    ContactRequest,
    FileMessage,
    GroupUpdate,
    IFileShareMessage,
    SystemMessage,
    SystemMessageType,
} from '../../../types/message-types';
import { ApiService } from '../../api/api.service';
import { ChatGateway } from '../../chat/chat.gateway';
import { ChatService } from '../../chat/chat.service';
import { Chat } from '../../chat/models/chat.model';
import { ContactService } from '../../contact/contact.service';
import { CreateContactDTO } from '../../contact/dtos/contact.dto';
import { QuantumService } from '../../quantum/quantum.service';
import { CreateMessageDTO, MessageDTO } from '../dtos/message.dto';
import { MessageService } from '../message.service';
import { Message } from '../models/message.model';
import {
    AddUserSystemState,
    PersistSystemMessage,
    RemoveUserSystemState,
    SubSystemMessageState,
    UserLeftGroupMessageState,
} from './system-message.state';

export abstract class MessageState<T> {
    abstract handle({ message }: { message: MessageDTO<T>; chat?: Chat }): Promise<unknown>;
}

export class ContactRequestMessageState implements MessageState<ContactRequest> {
    constructor(private readonly _messageService: MessageService, private readonly _contactService: ContactService) {}

    async handle({ message }: { message: MessageDTO<ContactRequest> }): Promise<CreateContactDTO<ContactRequest>> {
        const from = message.body;
        const validSignature = await this._messageService.verifySignedMessage({
            isGroup: false,
            adminContact: null,
            fromContact: from,
            signedMessage: message,
        });
        if (!validSignature) throw new BadRequestException(`failed to verify message signature`);
        return await this._contactService.handleIncomingContactRequest({
            id: from.id,
            location: from.location,
            message: (<unknown>message) as CreateMessageDTO<ContactRequest>,
            contactRequest: true,
        });
    }
}

export class ReadMessageState implements MessageState<string> {
    constructor(private readonly _chatService: ChatService, private readonly _chatGateway: ChatGateway) {}

    async handle({ message }: { message: MessageDTO<string> }): Promise<Chat> {
        this._chatGateway.emitMessageToConnectedClients('message', message);
        return await this._chatService.handleMessageRead(message);
    }
}

export class StringMessageState implements MessageState<string> {
    constructor(private readonly _chatGateway: ChatGateway, private readonly _messageService: MessageService) {}

    async handle({ message }: { message: MessageDTO<string> }): Promise<Message> {
        this._chatGateway.emitMessageToConnectedClients('message', message);
        return await this._messageService.createMessage(message);
    }
}

export class FileMessageState implements MessageState<FileMessage> {
    constructor(private readonly _chatGateway: ChatGateway, private readonly _messageService: MessageService) {}

    async handle({ message }: { message: MessageDTO<FileMessage> }): Promise<Message> {
        this._chatGateway.emitMessageToConnectedClients('message', message);
        return await this._messageService.createMessage(message);
    }
}

export class FileShareMessageState implements MessageState<IFileShareMessage> {
    constructor(
        private readonly _chatGateway: ChatGateway,
        private readonly _messageService: MessageService,
        private readonly _configService: ConfigService,
        private readonly _quantumService: QuantumService
    ) {}

    async handle({ message }: { message: MessageDTO<IFileShareMessage>; chat?: Chat }): Promise<Message> {
        if (message.from === this._configService.get<string>('userId')) return;
        this._chatGateway.emitMessageToConnectedClients('message', message);
        await this._quantumService.createFileShare({ ...message.body, isSharedWithMe: true });
        return await this._messageService.createMessage(message);
    }
}

export class RenameFileShareMessageState implements MessageState<IFileShareMessage> {
    constructor(
        private readonly _chatGateway: ChatGateway,
        private readonly _messageService: MessageService,
        private readonly _quantumService: QuantumService
    ) {}

    async handle({ message, chat }: { message: MessageDTO<IFileShareMessage>; chat?: Chat }) {
        const owner = chat.isGroup ? chat.chatId : message.body.owner.id;
        await this._messageService.renameSharedMessage({ message, chatId: owner });
        const share = await this._quantumService.getShareById({ id: message.body.id });
        if (!share) return;
        if (!chat.isGroup) this._chatGateway.emitMessageToConnectedClients('message', message);
        await this._quantumService.updateShare(share, { ...message.body, isSharedWithMe: true }, true);
    }
}

export class SystemMessageState implements MessageState<SystemMessage> {
    private _subSystemMessageStateHandlers = new Map<SystemMessageType, SubSystemMessageState>();

    constructor(
        private readonly _chatService: ChatService,
        private readonly _configService: ConfigService,
        private readonly _apiService: ApiService,
        private readonly _chatGateway: ChatGateway,
        private readonly _messageService: MessageService
    ) {
        // system add user message handler
        this._subSystemMessageStateHandlers.set(
            SystemMessageType.ADD_USER,
            new AddUserSystemState(
                this._apiService,
                this._chatService,
                this._configService,
                this._chatGateway,
                this._messageService
            )
        );
        // system remove user message handler
        this._subSystemMessageStateHandlers.set(
            SystemMessageType.REMOVE_USER,
            new RemoveUserSystemState(
                this._apiService,
                this._chatService,
                this._configService,
                this._chatGateway,
                this._messageService
            )
        );
        // system joined video room message handler
        this._subSystemMessageStateHandlers.set(
            SystemMessageType.JOINED_VIDEOROOM,
            new PersistSystemMessage(this._messageService)
        );
        // system contact request send message handler
        this._subSystemMessageStateHandlers.set(
            SystemMessageType.CONTACT_REQUEST_SEND,
            new PersistSystemMessage(this._messageService)
        );
        // user leaves group message handler
        this._subSystemMessageStateHandlers.set(
            SystemMessageType.USER_LEFT_GROUP,
            new UserLeftGroupMessageState(
                this._chatService,
                this._configService,
                this._chatGateway,
                this._messageService
            )
        );
        // system default message handler
        this._subSystemMessageStateHandlers.set(
            SystemMessageType.DEFAULT,
            new PersistSystemMessage(this._messageService)
        );
    }

    async handle({ message, chat }: { message: MessageDTO<SystemMessage>; chat: Chat }) {
        // // TODO: fix
        // const validSignature = await this._messageService.verifySignedMessageByChat({ chat, signedMessage: message });
        // if (!validSignature) throw new BadRequestException(`failed to verify message signature`);

        const { type } = message.body as GroupUpdate;
        if (type) return await this._subSystemMessageStateHandlers.get(type).handle({ message, chat });

        return await this._subSystemMessageStateHandlers.get(SystemMessageType.DEFAULT).handle({ message, chat });
    }
}
