import { ConfigService } from '@nestjs/config';

import { GroupUpdate, SystemMessage } from '../../../types/message-types';
import { ApiService } from '../../api/api.service';
import { ChatGateway } from '../../chat/chat.gateway';
import { ChatService } from '../../chat/chat.service';
import { Chat } from '../../chat/models/chat.model';
import { MessageDTO } from '../dtos/message.dto';

export abstract class SubSystemMessageState {
    abstract handle({ message, chat }: { message: MessageDTO<SystemMessage>; chat: Chat }): Promise<unknown>;
}

export class AddUserSystemState implements SubSystemMessageState {
    constructor(
        private readonly _apiService: ApiService,
        private readonly _chatService: ChatService,
        private readonly _configService: ConfigService,
        private readonly _chatGateway: ChatGateway
    ) {}

    async handle({ message, chat }: { message: MessageDTO<SystemMessage>; chat: Chat }): Promise<unknown> {
        const { contact, adminLocation } = message.body as GroupUpdate;
        const userId = this._configService.get<string>('userId');
        if (userId === contact.id)
            return await this._chatService.syncNewChatWithAdmin({ adminLocation, chatId: message.to });

        this._chatGateway.emitMessageToConnectedClients('chat_updated', chat);

        await this._apiService.sendGroupInvitation({ location: contact.location, chat });
        await this._chatService.addMessageToChat({ chat, message });
        return await this._apiService.sendMessageToApi({ location: contact.location, message });
    }
}

export class RemoveUserSystemState implements SubSystemMessageState {
    constructor(
        private readonly _apiService: ApiService,
        private readonly _chatService: ChatService,
        private readonly _configService: ConfigService,
        private readonly _chatGateway: ChatGateway
    ) {}

    async handle({ message, chat }: { message: MessageDTO<SystemMessage>; chat: Chat }) {
        const userId = this._configService.get<string>('userId');
        const { contact } = message.body as GroupUpdate;
        if (contact.id === userId) {
            const { chatId } = chat;
            await this._chatService.deleteChat(chatId);
            this._chatGateway.emitMessageToConnectedClients('chat_removed', chatId);
        }
        this._chatGateway.emitMessageToConnectedClients('chat_updated', chat);

        await this._chatService.removeContactFromChat({ chat, contactId: contact.id });
        await this._chatService.addMessageToChat({ chat, message });
        return await this._apiService.sendMessageToApi({ location: contact.location, message });
    }
}

export class PersistSystemMessage implements SubSystemMessageState {
    constructor(private readonly _chatService: ChatService) {}

    handle({ message, chat }: { message: MessageDTO<SystemMessage>; chat: Chat }): Promise<string> {
        return this._chatService.addMessageToChat({ chat, message });
    }
}
