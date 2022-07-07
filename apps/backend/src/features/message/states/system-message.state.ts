import { ConfigService } from '@nestjs/config';

import { GroupUpdate, SystemMessage, UserLeftGroupMessage } from '../../../types/message-types';
import { ApiService } from '../../api/api.service';
import { ChatGateway } from '../../chat/chat.gateway';
import { ChatService } from '../../chat/chat.service';
import { Chat } from '../../chat/models/chat.model';
import { MessageDTO } from '../dtos/message.dto';
import { MessageService } from '../message.service';
import { Message } from '../models/message.model';

export abstract class SubSystemMessageState {
    abstract handle({ message, chat }: { message: MessageDTO<SystemMessage>; chat: Chat }): Promise<unknown>;
}

export class AddUserSystemState implements SubSystemMessageState {
    constructor(
        private readonly _apiService: ApiService,
        private readonly _chatService: ChatService,
        private readonly _configService: ConfigService,
        private readonly _chatGateway: ChatGateway,
        private readonly _messageService: MessageService
    ) {}

    async handle({ message, chat }: { message: MessageDTO<SystemMessage>; chat: Chat }): Promise<unknown> {
        const { contact, adminLocation } = message.body as GroupUpdate;
        const userId = this._configService.get<string>('userId');
        if (userId === contact.id)
            return await this._chatService.syncNewChatWithAdmin({ adminLocation, chatId: message.to });

        this._chatGateway.emitMessageToConnectedClients('chat_updated', chat);

        if (chat.isGroup)
            await this._apiService.sendGroupInvitation({ location: contact.location, chat: chat.toJSON() });
        await this._messageService.createMessage(message);
        return await this._apiService.sendMessageToApi({ location: contact.location, message });
    }
}

export class RemoveUserSystemState implements SubSystemMessageState {
    constructor(
        private readonly _apiService: ApiService,
        private readonly _chatService: ChatService,
        private readonly _configService: ConfigService,
        private readonly _chatGateway: ChatGateway,
        private readonly _messageService: MessageService
    ) {}

    async handle({ message, chat }: { message: MessageDTO<SystemMessage>; chat: Chat }) {
        const userId = this._configService.get<string>('userId');
        const { contact } = message.body as GroupUpdate;
        if (contact.id === userId) {
            const { chatId } = chat;
            await this._chatService.deleteChat(chatId);
            this._chatGateway.emitMessageToConnectedClients('chat_removed', chatId);
            return;
        }

        await this._chatService.removeContactFromChat({ chat, contactId: contact.id });
        await this._messageService.createMessage(message);

        this._chatGateway.emitMessageToConnectedClients('chat_updated', chat);
        return await this._apiService.sendMessageToApi({ location: contact.location, message });
    }
}

export class PersistSystemMessage implements SubSystemMessageState {
    constructor(private readonly _messageService: MessageService, private readonly _chatGateway: ChatGateway) {}

    async handle({ message }: { message: MessageDTO<SystemMessage>; chat: Chat }): Promise<Message> {
        this._chatGateway.emitMessageToConnectedClients('message', message);
        return await this._messageService.createMessage(message);
    }
}

export class UserLeftGroupMessageState implements SubSystemMessageState {
    constructor(
        private readonly _chatService: ChatService,
        private readonly _configService: ConfigService,
        private readonly _chatGateway: ChatGateway,
        private readonly _messageService: MessageService
    ) {}

    async handle({ message, chat }: { message: MessageDTO<SystemMessage>; chat: Chat }): Promise<void> {
        const userId = this._configService.get<string>('userId');
        const { contact, nextAdmin } = message.body as UserLeftGroupMessage;
        if (contact.id === userId) {
            await this._chatService.deleteChat(chat.chatId);
            this._chatGateway.emitMessageToConnectedClients('chat_removed', chat.chatId);
            return;
        }
        if (contact.id === chat.adminId && chat.contacts.length > 1) {
            let newAdmin = chat.parseContacts().find(c => c.id === nextAdmin);
            if (!newAdmin) newAdmin = chat.parseContacts().find(c => c.id !== contact.id)[0];
            chat.adminId = newAdmin.id;
        }
        await this._chatService.removeContactFromChat({ chat, contactId: contact.id });
        await this._messageService.createMessage(message);
        this._chatGateway.emitMessageToConnectedClients('chat_updated', chat);
    }
}
